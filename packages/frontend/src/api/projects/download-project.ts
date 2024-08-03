'use client';

import { useCallback } from 'react';

import { UseFetch, useFetch } from '../use-fetch';

type Parameters = {
  projectId: string;
};

type Result = null;

export const useDownloadProjetRequest = (props?: UseFetch<Result, string>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true, isBlob: true });

  const downloadZIP = useCallback(({ projectId }: Parameters, id: string) => {
    return fetchData(
      `/api/user/download_comic/${projectId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/zip',
        },
      },
      id,
    );
  }, []);

  return {
    downloadZIP: downloadZIP,
    ...rest,
  };
};
