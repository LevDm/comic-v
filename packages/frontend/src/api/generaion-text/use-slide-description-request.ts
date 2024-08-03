'use client';

import { useCallback } from 'react';

import { UseFetch, useFetch } from '../use-fetch';

type Parameters = {
  script: string;
};

type Payload = { slideId: string };

type Data = {
  frame_text: string;
};

export const useSlideDescriptionRequest = (props?: UseFetch<Data, Payload>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const getSlideDescription = useCallback(({ script }: Parameters, payload: Payload) => {
    return fetchData(
      `/api/gigachat/frame_text`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ screenplay: script }),
      },
      payload,
    );
  }, []);

  return {
    getSlideDescription: getSlideDescription,
    ...rest,
  };
};
