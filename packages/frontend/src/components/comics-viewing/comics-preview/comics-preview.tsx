'use client';

import React from 'react';

import Image from 'next/image';

import { Box, Grow, SxProps, Theme, Typography } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

import { backgroundWatermark } from '@/theme';
import { TLightSlide } from '@/utils/mobx-stores/process-store';

const getClipPath = (format: number, order: number, all: number) => {
  if (all === 3) {
    if (order == 1) {
      if (format == 1) {
        return 'polygon(0 0, 5% 0, 49% 100%, 0% 100%)';
      } else if (format > 1.5) {
        return 'polygon(0 0, 25% 0, 49% 100%, 0% 100%)';
      } else if (format == 0.8) {
        return 'polygon(0 9%, 0% 9%, 49% 100%, 0% 100%)';
      } else if (format == 0.75) {
        return 'polygon(0 12%, 0% 12%, 49% 100%, 0% 100%)';
      } else if (format < 0.75) {
        return 'polygon(0 32%, 0% 32%, 49% 100%, 0% 100%)';
      }
      return 'polygon(0 0, 16% 0, 49% 100%, 0% 100%)';
      //
    } else if (order == 2) {
      if (format == 1) {
        return 'polygon(7% 0, 93%  0, 50% 98%, 50% 98%)';
      } else if (format > 1.5) {
        return 'polygon(27% 0, 73%  0, 50% 98%, 50% 98%)';
      } else if (format == 0.8) {
        return 'polygon(-3% 0, 103%  0, 50% 98%, 50% 98%)';
      } else if (format == 0.75) {
        return 'polygon(-5% 0, 105%  0, 50% 98%, 50% 98%)';
      } else if (format < 0.75) {
        return 'polygon(-21% 0, 121%  0, 50% 98%, 50% 98%)';
      }
      return 'polygon(18% 0, 82%  0, 50% 98%, 50% 98%)';
      //
    } else if (order == 3) {
      if (format == 1) {
        return 'polygon(95% 0, 100% 0, 100% 100%, 51% 100%)';
      } else if (format > 1.5) {
        return 'polygon(75% 0, 100% 0, 100% 100%, 51% 100%)';
      } else if (format == 0.8) {
        return 'polygon(100% 9%, 100% 12%, 100% 100%, 51% 100%)';
      } else if (format == 0.75) {
        return 'polygon(100% 12%, 100% 12%, 100% 100%, 51% 100%)';
      } else if (format < 0.75) {
        return 'polygon(100% 32%, 100% 12%, 100% 100%, 51% 100%)';
      }
      return 'polygon(84% 0, 100% 0, 100% 100%, 51% 100%)';
    }
  }
  return 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)';
};

const useStyles = makeStyles<{ format: number }, 'activators'>()((theme, { format }, classes) => ({
  container: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'row',
    aspectRatio: format, //'4/3',
    ...backgroundWatermark(),
    [`&:hover .${classes.activators}`]: {
      '&:not(:hover)': {
        opacity: 0,
      },
    },
  },

  description: {
    position: 'absolute',
    padding: 8,
    backgroundColor: '#000000a0',
    borderRadius: 8,
    transition: 'all 0.6s ease',
    width: '96%',
    maxHeight: 120,
    overflow: 'hidden',
    textAlign: 'justify',
    opacity: 0,
    fontSize: '1rem',
    bottom: 8,
    left: '50%',
    transform: 'translate(-50%, 110%)',
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.7rem',
    },
  },

  description_1_1: {
    //maxWidth: '98%',
  },

  description_2_1: {
    //maxWidth: '198%',
  },
  description_2_2: {
    //maxWidth: '198%',
  },

  description_3_1: {
    //width: '96%',
  },
  description_3_2: {
    //width: '298%',
  },
  description_3_3: {
    //width: '298%',
  },

  activators: {
    transition: 'all 0.8s ease',
    flex: 1,
    height: '100%',
    ':hover': {
      opacity: 1,
      '& div': {
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        opacity: 1,
        '& p': {
          opacity: 1,
          transform: 'translate(-50%, 0)',
        },
      },
    },
  },
  image: {
    position: 'absolute',
    height: '100%',
    opacity: 1,
    width: '100%',
    pointerEvents: 'none',
    transition: 'all 0.6s ease',
  },

  image_1_1: {
    left: 0,
    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
  },

  image_2_1: {
    left: 0,
    clipPath: 'polygon(0 0, 39% 0, 59% 100%, 0% 100%)',
  },
  image_2_2: {
    right: 0,
    clipPath: 'polygon(41% 0, 100% 0, 100% 100%, 61%  100%)',
  },

  image_3_1: {
    left: 0,
    clipPath: getClipPath(format, 1, 3),
  },
  image_3_2: {
    left: 0,
    clipPath: getClipPath(format, 2, 3),
  },
  image_3_3: {
    right: 0,
    clipPath: getClipPath(format, 3, 3),
  },
}));

interface IComicsPreview {
  slides?: TLightSlide[];
  format?: number;
  sx?: SxProps<Theme>;
}

export const ComicsPreview: React.FC<IComicsPreview> = ({ slides = [], format = 1.33, sx }) => {
  const { classes } = useStyles({ format });

  const imagesCount = Math.min(slides.length, 3);

  const bloks = new Array(imagesCount);

  const imagesCN = [...bloks].map((_, index) => `image_${imagesCount}_${1 + index}`);
  const descriptionsCN = [...bloks].map((_, index) => `description_${imagesCount}_${1 + index}`);

  const parts = [...bloks].map((_, index) => ({
    key: `img-${index}`,
    cnImage: classes[imagesCN[index] as keyof typeof classes],
    cnDescription: classes[descriptionsCN[index] as keyof typeof classes],
    image: slides[index].image ?? '',
    description: slides[index].description ?? '',
  }));

  return (
    <Grow in={true}>
      <Box className={classes.container} sx={sx}>
        {parts.map(({ key, cnImage, cnDescription, image, description }) => (
          <div key={key} className={classes.activators}>
            <div className={`${classes.image} ${cnImage}`}>
              <Image src={`data:image/png;base64,${image}`} alt="" fill />
              {description.length > 0 && (
                <Typography className={`${classes.description} ${cnDescription}`}>{description}</Typography>
              )}
            </div>
          </div>
        ))}
      </Box>
    </Grow>
  );
};
