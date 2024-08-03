'use client';

import { useCallback } from 'react';

import { isString } from 'lodash';
import { enqueueSnackbar } from 'notistack';

export const useWithNotification = () => {
  const withNotification = useCallback(
    <A extends unknown[], R>(
      fn: (...args: A) => R,
      {
        errorMsg,
        successMsg,
      }: { errorMsg?: string | ((error: Error, ...args: A) => string); successMsg?: string | ((...args: A) => string) },
    ) => {
      return async (...args: A) => {
        try {
          const result = await fn(...args);
          if (successMsg) {
            const message = isString(successMsg) ? successMsg : successMsg(...args);
            enqueueSnackbar({ variant: 'success', message });
          }

          return result;
        } catch (error) {
          if (errorMsg) {
            const message = isString(errorMsg) ? errorMsg : errorMsg(error as Error, ...args);
            enqueueSnackbar({ variant: 'error', message });
          }
        }
      };
    },
    [],
  );

  return { withNotification };
};
