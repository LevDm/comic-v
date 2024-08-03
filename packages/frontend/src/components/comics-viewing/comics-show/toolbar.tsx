'use client';

import React, { useCallback, useEffect, useState } from 'react';

import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PlayDisabledRoundedIcon from '@mui/icons-material/PlayDisabledRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded';
import ZoomInMapRoundedIcon from '@mui/icons-material/ZoomInMapRounded';
import ZoomOutMapRoundedIcon from '@mui/icons-material/ZoomOutMapRounded';
import { Button, ButtonGroup, Stack, Tooltip } from '@mui/material';

import { isUndefined } from 'lodash';
import { makeStyles } from 'tss-react/mui';

import { ShowLinePart } from './show-line-part';

const useStyles = makeStyles()((theme) => ({
  toolbar: {
    minHeight: 40,
    width: '100%',
  },
  control: {
    borderRadius: theme.shape.borderRadius * 2,
    '& span': {
      margin: 0,
    },
  },
}));

interface IShowToolbar {
  isFullscreen?: boolean;
  slidesId: string[];
  slideId: string;
  changeSlide: (id: string) => void;
  changeFullscreen?: () => void;
}

export const ShowToolbar: React.FC<IShowToolbar> = ({
  slidesId,
  slideId,
  isFullscreen = false,
  changeSlide,
  changeFullscreen,
}) => {
  const { classes } = useStyles();

  const [play, setPlay] = useState<boolean>(false);

  const [showLine, setShowLine] = useState<{ id: string; value: number; play: boolean }[]>(
    slidesId.map((id) => ({ id, value: slideId == id ? 100 : 0, play: false })),
  );

  useEffect(() => {
    if (slidesId.toString() != showLine.map((el) => el.id).toString()) {
      const newValue = slidesId.map((id) => ({ id, value: slideId == id ? 100 : 0, play: false }));
      setShowLine(newValue);
      setPlay(false);
      onChange(newValue[0].id);
    }
  }, [slidesId]);

  useEffect(() => {
    const newSlideId = showLine.findLast((item) => item.value > 0 || item.play)?.id;
    if (!isUndefined(newSlideId) && slideId != newSlideId) changeSlide(newSlideId);
  }, [showLine]);

  const prevHandler = () => {
    if (play) setPlay(false);
    setShowLine((prev) => {
      const lastIndex = prev.findLastIndex((item) => item.value > 0 || item.play);
      const newIndex = lastIndex - 1 < 0 ? prev.length - 1 : lastIndex - 1;
      return prev.map((item, index) => ({ ...item, play: false, value: index <= newIndex ? 100 : 0 }));
    });
  };

  const nextHandler = () => {
    if (play) setPlay(false);
    setShowLine((prev) => {
      const lastIndex = prev.findLastIndex((item) => item.value > 0 || item.play);
      const newIndex = lastIndex >= prev.length - 1 ? 0 : lastIndex + 1;
      return prev.map((item, index) => ({ ...item, play: false, value: index <= newIndex ? 100 : 0 }));
    });
  };

  const playHandler = () => {
    if (!play) {
      setPlay(true);
      setShowLine((prev) => {
        const lastIndex = prev.findLastIndex((item) => item.value > 0);
        const newValue = [...prev];
        newValue[lastIndex] = { ...newValue[lastIndex], play: true, value: 0 };
        return newValue;
      });
    } else {
      setPlay(false);
      setShowLine((prev) => {
        const lastIndex = prev.findLastIndex((item) => item.value > 0 || item.play);
        const newValue = [...prev];
        newValue[lastIndex] = { ...newValue[lastIndex], play: false, value: 100 };
        return newValue;
      });
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const { code } = event;
    switch (code) {
      case 'ArrowUp':
      case 'ArrowRight':
        nextHandler();
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        prevHandler();
        break;
      case 'Space':
        playHandler();
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keyup', handleKeyDown, true);
    return () => {
      document.removeEventListener('keyup', handleKeyDown);
    };
  }, [play]);

  const onEnd = useCallback((id: string) => {
    setShowLine((prev) => {
      const partIndex = prev.findLastIndex((item) => item.id == id);
      if (partIndex >= prev.length - 1) {
        return prev.map((item, index) => ({ ...item, play: index === 0, value: 0 }));
      }
      const newValue = [...prev];
      newValue[partIndex] = { ...newValue[partIndex], play: false, value: 100 };
      newValue[partIndex + 1] = { ...newValue[partIndex + 1], play: true, value: 0 };
      return newValue;
    });
  }, []);

  const onChange = useCallback((id: string) => {
    setPlay((prev) => prev && false);
    setShowLine((prev) => {
      const partIndex = prev.findLastIndex((item) => item.id == id);
      return prev.map((item, index) => ({ ...item, play: false, value: index <= partIndex ? 100 : 0 }));
    });
  }, []);

  return (
    <Stack className={classes.toolbar} direction={'row'}>
      <ButtonGroup variant="outlined" aria-label="show-control">
        <Tooltip title="К предыдущему">
          <Button key="prev" startIcon={<SkipPreviousRoundedIcon />} className={classes.control} onClick={prevHandler} />
        </Tooltip>
        <Tooltip title={(play && 'Остановить') || 'Слайд-шоу'}>
          <Button
            key="play"
            startIcon={(play && <PlayDisabledRoundedIcon />) || <PlayArrowRoundedIcon />}
            className={classes.control}
            onClick={playHandler}
          />
        </Tooltip>
        <Tooltip title="К следующему">
          <Button key="next" startIcon={<SkipNextRoundedIcon />} className={classes.control} onClick={nextHandler} />
        </Tooltip>
      </ButtonGroup>
      <Stack direction={'row'} width={'100%'} paddingX={1}>
        {showLine.map((part, index) => (
          <ShowLinePart key={part.id} order={index + 1} onChange={onChange} onEnd={onEnd} {...part} />
        ))}
      </Stack>
      <ButtonGroup variant="outlined" aria-label="view-control">
        <Tooltip title={isFullscreen ? 'Свернуть' : 'На весь экран'}>
          <Button
            key="expand"
            startIcon={(!isFullscreen && <ZoomOutMapRoundedIcon />) || <ZoomInMapRoundedIcon />}
            className={classes.control}
            onClick={changeFullscreen}
          />
        </Tooltip>
      </ButtonGroup>
    </Stack>
  );
};
