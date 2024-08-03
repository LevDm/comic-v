'use client';

import { useCallback } from 'react';

import { isUndefined } from 'lodash';

import { UseFetch, useFetch } from '../use-fetch';

import { TImageFormat, TImageStyle } from '@/utils/mobx-stores/process-store';

type Project = {
  project_id: string;
  theme: string;
  format: TImageFormat;
  style: TImageStyle;
  project_name: string;
  creation_date: string | Date;
  slides: [
    {
      image: string;
      text_on_shot: string;
    },
  ];
};

type Result = Project[];

export const useProjetsRequest = (props?: UseFetch<Result, undefined>) => {
  const { getSessionData, fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const getProjects = useCallback(async () => {
    const session = await getSessionData();
    const userId = session?.user?.id;
    if (isUndefined(userId)) console.error('user-id !');
    return fetchData(`/api/user/${userId}/projects`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }, []);

  return {
    getProjects: getProjects,
    ...rest,
  };
};
