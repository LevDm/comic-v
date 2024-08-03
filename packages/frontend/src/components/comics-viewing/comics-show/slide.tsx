'use client';

import React from 'react';

import Image from 'next/image';

import { Box, Typography } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

import { backgroundWatermark } from '@/theme';

const useStyles = makeStyles<{ offset: number; format: number }>()((theme, { offset, format }) => ({
  container: {
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    flexDirection: 'column',
    display: 'flex',
    width: '100%',
    height: '100%',
    maxHeight: `calc(100dvh - ${offset}px)`,
    maxWidth: `calc((100dvh - ${offset}px) * ${format})`,
    aspectRatio: format,
    ...backgroundWatermark(),
  },
  image: {
    display: 'flex',
    flex: 1,
    position: 'relative',
  },
  imageTitle: {
    position: 'absolute',
    bottom: 0,
    minHeight: 50,
    textAlign: 'center',
    width: '100%',
    backgroundColor: '#000000a0',
    padding: theme.spacing(1, 4),
    zIndex: 3,
  },
}));

export const Slide: React.FC<{ format?: number; image?: string | null; description?: string | null; isFullscreen?: boolean }> = ({
  image,
  format = 1.33,
  description,
  isFullscreen = false,
}) => {
  const offset = isFullscreen ? 16 + 40 : 32 + 80 + 24 + 76;
  const { classes } = useStyles({ offset: offset, format: format });

  return (
    <Box className={classes.container}>
      <div className={classes.image}>
        <Image src={`data:image/png;base64,${image ?? ''}`} alt="" fill />
        {(description?.length ?? 0) > 0 && <Typography className={classes.imageTitle}>{description ?? ''}</Typography>}
      </div>
    </Box>
  );
};
