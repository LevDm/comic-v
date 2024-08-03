import { User } from 'next-auth';


declare module 'next-auth' {
  interface Session {
    user: null | User
    error: null | string;
    access_token: null | string;
    expires_at: null | number;
    refresh_token: null | string;
  }
  interface User {
    token:? {
        access_token: string;
        expires_at: number;
        refresh_token: string;
    }
  } 
}

declare module 'next-auth/jwt' {
  interface JWT {
    provider?: string;
    error?: string;
    access_token?: string;
    expires_at?: number;
    refresh_token?: string;
    user?: User
  }
}
