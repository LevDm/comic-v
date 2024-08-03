'use client';

import React, { Suspense, useState } from 'react';

import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { Avatar, Button, Grow, LinearProgress, Stack, Typography } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

import { AccountCard, SignInForm, SignUpForm } from '@/components/auth';
import { backgroundGradient } from '@/theme';

const useStyles = makeStyles()((theme) => ({
  background: {
    display: 'flex',
    flexDirection: 'column',
    width: '100vw',
    height: '100dvh',
    maxWidth: '100vw',
    maxHeight: '100dvh',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    background: backgroundGradient(),
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: 400,
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },

  paper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: 400,
    padding: theme.spacing(2),
    margin: '0 auto',
    backgroundColor: `${theme.palette.background.paper}80`,
    backdropFilter: 'blur(10px)',
    borderRadius: theme.shape.borderRadius,
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      padding: theme.spacing(2, 10),
      backgroundColor: 'transparent',
      backdropFilter: 'none',
    },
  },
  titleIcon: {
    backgroundColor: theme.palette.primary.main,
  },
  backContainer: {
    position: 'absolute',
    top: 24,
    left: 0,
    width: '100%',
  },
  backButton: {
    color: theme.palette.text.primary,
    textTransform: 'none',
    alignSelf: 'flex-start',
    left: 0,
    [theme.breakpoints.down('sm')]: {
      left: theme.spacing(9),
    },
  },
}));

const SING_UP_CLOSE = false;

const AccountPage = () => {
  const { classes } = useStyles();

  const [signForm, setSignForm] = useState<'in' | 'up'>('in');

  const singHandler = () => {
    setSignForm((prev) => (prev == 'in' ? 'up' : 'in'));
  };

  const session = useSession();
  const { status } = session;

  const router = useRouter();

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/comics';

  const isLoading = status == 'loading';

  const isAuth = status === 'authenticated';

  const title = (isAuth && 'Аккаунт') || (signForm == 'in' && 'Вход') || (signForm == 'up' && 'Регистрация');

  const onExit = () => {
    if (isAuth) router.replace('/comics');
    else router.replace('/');
  };

  return (
    <main className={classes.background}>
      <Stack className={classes.container} spacing={2}>
        <Grow in={!isLoading}>
          <Button className={classes.backButton} onClick={onExit} size="large" startIcon={<ArrowBackRoundedIcon />}>
            {(isAuth && 'К проектам') || 'На главную'}
          </Button>
        </Grow>

        <Stack className={classes.paper} spacing={2}>
          <Stack direction={'row'} justifyContent={'flex-start'} width={'100%'} alignItems={'center'} spacing={1}>
            <Avatar className={classes.titleIcon} variant="rounded">
              <AccountCircleIcon />
            </Avatar>

            {(isLoading && (
              <Stack width={'100%'} mt={1} borderRadius={10} overflow={'hidden'}>
                <LinearProgress color="secondary" />
              </Stack>
            )) || (
              <Grow in={true}>
                <Typography color={'primary'} component="h1" variant="h5">
                  {title}
                </Typography>
              </Grow>
            )}
          </Stack>

          {!isLoading && (
            <>
              {(isAuth && <AccountCard session={session} />) || (
                <>
                  {signForm == 'in' && <SignInForm callbackUrl={callbackUrl} />}
                  {signForm == 'up' && <SignUpForm callbackUrl={callbackUrl} />}

                  <Button onClick={singHandler} fullWidth disabled={SING_UP_CLOSE}>
                    {(signForm == 'in' && 'У меня нет аккаунта') || (signForm == 'up' && 'У меня есть аккаунт')}
                  </Button>
                </>
              )}
            </>
          )}
        </Stack>
      </Stack>
    </main>
  );
};

export default function Page() {
  return (
    <Suspense>
      <AccountPage />
    </Suspense>
  );
}
