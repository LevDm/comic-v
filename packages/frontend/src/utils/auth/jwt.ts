import type { Account, User } from 'next-auth';
import type { AdapterUser } from 'next-auth/adapters';
import type { JWT } from 'next-auth/jwt';

import { refreshAccessToken } from './refresh-token';

interface JwtCallback {
  token: JWT;
  user: User | AdapterUser;
  account: Account | null;
}

type Token = {
  access_token?: string;
  expires_at?: number;
  refresh_token?: string;
  provider?: string;
  user?: User;
  error?: string;
};

export async function jwt(params: JwtCallback): Promise<Token> {
  const { token, user, account } = params;
  //console.log('JWT');

  if (account) {
    const baseRes = {
      provider: account.provider,
      user,
    };

    if (account.provider == 'credentials') {
      //console.log('JWT INIT custom');
      try {
        const access = user.token ?? {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (user as any).token;

        return {
          ...access,
          provider: account.provider,
          user,
        };
      } catch (e) {
        console.error(e);
      }
    }
    return baseRes;
  }

  if (Date.now() > (token.expires_at ?? 0)) {
    return refreshAccessToken(token);
  }

  return token;
}
