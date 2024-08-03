'use client';

import React, { useEffect, useRef, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';

import { Box, Button, Paper, Stack } from '@mui/material';

import { isNull, isUndefined } from 'lodash';
import { observer } from 'mobx-react-lite';
import { enqueueSnackbar } from 'notistack';
import { makeStyles } from 'tss-react/mui';

import { LoadingLine, useToolsStyles } from '../tools-elements';

import { GeneralFrame, OptionsButtonGroup, RenderFrames, SelectedButtonGroup } from './elements';
import { TOptions } from './types';
import { useImageRequest } from '@/api/generation-image/use-image-request';
import { useProcessStore } from '@/utils/mobx-stores';

const useStyles = makeStyles()(() => ({
  options: {
    maxHeight: 'calc(100dvh - 60px - 16px - 40px - 16px - 160px - 16px - (16px + 40px + 20px) - 16px)',
    height: '98%',
    width: 175,
    padding: 0,
  },
}));

type Img = {
  imageBase64: string;
};

const MAX_IMAGES = 10;

export const ImageSelectorController = observer(() => {
  const {
    imagesPull,
    selectedSlideData,
    removeImageToPull,
    loadingStackK,
    updateSlide,
    addLoading,
    removeLoading,
    setImageToPull,
    theme,
    format,
    style,
    formatNumber,
  } = useProcessStore();

  const onSuccess = (result: Img, id: string) => {
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
  };

  const { getImage } = useImageRequest({
    onSuccess: onSuccess,
    onError(_, id) {
      removeLoading(id, 'K');
      enqueueSnackbar({ variant: 'error', message: '[Картинка]: Ошибка при генерации картинки' });
    },
  });

  const slideData = selectedSlideData.get();
  if (isNull(slideData)) return null;

  const requestImage = () => {
    let script = '';
    if ((slideData.script?.length ?? 0) > 0) {
      script = slideData.script ?? '';
    } else if ((slideData.theses?.text?.length ?? 0) > 0) {
      script = slideData.theses?.text ?? '';
    } else if ((slideData.description?.length ?? 0) > 0) {
      script = slideData.description ?? '';
    }

    if (script.length >= 2) {
      addLoading(slideData.id, 'K');
      getImage(
        {
          theme: theme.get() ?? '',
          script: script,
          format: format.get(),
          style: style.get(),
          heroes: slideData.heroesItems.map((el) => ({ description: el.description, name: el.name })),
          scene: slideData.scenesItems.map((el) => el.description),
        },
        slideData.id,
      );
    }
  };

  const images = imagesPull.get()[slideData.id] ?? [];

  const updateSelected = (itemId: string | null) => {
    updateSlide(slideData.id, { imageId: itemId });
  };

  const clickItem = (itemId: string) => {
    updateSelected(itemId);
  };

  const clickAdd = () => {
    requestImage();
  };

  const clickDelete = (itemId: string) => {
    removeImageToPull(slideData.id, itemId);
  };

  const resetDelete = (item: TOptions) => {
    if (item.image) {
      setImageToPull(slideData.id, item.image);
    }
  };

  const isLoad = !isUndefined(loadingStackK.get().find((el) => el == slideData.id));

  const addDisabled =
    loadingStackK.get().length > 0 ||
    images.length >= MAX_IMAGES ||
    ((slideData.script?.length ?? 0) <= 0 &&
      (slideData.theses?.text?.length ?? 0) <= 0 &&
      (slideData.description?.length ?? 0) <= 0);

  return (
    <Paper sx={{ display: 'flex', overflow: 'hidden', flexGrow: images.length > 0 ? 0 : 1 }}>
      <ImageSelector
        data={images}
        isLoading={isLoad}
        addDisabled={addDisabled}
        selected={slideData.imageItem}
        clickItem={clickItem}
        clickAdd={clickAdd}
        clickDelete={clickDelete}
        resetDelete={resetDelete}
        format={formatNumber.get()}
      />
    </Paper>
  );
});

interface ImageSelector<T> {
  data: T[];
  format: number;
  isLoading: boolean;
  addDisabled: boolean;
  selected: null | T;
  clickItem: (value: string) => void;
  clickAdd: () => void;
  clickDelete: (value: string) => void;
  resetDelete: (value: T) => void;
}

export const ImageSelector: React.FC<ImageSelector<TOptions>> = observer((props) => {
  const { data, isLoading, clickItem, selected, clickAdd, clickDelete, resetDelete, addDisabled, format } = props;

  const history = useRef<TOptions[]>([]);
  const saveDelete = useRef<TOptions | null>(null);

  const [selectedItem, setSelectedItem] = useState<TOptions | null>(selected);

  useEffect(() => {
    history.current = isNull(saveDelete.current) ? [] : [saveDelete.current];

    if (selectedItem?.id != selected?.id) {
      setSelectedItem(selected);
    }
  }, [selected]);

  const clickItemHandler = (item: TOptions) => {
    setSelectedItem((prev) => {
      if (!isNull(prev)) history.current = [prev, item];
      return item;
    });
    clickItem(item.id);
    saveDelete.current = null;
  };

  const clickDeleteHandler = () => {
    if (!isNull(selectedItem)) {
      saveDelete.current = selectedItem;
      clickDelete(selectedItem.id);
    }
  };
  const clickPrevHandler = (historyItem: TOptions) => {
    if (!isNull(saveDelete.current)) {
      const item = saveDelete.current;
      saveDelete.current = null;
      history.current = [];
      resetDelete(item);
    } else {
      setSelectedItem((prev) => {
        if (!isNull(prev)) history.current = [historyItem, prev];
        return historyItem;
      });
      clickItem(historyItem.id);
    }
  };
  const clickNextHandler = (historyItem: TOptions) => {
    setSelectedItem((prev) => {
      if (!isNull(prev)) history.current = [prev, historyItem];
      return historyItem;
    });

    clickItem(historyItem.id);
  };

  const { classes } = useStyles();
  const { classes: toolsClasses } = useToolsStyles();

  const dataLenght = data.length;

  const listRef = useRef<FixedSizeList | null>(null);

  const addHandler = () => {
    clickAdd();
  };

  useEffect(() => {
    listRef.current?.scrollToItem(dataLenght, 'start');
  }, [dataLenght]);

  const toLeftOptions = () => {
    const position = (listRef.current?.state as { scrollOffset: number }).scrollOffset;
    const step = listRef.current?.props.itemSize ?? 0;
    const offset = Math.floor((position - step) / step) * step;
    listRef.current?.scrollTo(Math.max(0, offset));
  };

  const toRightOptions = () => {
    const position = (listRef.current?.state as { scrollOffset: number }).scrollOffset;
    const step = listRef.current?.props.itemSize ?? 0;
    const items = Math.max((listRef.current?.props.itemCount ?? 0) - 4, 1);
    const offset = Math.floor((position + step) / step) * step;
    listRef.current?.scrollTo(Math.min(offset, items * step));
  };

  return (
    <Stack direction={'column'} gap={1} sx={{ display: 'flex', flexGrow: 1 }}>
      {!isNull(selectedItem) && (
        <Stack direction={'row'} height={40} alignItems={'center'} spacing={3} marginTop={1.5} paddingX={1}>
          <SelectedButtonGroup
            isLoading={isLoading}
            targetItem={selectedItem}
            history={history.current}
            deleteSelect={clickDeleteHandler}
            undoSelect={clickPrevHandler}
            redoSelect={clickNextHandler}
          />

          <LoadingLine visible={isLoading} />

          <OptionsButtonGroup
            targetItem={selectedItem}
            loading={isLoading}
            optLen={dataLenght}
            addDisabled={addDisabled}
            addHandler={addHandler}
            toLeftOptions={toLeftOptions}
            toRightOptions={toRightOptions}
          />
        </Stack>
      )}

      <Stack direction={'row'} sx={{ display: 'flex', flex: 1, gap: 1 }}>
        <Box sx={{ display: 'flex', flex: 1, justifyContent: 'center' }}>
          <GeneralFrame targetItem={selectedItem} disabledDashed={isLoading || addDisabled} format={format}>
            <Button
              disabled={isLoading || addDisabled}
              onClick={addHandler}
              sx={{ display: 'flex', flexGrow: 1, textTransform: 'none' }}
            >
              {(isLoading && 'Потребуется немного времени для создания картинки...') ||
                (addDisabled && 'Ожидание ресурса для генерации') ||
                'Сгенерировать кадр'}
            </Button>
          </GeneralFrame>
        </Box>

        {!isNull(selectedItem) && (
          <Box className={classes.options}>
            <AutoSizer>
              {({ height, width }) => (
                <FixedSizeList
                  ref={listRef}
                  className={toolsClasses.list}
                  height={height}
                  itemCount={dataLenght}
                  itemSize={(width - 6) / format}
                  layout="vertical"
                  width={width}
                  itemData={{
                    onClick: clickItemHandler,
                    options: data,
                    selectedItem: selectedItem,
                  }}
                >
                  {RenderFrames}
                </FixedSizeList>
              )}
            </AutoSizer>
          </Box>
        )}
      </Stack>
    </Stack>
  );
});
