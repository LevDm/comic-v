'use client';

import { useCallback } from 'react';

import { UseFetch, useFetch } from '../use-fetch';

type Parameters = {
  theme: string;
  theses: string[];
};

type Data = {
  scenes_pull: string[];
  heroes_pull: { name: string; description: string }[];
};

export const useSlidesDetailsRequest = (props?: UseFetch<Data, undefined>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const getSlidesDetails = useCallback(({ theme, theses }: Parameters) => {
    return fetchData(`/api/gigachat/scene_hero`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ theme: theme, theses: theses }),
    });
  }, []);

  return {
    getSlidesDetails: getSlidesDetails,
    ...rest,
  };
};
