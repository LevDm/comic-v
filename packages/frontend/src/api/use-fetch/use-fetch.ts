'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { getSession, signOut } from 'next-auth/react';

import { enqueueSnackbar } from 'notistack';

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? '';

export type UseFetch<T, P = undefined> = {
  withAuth?: boolean;
  isBlob?: boolean;
  onSuccess?(result: T, payload: P): void;
  onError?(error: string, payload: P): void;
};

export const useFetch = <T, P>({ onSuccess, onError, withAuth = false, isBlob = false }: UseFetch<T, P> = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const isTriedRefresh = useRef(false);

  const getSessionData = useCallback(async (resetLoading?: boolean) => {
    setIsLoading(true);
    const res = await getSession();
    if (resetLoading ?? false) {
      setIsLoading(false);
    }
    return res;
  }, []);

  const abortController = useRef<AbortController | null>(null);
  const abortController0 = useRef<AbortController | null>(null);

  const fetchData = useCallback(
    async (input: RequestInfo | URL, init?: RequestInit, payload?: P) => {
      let data: T | null = null;

      const controller = new AbortController();
      const controller0 = new AbortController();

      try {
        const session = await getSessionData();
        const { access_token, refresh_token, expires_at } = session ?? { access_token: null };

        if (abortController.current) {
          //abortController.current.abort();
        }

        if (abortController0.current) {
          // abortController0.current.abort();
        }

        abortController.current = controller;
        abortController0.current = controller0;

        let token = withAuth ? access_token ?? null : null;

        const getFetchQuery = () =>
          fetch(`${BASE_URL}${input}`, {
            ...init,
            ...(withAuth && {
              headers: {
                ...init?.headers,
                Authorization: `Bearer ${token}`,
              },
              signal: abortController.current?.signal,
            }),
          });

        const refreshTokens = () =>
          fetch(`${BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            body: null,
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${refresh_token}` },
            signal: abortController0.current?.signal,
          });

        if (Date.now() > (expires_at ?? 0) && withAuth && !isTriedRefresh.current) {
          const res = await refreshTokens();
          const tokens_a = await res.json();

          if (res.ok) {
            token = tokens_a.access_token;
          } else {
            enqueueSnackbar({ variant: 'info', message: 'Время сеанса истекло' });
            signOut({ redirect: false });
          }
        }
        const response = await getFetchQuery();

        if (!response.ok) {
          const error: { message: string } = await response.json();
          throw new Error(error.message);
        }

        isTriedRefresh.current = false;
        abortController.current = null;
        abortController0.current = null;

        try {
          if (isBlob) {
            console.warn(response.headers.get('content-disposition'));
            const blob = await response.blob();
            const href = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = href;
            link.setAttribute('download', `project-${payload}.zip`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else {
            data = await response.json();
          }
        } catch (error) {
          data = null;
        }

        onSuccess?.(data as T, payload as P);
        setData(data);
      } catch (error) {
        //abortController.current?.abort();
        abortController.current = null;
        abortController0.current = null;
        setError(error as Error);

        if (onError && error instanceof Error) {
          onError(error?.message, payload as P);
        } else {
          console.error(error);
          throw error;
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }

      return data;
    },
    [onSuccess, onError],
  );

  useEffect(() => {
    return () => {
      abortController.current?.abort();
      abortController0.current?.abort();
    };
  }, []);

  return { isLoading, isError: !!error, error, data, fetchData, getSessionData };
};
