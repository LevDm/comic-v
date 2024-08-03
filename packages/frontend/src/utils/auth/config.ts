import type { AuthOptions } from 'next-auth';
import NextAuth from 'next-auth';
import type { User } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { jwt } from './jwt';
import { session } from './session';
import { signIn } from './sign-in';

type Credential = Record<'id' | 'name' | 'email' | 'access_token' | 'expires_at' | 'refresh_token', string>;

const options: AuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 3 * 1 * 60 * 60, //days * hours * minutes * seconds
  },

  providers: [
    Credentials({
      credentials: {
        id: { label: 'id', type: 'text', required: true },
        email: { label: 'email', type: 'email', required: true },
        name: { label: 'name', type: 'text', required: true },
        access_token: {
          label: 'access_token',
          type: 'text',
          required: true,
        },
        expires_at: {
          label: 'expires_at',
          type: 'text',
          required: true,
        },
        refresh_token: {
          label: 'refresh_token',
          type: 'text',
          required: true,
        },
      },
      authorize: async (credentials: Credential | undefined) => {
        if (!credentials?.email || !credentials?.id) return null;
        //console.log('cred', credentials);
        const user: User = {
          id: credentials.id,
          email: credentials.email,
          name: credentials.name,
          token: {
            access_token: credentials.access_token,
            expires_at: parseInt(credentials.expires_at),
            refresh_token: credentials.refresh_token,
          },
        };
        return user;
      },
    }),
  ],

  callbacks: {
    signIn: signIn,
    jwt: jwt,
    session: session,
  },
  pages: {
    signIn: '/account',
  },
};

export default NextAuth(options);
