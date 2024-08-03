import type { JWT } from 'next-auth/jwt';

//import { BASE_URL } from '@/api/use-fetch';

export async function refreshAccessToken(token: JWT): Promise<JWT> {
  //console.log('refreshAccessToken');
  try {
    //const expires_in = Math.floor(Date.now() / 1000) + 2 * 1000;

    //const tokens = { ...token };
    /* 
     const { refresh_token } = token;
    console.log('tokens');

    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      body: null,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${refresh_token}` },
    });
    const tokens_a = await res.json();
    console.log('tokens_a', tokens_a);
*/
    const result: JWT = {
      ...token,
      //access_token: tokens.access_token,
      //expires_at: expires_in * 1000, // (tokens.expires_as as number) + 5000 * 1000,
      //refresh_token: tokens.refresh_token ?? token.refresh_token,
      error: undefined,
    };
    return result;
  } catch (error) {
    console.error(error);
    const resError: JWT = {
      ...token,
      error: 'Refresh access token',
    };
    return resError;
  }
}
