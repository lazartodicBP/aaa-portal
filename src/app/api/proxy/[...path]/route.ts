import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.BILLING_PLATFORM_API_URL || 'https://my.billingplatform.com/membership_demo/rest/2.0';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const searchParams = request.nextUrl.searchParams;
  const sessionId = request.headers.get('sessionid');

  let fullUrl: string;

  if (path.startsWith('hostedPayments/')) {
    const hppBaseUrl = process.env.HPP_BASE_URL || 'https://my.billingplatform.com/membership_demo';
    fullUrl = `${hppBaseUrl}/${path}?${searchParams}`;
  } else {
    fullUrl = `${API_BASE_URL}/${path}?${searchParams}`;
  }

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (sessionId) {
      headers['sessionid'] = sessionId;
    }

    const response = await fetch(fullUrl, {
      headers,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const body = await request.json();
  const sessionId = request.headers.get('sessionid');

  let fullUrl: string;

  // Check if this is an HPP endpoint
  if (path.startsWith('hostedPayments/')) {
    // HPP endpoints use a different base URL
    const hppBaseUrl = process.env.HPP_BASE_URL || 'https://my.billingplatform.com/membership_demo';
    fullUrl = `${hppBaseUrl}/${path}`;
  } else {
    // Regular API endpoints including /query
    fullUrl = `${API_BASE_URL}/${path}`;
  }

  console.log('Proxy POST:', {
    path,
    fullUrl,
    sessionId: sessionId ? 'present' : 'none',
    // Log SQL query if it's a query endpoint
    ...(path === 'query' && { sql: body.sql })
  });

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Don't add session ID for login endpoint
    if (sessionId && path !== 'login') {
      headers['sessionid'] = sessionId;
    }

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const responseText = await response.text();

    try {
      const data = JSON.parse(responseText);
      return NextResponse.json(data, { status: response.status });
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON response', details: responseText },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Proxy POST error:', error);
    return NextResponse.json(
      { error: 'Failed to post data' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const body = await request.json();
  const sessionId = request.headers.get('sessionid');

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (sessionId) {
      headers['sessionid'] = sessionId;
    }

    const response = await fetch(
      `${API_BASE_URL}/${path}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update data' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const body = await request.json();
  const sessionId = request.headers.get('sessionid');

  const fullUrl = `${API_BASE_URL}/${path}`;

  console.log('Proxy PUT:', {
    path,
    fullUrl,
    sessionId: sessionId ? 'present' : 'none',
    body
  });

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (sessionId) {
      headers['sessionid'] = sessionId;
    }

    const response = await fetch(fullUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    console.log('PUT response:', data);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update data' },
      { status: 500 }
    );
  }
}