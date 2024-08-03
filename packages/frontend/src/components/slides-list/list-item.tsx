'use client';

import React, { useCallback, useMemo } from 'react';

import Image from 'next/image';

import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DragHandleRoundedIcon from '@mui/icons-material/DragHandleRounded';
import MenuOpenRoundedIcon from '@mui/icons-material/MenuOpenRounded';
import PlaylistAddRoundedIcon from '@mui/icons-material/PlaylistAddRounded';
import {
  Box,
  Button,
  ButtonBase,
  ButtonGroup,
  Fade,
  Grow,
  IconButton,
  ListItem,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';

import { isNull } from 'lodash';
import { makeStyles } from 'tss-react/mui';

import { LoadingLine, useToolsStyles } from '../tools-elements';

import { backgroundWatermark } from '@/theme';
import { TLightSlide } from '@/utils/mobx-stores/process-store';

export const useStyles = makeStyles()((theme) => ({
  itemContainer: {
    padding: 0,
    paddingRight: 6,
    display: 'flex',
    flexDirection: 'column',
  },
  itemSize: {
    height: '100%',
    width: '100%',
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
  },
  itemClicabled: {
    height: '100%',
    width: '100%',
    flexGrow: 1,
    display: 'flex',
    alignItems: 'stretch',
    flexDirection: 'column',
    cursor: 'pointer',
  },
}));

type Item = TLightSlide;

export type FramesData<T> = {
  onClick: (id: string) => void;
  slides: T[];
  selectedItemId: string | null;
  mode: Mode;
  format: number;
  onDelete: (id: string) => void;
  onMove: (id: string) => void;
  onAction: (index: number) => void;
  loading: { api: API; slideId: string }[];
};

interface IFrames<T> {
  data: FramesData<T>;
  index: number;
  style: React.CSSProperties;
}

type Mode = null | 'move' | 'addit' | 'addit-ai';
type ActionPosition = null | 'head' | 'foot' | 'head-f';

interface IFrame<T> {
  item: T;
  isSelected: boolean;
  style: React.CSSProperties;

  actionPosition: ActionPosition;

  onClick: () => void;

  isLoading: API[];
  isThirdLoading: boolean;
  format: number;
  mode: Mode;
  onDelete: () => void;
  onMove: () => void;
  onAction: (offset?: number) => void;
}

interface FrameToolBarProps<T> extends Pick<IFrame<T>, 'isThirdLoading' | 'isLoading' | 'onDelete' | 'onMove'> {}

const FrameToolBar: React.FC<FrameToolBarProps<Item>> = (props) => {
  const { isLoading, onDelete, onMove, isThirdLoading } = props;
  const { classes: toolsClasses } = useToolsStyles();

  return (
    <Grow in={true}>
      <Stack direction={'row'} flexGrow={1} height={'50px'} sx={{ paddingX: 1, paddingY: '5px' }}>
        <ButtonGroup variant="outlined">
          <Tooltip title="Удалить слайд">
            <Button
              disabled={isLoading.length > 0 || isThirdLoading}
              startIcon={<DeleteOutlineRoundedIcon />}
              className={toolsClasses.control}
              onClick={onDelete}
            />
          </Tooltip>
        </ButtonGroup>

        <LoadingLine visible={isLoading.length > 0} api={isLoading} />

        <ButtonGroup variant="outlined">
          <Tooltip title="Переместить слайд">
            <Button
              disabled={isLoading.length > 0 || isThirdLoading}
              startIcon={<DragHandleRoundedIcon />}
              className={toolsClasses.control}
              onClick={onMove}
            />
          </Tooltip>
        </ButtonGroup>
      </Stack>
    </Grow>
  );
};

const Frame: React.FC<IFrame<Item>> = (props) => {
  const {
    style,
    onClick,
    isSelected,
    item,
    mode,
    actionPosition,
    isLoading,
    format,
    onDelete,
    onMove,
    onAction,
    isThirdLoading,
  } = props;

  const { classes } = useStyles();
  const { classes: toolsClasses } = useToolsStyles();

  const { image, description } = item;

  const height = parseInt(String(style.height ?? 308), 10) - 50 - 8;

  const renderAction = (pos: ActionPosition) => {
    const clickAction = () => {
      const offset = (mode === 'addit' || mode === 'addit-ai') && (pos === 'foot' || pos === 'head-f') ? 1 : 0;
      onAction(offset);
    };

    return (
      <Grow in={true}>
        <Box
          sx={{
            minHeight: '50px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Tooltip title={`${mode === 'addit' || mode === 'addit-ai' ? 'Добавить' : 'Переместить'} сюда`}>
            <IconButton onClick={clickAction} sx={{ minHeight: 40 }}>
              {((mode === 'addit' || mode === 'addit-ai') && <PlaylistAddRoundedIcon />) || <MenuOpenRoundedIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Grow>
    );
  };

  return (
    <Grow in={true}>
      <ListItem className={classes.itemContainer} style={style}>
        {actionPosition === 'head-f' && (
          <div style={{ position: 'absolute', bottom: -58, height: 50, width: 'calc(100% - 6px)' }}>{renderAction('head-f')}</div>
        )}
        {(actionPosition === 'head' || actionPosition === 'head-f') && renderAction('head')}

        <Paper className={`${classes.itemSize} ${isSelected && toolsClasses.solidFrame}`}>
          {mode !== 'addit' && mode !== 'addit-ai' && (isNull(mode) || isSelected) && (
            <FrameToolBar isThirdLoading={isThirdLoading} isLoading={isLoading} onDelete={onDelete} onMove={onMove} />
          )}

          <ButtonBase className={`${classes.itemClicabled} `} onClick={onClick}>
            <Box flex={1} sx={{ justifyContent: 'center', display: 'flex', alignItems: 'flex-start' }}>
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  maxWidth: height * format,
                  maxHeight: height,
                  aspectRatio: format,
                  position: 'relative',
                  overflow: 'hidden',

                  borderRadius: 16,

                  ...backgroundWatermark(),
                }}
              >
                {image && <Image src={`data:image/png;base64,${image}`} alt="" fill />}

                {(description?.length ?? 0) > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      //minHeight: 60,
                      maxHeight: '40%',
                      width: '100%',
                      backgroundColor: '#00000080',
                      //bottom: 0,
                      padding: [0, 1, 1],
                      transition: 'all 0.4s ease',
                      bottom: 0,
                      '&:hover': {
                        maxHeight: '100%',
                        transform: 'translate(0%, 0%)',
                      },
                    }}
                  >
                    <Fade in={(description?.length ?? 0) > 0}>
                      <Typography
                        sx={{
                          fontSize: '0.8rem',
                          maxHeight: '100%',
                          overflow: 'hidden',
                          textWrap: 'wrap',
                          textOverflow: 'ellipsis',
                          textAlign: 'center',
                        }}
                      >
                        {description}
                      </Typography>
                    </Fade>
                  </Box>
                )}
              </div>
            </Box>
          </ButtonBase>
        </Paper>

        {actionPosition === 'foot' && renderAction('foot')}
      </ListItem>
    </Grow>
  );
};

const MFrame = React.memo(Frame, (prev, next) => {
  const equal = JSON.stringify(prev) == JSON.stringify(next);
  return equal;
});
type API = 'G' | 'K';
export const RenderFrames: React.FC<IFrames<Item>> = (props) => {
  const { data, index, style } = props;
  const { onClick, slides, selectedItemId, loading, mode, format, onMove, onDelete, onAction } = data;
  const item = slides[index];

  //console.log(item);

  const clickHandler = useCallback(() => {
    onClick(item.id);
  }, [onClick, item]);

  const moveHandler = useCallback(() => {
    onMove(item.id);
  }, [onMove, item]);

  const deleteHandler = useCallback(() => {
    onDelete(item.id);
  }, [onMove, item]);

  const isFirst = index === 0;

  const isLoading = Object.keys(
    loading.reduce((acc, value) => (value.slideId == item.id ? { ...acc, [value.api]: true } : acc), {} as Record<API, boolean>),
  ) as API[];

  const actionPosition = useMemo<ActionPosition>(() => {
    const isLast = index === slides.length - 1;

    const selectedIndex = slides.findIndex((el) => el.id == selectedItemId);

    switch (mode) {
      case 'addit':
      case 'addit-ai':
        return isLast ? 'head-f' : 'head';
      case 'move':
        return index > selectedIndex ? 'foot' : index === selectedIndex ? null : 'head';
      default:
        return null;
    }
  }, [slides, selectedItemId, mode, index]);

  const actionHandler = useCallback(
    (offset?: number) => {
      onAction(index + (offset ?? 0));
    },
    [onMove, index],
  );

  return (
    <MFrame
      style={{ ...style, paddingTop: isFirst ? 0 : 8 }}
      item={item}
      isSelected={item.id == selectedItemId}
      onClick={clickHandler}
      actionPosition={actionPosition}
      isThirdLoading={loading.length > 0}
      isLoading={isLoading}
      mode={mode}
      format={format}
      onAction={actionHandler}
      onDelete={deleteHandler}
      onMove={moveHandler}
    />
  );
};
