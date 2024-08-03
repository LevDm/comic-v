'use client';

import { useCallback } from 'react';

import { UseFetch, useFetch } from '../use-fetch';

import { TImageFormat, TImageStyle } from '@/utils/mobx-stores/process-store';

type Parameters = {
  theme?: string;
  format: TImageFormat;
  style: TImageStyle;
  script: string;
  scene: string[];
  heroes: { name: string; description: string }[];
};

type Img = {
  imageBase64: string;
};

export const useImageRequest = (props?: UseFetch<Img, string>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const getImage = useCallback(({ script, scene, format, heroes, style, theme }: Parameters, id: string) => {
    return fetchData(
      `/api/kandinsky`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ script, scene, format, style, heroes, theme }),
      },
      id,
    );
  }, []);

  return {
    getImage: getImage,
    ...rest,
  };
};
