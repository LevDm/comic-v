'use client';

import { useCallback } from 'react';

import { UseFetch, useFetch } from '../use-fetch';

type Parameters = {
  email: string;
  password: string;
};

type Data = {
  user_id: string;
  email: string;
  username: string;
  token: {
    access_token: string;
    expires_at: string;
    refresh_token: string;
  };
};

export const useSignInRequest = (props?: UseFetch<Data, undefined>) => {
  const { fetchData, ...rest } = useFetch(props);

  const signInUser = useCallback((userData: Parameters) => {
    return fetchData(`/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
  }, []);

  return {
    signInUser,
    ...rest,
  };
};
