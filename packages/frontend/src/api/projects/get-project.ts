'use client';

import { useCallback } from 'react';

import { UseFetch, useFetch } from '../use-fetch';

import { TImageFormat, TImageStyle } from '@/utils/mobx-stores/process-store';

type Parameters = {
  projectId: string;
};

export type RequeiredProject = {
  user_id: string;
  project_id: string;
  theme: string;
  format: TImageFormat;
  style: TImageStyle;
  project_name: string;
  creation_date: string | Date;
  heroes_pull: {
    id: string;
    name: string;
    description: string;
  }[];
  scenes_pull: {
    id: string;
    description: string;
  }[];
  slides: [
    {
      script: string;
      image: string;
      text_on_shot: string;
      heroes: string[];
      scene: string[];
      thesis: string;
    },
  ];
};

type Result = RequeiredProject;

export const useProjetRequest = (props?: UseFetch<Result, string>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const getProject = useCallback(({ projectId }: Parameters, payload: string) => {
    return fetchData(
      `/api/user/project/${projectId}`,
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
    getProject: getProject,
    ...rest,
  };
};
