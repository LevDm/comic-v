'use client';

import React, { useRef, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';

import AddRounded from '@mui/icons-material/AddRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Box, Button, ButtonGroup, Stack, Tooltip, Typography } from '@mui/material';

import { isNull } from 'lodash';
import { observer } from 'mobx-react-lite';
import { enqueueSnackbar } from 'notistack';

import { LoadingLine, useToolsStyles } from '../tools-elements';

import { FramesData, RenderFrames } from './list-item';
import { useSlideDescriptionRequest } from '@/api/generaion-text/use-slide-description-request';
import { useSlideScriptRequest } from '@/api/generaion-text/use-slide-script-request';
import { useThesisRequest } from '@/api/generaion-text/use-thesis-request';
import { useImageRequest } from '@/api/generation-image/use-image-request';
import { useProcessStore } from '@/utils/mobx-stores';
import { TLightSlide } from '@/utils/mobx-stores/process-store';

export const SlidesListController = observer(() => {
  const {
    loading,
    setSelectedSlide,
    selectedSlideData,
    lightSlides,
    refrence,
    theme,
    format,
    style,
    formatNumber,
    setImageToPull,
    addTheses,
    addSlide,
    deleteSlide,
    moveSlide,
    addLoading,
    removeLoading,
    updateSlide,
  } = useProcessStore();
  const slidesV = lightSlides.get();
  const [mode, setMode] = useState<Mode>(null);

  const onChangeMode = (nextMode: Mode) => {
    if (slidesV.length == 0) {
      onAction(0, nextMode);
    } else {
      setMode(nextMode);
    }
  };
  const slideData = selectedSlideData.get();

  const onChange = (itemId: string) => {
    setSelectedSlide(itemId);
  };

  const onDelete = (itemId: string) => {
    deleteSlide(itemId);
  };

  const onMove = (itemId: string) => {
    onChangeMode(mode === 'move' && slideData?.id == itemId ? null : 'move');
  };

  const { getSlideDescription } = useSlideDescriptionRequest({
    onSuccess(result, payload) {
      removeLoading(payload.slideId, 'GD');

      if ((result?.frame_text ?? '').length > 0) {
        updateSlide(payload.slideId, { description: result.frame_text });
      } else {
        enqueueSnackbar({ variant: 'warning', message: '[Слайд]: Ошибка при генерации текста' });
      }
    },
    onError(_, payload) {
      removeLoading(payload.slideId, 'GD');
      enqueueSnackbar({ variant: 'error', message: '[Слайд]: Ошибка при генерации текста' });
    },
  });

  const { getImage } = useImageRequest({
    onSuccess(result: { imageBase64: string }, id: string) {
      if (result.imageBase64.length == 0) {
        enqueueSnackbar({ variant: 'warning', message: '[Картинка]: Возможно, ваш сценарий некоректен' });
      } else {
        try {
          setImageToPull(id, result.imageBase64);
        } catch (e) {
          console.error(e);
        }
      }
      removeLoading(id, 'K');
    },
    onError(_, id) {
      removeLoading(id, 'K');
      enqueueSnackbar({ variant: 'error', message: '[Слайд]: Ошибка при генерации картинки' });
    },
  });

  const { getSlideScript } = useSlideScriptRequest({
    onSuccess(result, payload: { slideId: string; thesesId: string }) {
      removeLoading(payload.slideId, 'GS');
      if ((result?.screenplay ?? '').length > 0) {
        updateSlide(payload.slideId, { script: result.screenplay, thesesId: payload.thesesId });

        addLoading(payload.slideId, 'GD');
        getSlideDescription({ script: result.screenplay }, { slideId: payload.slideId });

        /* 
        addLoading(payload.slideId, 'K');
        getImage(
          {
            theme: theme.get() ?? '',
            script: result.screenplay,
            format: format.get(),
            style: style.get(),
            heroes: [],
            scene: [],
          },
          payload.slideId,
        );
        */
      } else {
        enqueueSnackbar({ variant: 'warning', message: '[Слайд]: Ошибка при генерации сценария' });
      }
    },
    onError(_, payload) {
      removeLoading(payload.slideId, 'GS');
      enqueueSnackbar({ variant: 'error', message: '[Слайд]: Ошибка при генерации сценария' });
    },
  });

  const { isLoading, getThesis } = useThesisRequest({
    onSuccess(result, payload) {
      if ((result?.thesis ?? '').length > 0) {
        const dataTheme = theme.get();
        if (!isNull(dataTheme)) {
          const thesis = addTheses(result.thesis, payload?.index);
          const slide = addSlide(payload?.index, 1)[0];
          setSelectedSlide(slide.id);

          getSlideScript({ theme: dataTheme, theses: thesis.text }, { slideId: slide.id, thesesId: thesis.id });
          addLoading(slide.id, 'GS');

          addLoading(slide.id, 'K');
          getImage(
            {
              theme: theme.get() ?? '',
              script: thesis.text, //result.screenplay,
              format: format.get(),
              style: style.get(),
              heroes: [],
              scene: [],
            },
            slide.id,
          );
        }
      }
    },
    onError() {
      enqueueSnackbar({ variant: 'error', message: '[Слайд]: Ошибка при генерации тезиса' });
    },
  });

  const requestThesis = (payload: { index: number; mode: 'addit' | 'rebuild' }) => {
    const requestTheme = theme.get();
    const theses = refrence.get();
    if (!isNull(requestTheme)) {
      const requestData: { theme: string; prevThesis?: string; nextThesis?: string } = {
        theme: requestTheme,
        prevThesis: theses[payload.index - 1]?.text,
        nextThesis: theses[payload.index + 1]?.text,
      };
      enqueueSnackbar({ variant: 'info', message: '[Слайд]: Генерация слайда' });
      getThesis(requestData, payload);
    }
  };

  const requestSlide = (slideIndex: number) => {
    requestThesis({ index: slideIndex, mode: 'addit' });
  };

  const onAction = (index: number, actionMode?: Mode) => {
    switch (actionMode ?? mode) {
      case 'move':
        if (!isNull(slideData)) moveSlide(slideData.id, index);
        break;
      case 'addit':
        addSlide(index);
        break;
      case 'addit-ai':
        requestSlide(index);
        break;
    }
    onChangeMode(null);
  };

  return (
    <SlidesList
      data={slidesV}
      format={formatNumber.get()}
      selectedItemId={slideData?.id ?? null}
      onChange={onChange}
      onChangeMode={onChangeMode}
      mode={mode}
      onDelete={onDelete}
      onMove={onMove}
      onAction={onAction}
      isLoading={isLoading}
      loading={loading.get()}
    />
  );
});

type Mode = null | 'move' | 'addit' | 'addit-ai';

interface SlidesListProps<T> {
  data: T[];
  selectedItemId: string | null;
  onChange?: (itemId: string) => void;
  onChangeMode?: (value: Mode) => void;
  mode: Mode;
  format: number;
  onDelete?: (itemId: string) => void;
  onMove?: (itemId: string) => void;
  onAction?: (index: number) => void;
  loading?: { api: 'G' | 'K'; slideId: string }[];
  isLoading?: boolean;
}

type Item = TLightSlide;

export const SlidesList: React.FC<SlidesListProps<Item>> = (props) => {
  const {
    data,
    selectedItemId,
    mode,
    onChange,
    loading = [],
    isLoading = false,
    format,
    onAction,
    onChangeMode,
    onDelete,
    onMove,
  } = props;

  const { classes } = useToolsStyles();

  const listRef = useRef<FixedSizeList | null>(null);

  const modeHandler = (nextMode: Mode) => {
    onChangeMode?.(nextMode);
  };

  const itemClick = (itemId: string) => {
    onChange?.(itemId);
  };

  const itemDeleteClick = (itemId: string) => {
    onDelete?.(itemId);
  };

  const itemMoveClick = (itemId: string) => {
    onMove?.(itemId);
  };

  const itemActionClick = (index: number) => {
    onAction?.(index);
  };

  return (
    <Stack flexGrow={1} direction={'column'} gap={2}>
      <CreateSlideButton onChange={modeHandler} mode={mode} isLoading={loading.length > 0 || isLoading} />
      <Box sx={{ height: '100%', width: '100%', padding: 0 }}>
        <AutoSizer>
          {({ height, width }) => (
            <FixedSizeList
              layout="vertical"
              ref={listRef}
              className={classes.list}
              height={height}
              width={width}
              itemCount={data.length}
              itemSize={(width - 6) / format + 58}
              itemData={
                {
                  selectedItemId: selectedItemId,
                  onClick: itemClick,
                  slides: data,
                  loading: loading,
                  format: format,
                  mode,
                  onDelete: itemDeleteClick,
                  onMove: itemMoveClick,
                  onAction: itemActionClick,
                } as FramesData<Item>
              }
            >
              {RenderFrames}
            </FixedSizeList>
          )}
        </AutoSizer>
      </Box>
    </Stack>
  );
};

const CreateSlideButton: React.FC<{ onChange: (nextMode: Mode) => void; mode: Mode; isLoading: boolean }> = ({
  onChange,
  mode,
  isLoading,
}) => {
  const { classes } = useToolsStyles();
  const addHandler = () => {
    onChange('addit');
  };

  const addAIHandler = () => {
    onChange('addit-ai');
  };

  const closeHandler = () => {
    onChange(null);
  };

  return (
    <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
      <Typography color="primary">Слайды</Typography>
      <LoadingLine visible={isLoading} />
      <ButtonGroup variant="outlined">
        <Tooltip title={'Добавить пустой слайд без контекста'}>
          <Button
            onClick={addHandler}
            disabled={!isNull(mode) || isLoading}
            startIcon={<AddRounded />}
            className={classes.control}
          />
        </Tooltip>
        <Tooltip title={'Сгенерировать слайд'}>
          <Button
            onClick={addAIHandler}
            disabled={!isNull(mode) || isLoading}
            startIcon={<AutoFixHighRoundedIcon />}
            className={classes.control}
          />
        </Tooltip>
        {!isNull(mode) && (
          <Tooltip title="Отменить">
            <Button startIcon={<CloseRoundedIcon />} className={classes.control} onClick={closeHandler} />
          </Tooltip>
        )}
      </ButtonGroup>
    </Stack>
  );
};
