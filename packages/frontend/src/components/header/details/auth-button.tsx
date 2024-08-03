'use client';

import * as React from 'react';

import { User } from 'next-auth';

import { Avatar, Button, CircularProgress, Tooltip } from '@mui/material';

import { isUndefined } from 'lodash';

interface IAuthButton {
  isLoading: boolean;
  user?: User | null;
  onClick: (v: string) => void;
}

export const AuthButton: React.FC<IAuthButton> = ({ isLoading, user, onClick }) => {
  const nameParts = user?.name?.toLocaleUpperCase().split(' ');
  const symbols = isUndefined(nameParts) ? `😉` : `${nameParts[0][0]}${nameParts.length > 1 ? nameParts[1][0] : ''}`;

  const clickHandler = () => {
    onClick('/account');
  };

  return (
    <Tooltip title={!isUndefined(user) ? 'Аккаунт' : ''}>
      <Button
        disabled={isLoading}
        onClick={clickHandler}
        variant="outlined"
        color="secondary"
        size="large"
        sx={{
          textTransform: 'capitalize',
          paddingY: 0,
          paddingX: !isLoading && isUndefined(user) ? 1 : 0,
          minWidth: 40,
          minHeight: 40,
        }}
      >
        {(isLoading && <CircularProgress size={16} color="secondary" />) ||
          (!isUndefined(user) && (
            <Avatar variant="rounded" sx={{ backgroundColor: 'transparent', fontWeight: 'bold', color: 'secondary.main' }}>
              {symbols}
            </Avatar>
          )) ||
          'Начать'}
      </Button>
    </Tooltip>
  );
};
