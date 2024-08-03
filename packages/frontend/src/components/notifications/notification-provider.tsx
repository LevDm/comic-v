'use client';

import { SnackbarProvider } from 'notistack';

import { Notification } from './notification';

export const NotificationProvider = () => (
  <SnackbarProvider
    maxSnack={3}
    autoHideDuration={3000}
    anchorOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    Components={{
      error: Notification,
      success: Notification,
      info: Notification,
      warning: Notification,
    }}
  />
);
