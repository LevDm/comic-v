'use client';

import React, { useState } from 'react';

import { Backdrop, Box, Grow, Modal, Stack, Typography } from '@mui/material';

import { Slide } from './slide';
import { ShowToolbar } from './toolbar';
import { TLightSlide } from '@/utils/mobx-stores/process-store';

interface IComicsShow {
  format?: number;
  slides?: TLightSlide[];
  title?: string | null;
}

export const ComicsShow: React.FC<IComicsShow> = (props) => {
  const { slides, title, format } = props;

  const [visibleModal, setVisibleModal] = useState<boolean>(false);

  const onClose = () => {
    setVisibleModal(false);
  };

  const show = () => {
    setVisibleModal((prev) => !prev);
  };

  return (
    <>
      <ShowTool {...props} slides={slides} changeFullscreen={show} title={title} />
      <ComicsModalShow
        slides={slides}
        format={format}
        open={visibleModal}
        changeFullscreen={show}
        onClose={onClose}
        title={title}
      />
    </>
  );
};

interface IShowTool extends IComicsShow {
  changeFullscreen?: () => void;
  isFullscreen?: boolean;
}

const ShowTool: React.FC<IComicsShow & IShowTool> = (props) => {
  const { slides = [], isFullscreen, changeFullscreen, title, format } = props;

  const [slideId, setSlide] = useState<string>(slides[0]?.id);

  const changeSlide = (id: string) => {
    if (slideId != id) setSlide(id);
  };

  const slide = slides.find((slide) => slide.id == slideId);

  return (
    <Grow in={true}>
      <Stack
        direction={'column'}
        sx={{ flexGrow: 1, height: '100%', justifyContent: 'center', alignItems: 'center', gap: 1, position: 'relative' }}
      >
        <Slide {...slide} isFullscreen={isFullscreen} format={format} />
        <ShowToolbar
          slidesId={slides.map((s) => s.id)}
          slideId={slideId}
          changeSlide={changeSlide}
          isFullscreen={isFullscreen}
          changeFullscreen={changeFullscreen}
        />
        {(title?.length ?? 0) > 0 && (
          <Box
            sx={{
              position: 'absolute',
              height: '30px',
              backgroundColor: '#000000a0',
              top: 0,
              left: 0,
              borderBottomRightRadius: 18,
              paddingX: 2,
            }}
          >
            <Typography>{title}</Typography>
          </Box>
        )}
      </Stack>
    </Grow>
  );
};

interface IComicsModalShow extends IShowTool {
  open: boolean;
  onClose: () => void;
}

export const ComicsModalShow: React.FC<IComicsModalShow> = (props) => {
  const { open, onClose, changeFullscreen, slides, format, title } = props;
  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          style: {
            backgroundColor: 'black',
          },
          timeout: 500,
        },
      }}
      sx={{ display: 'flex' }}
    >
      <Box
        sx={{
          margin: 'auto',
          padding: 1,
          //width: '100%',
          height: '100%',
          maxWidth: '100dvw',
          maxHeight: `calc((100dvw + 40px + 24px) * 0.75)`,
        }}
      >
        <ShowTool
          slides={slides}
          format={format}
          isFullscreen={open}
          changeFullscreen={changeFullscreen ?? onClose}
          title={title}
        />
      </Box>
    </Modal>
  );
};
