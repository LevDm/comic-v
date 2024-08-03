'use client';

import * as React from 'react';

import CloseFullscreenRoundedIcon from '@mui/icons-material/CloseFullscreenRounded';
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import { Divider, IconButton, Stack, Tooltip } from '@mui/material';

import { TPaths } from '../pages';

import { useFullscreen } from '@/utils';

export const FullscreenSwitch: React.FC<{ path: TPaths }> = ({ path }) => {
  const [isFullscreen, toggleFullscreen] = useFullscreen();

  const target = path === '/comics/constructor';

  if (!target && !isFullscreen) return null;

  return (
    <Stack direction={'row'} sx={{ display: { sm: 'none', md: 'flex' } }} alignItems={'center'}>
      <Divider orientation="vertical" flexItem sx={{ marginY: 1.5, marginX: 1 }} />
      <Tooltip title="На весь экран">
        <IconButton onClick={toggleFullscreen} color="secondary">
          {(isFullscreen && <CloseFullscreenRoundedIcon />) || <OpenInFullRoundedIcon />}
        </IconButton>
      </Tooltip>
    </Stack>
  );
};
