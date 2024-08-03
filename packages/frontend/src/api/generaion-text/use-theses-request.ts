'use client';

import { useCallback } from 'react';

import { UseFetch, useFetch } from '../use-fetch';

type Parameters = {
  theme: string;
};

type Data = {
  theses: string[];
};

export const useThesesRequest = (props?: UseFetch<Data, undefined>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const getTheses = useCallback(({ theme }: Parameters) => {
    return fetchData(`/api/gigachat/theses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ theme: theme }),
    });
  }, []);

  return {
    getTheses: getTheses,
    ...rest,
  };
};
