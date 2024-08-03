'use client';

import { useCallback } from 'react';

import { UseFetch, useFetch } from '../use-fetch';

type Parameters = {
  projectId: string;
};

type Result = string;

export const useDeleteProjetRequest = (props?: UseFetch<Result, string>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const deleteProject = useCallback(({ projectId }: Parameters, id: string) => {
    return fetchData(
      `/api/user/project/${projectId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      id,
    );
  }, []);

  return {
    deleteProject: deleteProject,
    ...rest,
  };
};
