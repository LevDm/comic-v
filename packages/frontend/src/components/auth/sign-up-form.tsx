'use client';

import React from 'react';
import { useForm } from 'react-hook-form';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { Button, Grid, Grow, Stack, TextField } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

import { useSignUpRequest } from '@/api/auth';
import { useSignInRequest } from '@/api/auth/use-sign-in-request';

type User = {
  username: string;
  email: string;
  password: string;
};
export const SignUpForm: React.FC<{ callbackUrl: string }> = () => {
  const router = useRouter();

  const { register, handleSubmit, setError, formState } = useForm<User>({
    mode: 'onBlur',
    shouldUseNativeValidation: false,
    reValidateMode: 'onChange',
    defaultValues: {
      username: '',
      password: '',
      email: '',
    },
  });

  const { isLoading: siginLoading, signInUser } = useSignInRequest({
    onSuccess(result) {
      const formatUser = {
        id: result.user_id,
        name: result.username,
        email: result.email,
        ...result.token,
        expires_at: `${parseInt(result.token.expires_at) * 1000}`,
      };
      /*signIn('credentials', { ...formatUser, redirect: false });*/

      setTimeout(async () => {
        const res = await signIn('credentials', { ...formatUser, redirect: false });
        if (res?.ok) {
          router.replace('/comics');
        }
      }, 500);
    },
    onError() {
      setError('email', { type: 'custom' });
      setError('password', { type: 'custom' });
    },
  });

  const { errors } = formState;

  const { signUpUser, isLoading } = useSignUpRequest({
    onSuccess: async (result) => {
      signInUser({ email: result.email, password: result.password });
    },
    onError: (error: unknown) => {
      console.error(error);
      setError('email', { type: '.ru' });
    },
  });

  return (
    <Grow in={true}>
      <Stack
        component={'form'}
        onSubmit={handleSubmit(signUpUser)}
        noValidate
        justifyContent={'space-between'}
        flex={1}
        gap={2}
        alignItems={'center'}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              {...register('username', { required: 'Обязательное поле' })}
              helperText={errors.username?.message}
              error={!!errors.username}
              label="Имя"
              type="text"
              required
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              {...register('email', { required: 'Обязательное поле' })}
              helperText={errors.email?.message}
              error={!!errors.email}
              label="Email"
              type="email"
              required
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              {...register('password', { required: 'Обязательное поле' })}
              helperText={errors.password?.message}
              error={!!errors.password}
              label="Пароль"
              type="password"
              required
              fullWidth
            />
          </Grid>
        </Grid>
        <Button
          startIcon={isLoading || siginLoading ? <CircularProgress color="info" size={16} /> : undefined}
          type="submit"
          variant="contained"
          disabled={isLoading || siginLoading}
          fullWidth
        >
          Зарегистрироваться
        </Button>
      </Stack>
    </Grow>
  );
};
