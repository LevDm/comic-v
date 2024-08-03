'use client';

import { SessionProvider } from 'next-auth/react';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => (
  <SessionProvider
    //refetchInterval={1 * 60}
    refetchOnWindowFocus={true}
  >
    {children}
  </SessionProvider>
);
