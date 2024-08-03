/* eslint-disable react/display-name */
'use client';

import { forwardRef } from 'react';

import { Alert } from '@mui/material';

import { CustomContentProps, SnackbarContent } from 'notistack';

/* eslint-disable react/display-name */

/* eslint-disable react/display-name */

/* eslint-disable react/display-name */

/* eslint-disable react/display-name */

const colors: Record<'error' | 'default' | 'info' | 'success' | 'warning', 'error' | 'info' | 'success' | 'warning'> = {
  error: 'error',
  warning: 'warning',
  success: 'success',
  info: 'info',
  default: 'info',
};

const severitys: Record<'error' | 'default' | 'info' | 'success' | 'warning', 'error' | 'info' | 'success' | 'warning'> = {
  error: 'error',
  warning: 'warning',
  success: 'success',
  info: 'info',
  default: 'info',
};

export const Notification = forwardRef<HTMLDivElement, CustomContentProps>((props, ref) => {
  const { id, message, variant, ...other } = props;

  const severity = (() => {
    return severitys[variant];
  })();

  const color = colors[variant];

  return (
    <SnackbarContent {...other} id={id?.toString() ?? ''} ref={ref} role="alert" style={{ justifyContent: 'flex-end' }}>
      <Alert
        severity={severity}
        variant="outlined"
        sx={{ minWidth: 288, backgroundColor: '#26233280', backdropFilter: 'blur(10px)' }}
        color={color}
      >
        {message}
      </Alert>
    </SnackbarContent>
  );
});
