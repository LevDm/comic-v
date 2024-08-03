import type { Metadata } from 'next';

import { CssBaseline } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { ThemeProvider } from '@mui/material/styles';

import './globals.css';
import { NotificationProvider } from '@/components';
import { ResponsiveAppBar } from '@/components';
import { AuthProvider } from '@/components/auth/auth-provider';
import { theme } from '@/theme';
import { StoreProvider } from '@/utils/mobx-stores';

export const metadata: Metadata = {
  title: 'ComicV',
  description: 'Сервис для создания комиксов с помощью Kandinsky и GigaChat',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </head>
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <NotificationProvider />
            <AuthProvider>
              <ResponsiveAppBar />
              <StoreProvider>{children}</StoreProvider>
            </AuthProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
