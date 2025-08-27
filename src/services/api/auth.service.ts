import axios from 'axios';

export class AuthService {
  private static sessionId: string | null = null;

  static async fetchSessionId(username: string, password: string): Promise<string> {
    try {
      // Use proxy route instead of direct API call
      const response = await axios.post(
        '/api/proxy/login',
        {
          username,
          password
        }
      );

      const loginData = response.data.loginResponse[0];

      if (loginData.ErrorCode === '0' && loginData.SessionID) {
        this.sessionId = loginData.SessionID;
        return loginData.SessionID;
      } else {
        throw new Error(loginData.ErrorText?.join(', ') || 'Login failed');
      }
    } catch (error: any) {
      console.error('Failed to fetch session ID:', error);
      throw error;
    }
  }

  static getSessionId(): string | null {
    return this.sessionId;
  }

  static setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
  }

  static clearSession(): void {
    this.sessionId = null;
  }

  static async ensureSession(): Promise<string | null> {
    if (this.sessionId) {
      return this.sessionId;
    }

    try {
      const username = process.env.NEXT_PUBLIC_USER || 'your.username';
      const password = process.env.NEXT_PUBLIC_PASSWORD || 'your.password';
      return await this.fetchSessionId(username, password);
    } catch (error) {
      console.error('Failed to ensure session:', error);
      return null;
    }
  }
}