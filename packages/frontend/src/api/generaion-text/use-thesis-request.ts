'use client';

import { useCallback } from 'react';

import { UseFetch, useFetch } from '../use-fetch';

type Parameters = {
  theme: string;
  prevTesis?: string;
  nextThesis?: string;
};

type Data = {
  thesis: string;
};

type Payload = {
  index: number;
  mode: 'addit' | 'rebuild';
};

export const useThesisRequest = (props?: UseFetch<Data, Payload>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const getThesis = useCallback(({ theme, prevTesis, nextThesis }: Parameters, payload: Payload) => {
    return fetchData(
      `/api/gigachat/thesis_generation`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme: theme,
          ...(prevTesis && { previous_thesis: prevTesis }),
          ...(nextThesis && { next_thesis: nextThesis }),
        }),
      },
      payload,
    );
  }, []);

  return {
    getThesis: getThesis,
    ...rest,
  };
};
