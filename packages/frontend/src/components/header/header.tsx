'use client';

import * as React from 'react';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';

import { AppBar, Container, Toolbar } from '@mui/material';

import { AuthButton, FullscreenSwitch, LogoTitle, PagesMenu, PagesTabs } from './details';
import { PAGES, TPaths } from './pages';

export function ResponsiveAppBar() {
  const session = useSession();
  const { data, status } = session;

  const isLoading = status === 'loading';

  const path = usePathname() as TPaths;

  const router = useRouter();

  if (path === '/account') {
    return null;
  } else if (status === 'unauthenticated' && ['/comics', '/comics/constructor'].includes(path)) {
    router.replace('/account');
  }

  const pageChange = (path: string) => {
    router.replace(path);
  };

  return (
    <AppBar position="fixed">
      <Container maxWidth="xl" sx={{ display: 'flex', width: '100%', flexDirection: 'row', height: 60 }}>
        <Toolbar disableGutters sx={{ flexGrow: 1, justifyContent: 'space-between', height: 60 }}>
          <LogoTitle onClick={pageChange} />
          {data && (
            <>
              <PagesMenu path={path} pages={PAGES} onChange={pageChange} />
              <PagesTabs path={path} pages={PAGES} onChange={pageChange} />
            </>
          )}
          <AuthButton isLoading={isLoading} user={data?.user} onClick={pageChange} />
        </Toolbar>
        <FullscreenSwitch path={path} />
      </Container>
    </AppBar>
  );
}
