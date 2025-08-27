import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.BILLING_PLATFORM_API_URL || 'https://my.billingplatform.com/membership_demo/rest/2.0';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const searchParams = request.nextUrl.searchParams;
  const sessionId = request.headers.get('sessionid');

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (sessionId) {
      headers['sessionid'] = sessionId;
    }

    const response = await fetch(
      `${API_BASE_URL}/${path}?${searchParams}`,
      {
        headers,
      }
    );

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

  console.log('Proxy POST:', {
    path,
    body,
    sessionId,
    fullUrl: `${API_BASE_URL}/${path}`
  });

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Don't add session ID for login endpoint
    if (sessionId && path !== 'login') {
      headers['sessionid'] = sessionId;
    }

    const response = await fetch(
      `${API_BASE_URL}/${path}`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
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