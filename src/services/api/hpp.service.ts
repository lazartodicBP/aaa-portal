import { AuthService } from './auth.service';

export class HPPService {
  private static hppToken: string | null = null;

  static async getSecurityToken(): Promise<string | null> {
    // Return cached token if available
    if (this.hppToken) {
      console.log('Using cached HPP token');
      return this.hppToken;
    }

    const sessionId = AuthService.getSessionId();
    if (!sessionId) {
      console.error('No session ID available for HPP token');
      return null;
    }

    const hppUrl = process.env.NEXT_PUBLIC_HPP_URL;
    if (!hppUrl) {
      console.error('NEXT_PUBLIC_HPP_URL is not defined');
      return null;
    }

    const requestUrl = `/api/proxy/hostedPayments/1.0/authenticate-session`;

    try {
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'sessionid': sessionId, // lowercase as per API requirement
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        console.error('HPP token fetch failed:', response.status);
        return null;
      }

      const data = await response.json();
      this.hppToken = data?.accessToken?.content || null;
      console.log('HPP token obtained:', this.hppToken);

      return this.hppToken;
    } catch (error) {
      console.error('Error fetching HPP token:', error);
      return null;
    }
  }

  static clearToken(): void {
    this.hppToken = null;
  }
}