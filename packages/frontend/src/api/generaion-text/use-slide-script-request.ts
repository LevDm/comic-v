'use client';

import { useCallback } from 'react';

import { UseFetch, useFetch } from '../use-fetch';

type Parameters = {
  theme: string;
  theses: string;
};

type Payload = { slideId: string; thesesId: string };

type Data = {
  screenplay: string;
};

export const useSlideScriptRequest = (props?: UseFetch<Data, Payload>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const getSlideScript = useCallback(({ theses, theme }: Parameters, payload: Payload) => {
    return fetchData(
      `/api/gigachat/screenplay`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theses: theses, theme: theme }),
      },
      payload,
    );
  }, []);

  return {
    getSlideScript: getSlideScript,
    ...rest,
  };
};
