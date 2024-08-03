'use client';

import React from 'react';
import { useForm } from 'react-hook-form';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { Button, Grid, Grow, Stack, TextField } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

import { useSignInRequest } from '@/api/auth/use-sign-in-request';
import { SignInUser } from '@/types/user';

export const SignInForm: React.FC<{ callbackUrl: string }> = ({ callbackUrl }) => {
  const router = useRouter();

  const { register, handleSubmit, setError, formState } = useForm<SignInUser>({
    mode: 'onBlur',
    shouldUseNativeValidation: false,
    reValidateMode: 'onChange',
    defaultValues: {
      password: '',
      email: '',
    },
  });

  const { errors } = formState;

  const { isLoading, signInUser } = useSignInRequest({
    onSuccess(result) {
      const formatUser = {
        id: result.user_id,
        name: result.username,
        email: result.email,
        ...result.token,
        expires_at: `${parseInt(result.token.expires_at) * 1000}`,
      };
      /*signIn('credentials', { ...formatUser, redirect: false });*/
      //console.log(formatUser);

      setTimeout(async () => {
        const res = await signIn('credentials', { ...formatUser, redirect: false });
        if (res?.ok) {
          router.replace(callbackUrl);
        }
      }, 500);
    },
    onError() {
      setError('email', { type: 'custom' });
      setError('password', { type: 'custom' });
    },
  });

  return (
    <Grow in={true}>
      <Stack
        component={'form'}
        onSubmit={handleSubmit(signInUser)}
        noValidate
        justifyContent={'space-between'}
        flex={1}
        gap={2}
        alignItems={'center'}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              {...register('email', { required: 'Обязательное поле' })}
              error={!!errors.email}
              helperText={errors.email?.message}
              label="Email"
              type="email"
              required
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              {...register('password', { required: 'Обязательное поле' })}
              error={!!errors.password}
              helperText={errors.password?.message}
              label="Пароль"
              type="password"
              required
              fullWidth
            />
          </Grid>
        </Grid>
        <Button
          startIcon={isLoading ? <CircularProgress color="info" size={16} /> : undefined}
          type="submit"
          variant="contained"
          disabled={isLoading}
          fullWidth
        >
          Войти
        </Button>
      </Stack>
    </Grow>
  );
};
