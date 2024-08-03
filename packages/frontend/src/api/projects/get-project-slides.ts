'use client';

import { useCallback } from 'react';

import { UseFetch, useFetch } from '../use-fetch';

type Parameters = {
  projectId: string;
};

type Slide = {
  image: string;
  text_on_shot: string;
};

type Result = Slide[];
type Payload = { id: string; inPlayer?: boolean; inModal?: boolean };
export const useProjetSlidesRequest = (props?: UseFetch<Result, Payload>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const getProjectSlides = useCallback(({ projectId }: Parameters, payload: Payload) => {
    return fetchData(
      `/api/user/project/${projectId}/slides`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      payload,
    );
  }, []);

  return {
    getProjectSlides: getProjectSlides,
    ...rest,
  };
};
