import type { Session } from 'next-auth';
import type { AdapterUser } from 'next-auth/adapters';
import type { JWT } from 'next-auth/jwt';

interface SessionCallback {
  session: Session;
  token: JWT;
  user: AdapterUser;
}

export async function session(params: SessionCallback): Promise<Session> {
  const { session: data, token } = params;
  //console.log('SESSION', params);

  if (token) {
    try {
      const newData: Session = {
        ...data,
        user: token.user ?? null,
        access_token: token.access_token ?? null,
        expires_at: token.expires_at ?? null,
        refresh_token: token.refresh_token ?? null,
        error: token.error ?? null,
      };
      //console.log('newSession', newData);
      return newData;
    } catch (e) {
      console.error(e);
    }
  }

  return data;
}
