import React, { useState } from 'react';

import Image from 'next/image';

import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import { Backdrop, Box, ButtonBase, Grow, Modal } from '@mui/material';

import { isNull } from 'lodash';
import { makeStyles } from 'tss-react/mui';

import { TOptions } from '../types';

import { useToolsStyles } from '@/components/tools-elements';
import { backgroundWatermark } from '@/theme';

export const useStyles = makeStyles<{ format: number }>()((theme, { format }) => ({
  generalImage: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    display: 'flex',
    aspectRatio: format,
    flex: 1,
    height: 'fit-content',
    maxHeight: 'calc(100dvh - 60px - 16px - 40px - 16px - 160px - 16px - (16px + 40px) - 16px)',
    maxWidth: `calc((100dvh - 60px - 16px - 40px - 16px - 160px - 16px - (16px + 40px) - 16px) * ${format})`,
    width: 'fit-content',
  },
  modalImage: {
    position: 'absolute',
    maxWidth: '98vw',
    maxHeight: '98vh',
    ...(format > 1 ? { width: '100%' } : { height: '100%' }),
    display: 'flex',
    flexGrow: 1,
    aspectRatio: format,
    background: 'black',
    alignSelf: 'center',
    placeSelf: 'center',
    //justifySelf: 'center',
    pointerEvents: 'none',
    overflow: 'hidden',
    borderRadius: theme.shape.borderRadius,
  },
}));

export const GeneralFrame: React.FC<{
  targetItem: null | TOptions;
  disabledDashed: boolean;
  format: number;
  children?: React.ReactNode;
}> = ({ targetItem, disabledDashed, format, children = null }) => {
  const { classes } = useStyles({ format: format });
  const { classes: toolsClasses } = useToolsStyles();

  return (
    <div
      className={`${isNull(targetItem) && !disabledDashed && toolsClasses.dashedFrame} ${classes.generalImage}`}
      style={{
        ...(isNull(targetItem) && {
          maxWidth: '100%',
          maxHeight: '100%',
          aspectRatio: 'auto',
          height: '100%',
          width: '100%',
          ...(!isNull(targetItem) && { ...backgroundWatermark() }),
        }),
      }}
    >
      {(isNull(targetItem) && children) || <ImageView targetItem={targetItem} format={format} />}
    </div>
  );
};

interface IImageView {
  targetItem: null | TOptions;
  format: number;
}
const ImageView: React.FC<IImageView> = ({ targetItem, format }) => {
  const { classes } = useStyles({ format: format });

  const [open, setOpen] = useState<boolean>(false);

  const onZoom = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Grow in={true}>
        <ButtonBase sx={{ height: '100%', width: '100%' }} onClick={onZoom}>
          <Image src={`data:image/png;base64,${targetItem?.image}`} alt="" fill />
          <div
            style={{
              height: 30,
              width: 30,
              borderRadius: 15,
              backgroundColor: 'black',
              position: 'absolute',
              top: 12,
              left: 12,
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.5,
            }}
          >
            <ZoomInRoundedIcon fontSize={'small'} />
          </div>
        </ButtonBase>
      </Grow>
      <Modal
        open={open}
        onClose={onClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
            sx: {
              backdropFilter: 'blur(10px)',
            },
          },
        }}
        sx={{ display: 'grid' }}
      >
        <Grow in={open} timeout={500}>
          <Box className={classes.modalImage}>
            <Image src={`data:image/png;base64,${targetItem?.image}`} alt="" fill />
          </Box>
        </Grow>
      </Modal>
    </>
  );
};
