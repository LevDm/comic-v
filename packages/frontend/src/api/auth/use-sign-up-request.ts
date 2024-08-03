'use client';

import { useCallback } from 'react';

import { UseFetch, useFetch } from '../use-fetch';

type Parameters = {
  username: string;
  email: string;
  password: string;
};

type Data = Parameters;

export const useSignUpRequest = (props?: UseFetch<Data, undefined>) => {
  const { fetchData, ...rest } = useFetch(props);

  const signUpUser = useCallback((userData: Parameters) => {
    return fetchData('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
  }, []);

  return {
    signUpUser,
    ...rest,
  };
};
