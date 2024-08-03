/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';

import { signOut } from 'next-auth/react';

import { Avatar, Box, Button, Grow, Stack, Typography } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-explicit-any */

const useStyles = makeStyles()((theme) => ({
  avatar: {
    border: 'solid',
    borderWidth: 1.6,
    borderColor: theme.palette.primary.main,
  },
}));

export const AccountCard: React.FC<{ session: any }> = ({ session }) => {
  const { classes } = useStyles();

  const { data } = session;

  const user = data?.user;

  return (
    <Grow in={true}>
      <Stack spacing={4} alignItems={'center'} width={'100%'} justifyContent={'space-between'} flex={1}>
        <Stack flexDirection={'row'} gap={2} width={'100%'} alignItems={'center'}>
          <Avatar className={classes.avatar} src={user?.image ?? undefined} alt={user?.name ?? undefined} variant="rounded" />
          <Box>
            <Typography>{user?.name ?? 'Имя не указано'}</Typography>
            <Typography>{user?.email ?? 'Почта не указана'}</Typography>
          </Box>
        </Stack>
        <Button variant="outlined" onClick={() => signOut({ redirect: false })} fullWidth>
          Выйти из аккаунта
        </Button>
      </Stack>
    </Grow>
  );
};
