'use client';

import { ChangeEvent, useEffect, useState } from 'react';

import { Paper, Stack, TextField } from '@mui/material';

import { isNull, isUndefined } from 'lodash';
import { observer } from 'mobx-react-lite';
import { enqueueSnackbar } from 'notistack';

import { MAX_DESCRIPTION_LEN } from './limits';
import { TextToolbar } from './text-input-toolbar';
import { useSlideDescriptionRequest } from '@/api/generaion-text/use-slide-description-request';
import { useToolsStyles } from '@/components/tools-elements';
import { useProcessStore } from '@/utils/mobx-stores';
import { textFilter } from '@/utils/text-filter/text-filter';

export const InputSlideTextController = observer(() => {
  const { selectedSlideData, updateSlide, loading, loadingStackGD, addLoading, removeLoading } = useProcessStore();

  const { getSlideDescription } = useSlideDescriptionRequest({
    onSuccess(result, payload) {
      removeLoading(payload.slideId, 'GD');
      if ((result?.frame_text ?? '').length > 0) {
        updateSlide(payload.slideId, { description: result.frame_text });
      } else {
        enqueueSnackbar({ variant: 'warning', message: '[Описание]: Ошибка при генерации' });
      }
    },
    onError(_, payload) {
      removeLoading(payload.slideId, 'GS');
      enqueueSnackbar({ variant: 'error', message: '[Описание]: Ошибка при генерации' });
    },
  });

  const slideData = selectedSlideData.get();

  if (isNull(slideData)) return null;

  const changeValue = (text: string) => {
    updateSlide(slideData.id, { description: text });
  };

  const onBuild = () => {
    const script = slideData.script ?? slideData.theses?.text ?? null;
    if (!isNull(script)) {
      addLoading(slideData.id, 'GD');
      getSlideDescription({ script: script }, { slideId: slideData.id });
    }
  };

  const isLoadingDescription = loadingStackGD.get().length > 0;

  const disabledBuild =
    ((slideData.script?.length ?? 0) <= 0 && (slideData.theses?.text?.length ?? 0) <= 0) ||
    !isUndefined(loading.get().find((el) => el.api === 'G'));

  return (
    <Paper sx={{ height: 160, display: 'flex', overflow: 'hidden' }}>
      <InputSlideText
        disabledBuild={disabledBuild}
        isLoading={isLoadingDescription}
        value={slideData.description}
        changeValue={changeValue}
        onBuild={onBuild}
      />
    </Paper>
  );
});

interface InputSlideTextProps {
  disabledBuild: boolean;
  isLoading?: boolean;
  value: string | null | undefined;
  changeValue: (v: string) => void;
  onBuild: () => void;
}
const InputSlideText: React.FC<InputSlideTextProps> = ({ isLoading, value, changeValue, onBuild, disabledBuild }) => {
  const [text, setText] = useState<string>(value ?? '');

  useEffect(() => {
    const newValue = value ?? '';
    if (newValue != text) setText(newValue);
  }, [value]);

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newText = e.target.value.slice(0, MAX_DESCRIPTION_LEN);
    const filtredText = textFilter(newText);
    setText(filtredText);
  };

  const clearText = () => {
    setText('');
    changeValue('');
  };
  const { classes: toolsClasses } = useToolsStyles();
  const [labelVisible, setLabelVisible] = useState<boolean>(false);

  const onBlur = () => {
    changeValue(text);
    setLabelVisible(false);
  };

  const focusHandler = () => {
    setLabelVisible(true);
  };

  return (
    <Stack direction={'column'} flexGrow={1}>
      <TextToolbar
        isLoading={isLoading}
        countSymbols={text.length}
        onBuild={onBuild}
        onClear={clearText}
        disabledBuild={disabledBuild}
      />
      <TextField
        {...(text.length > 0 && labelVisible && { label: `${text.length}/${MAX_DESCRIPTION_LEN}` })}
        placeholder="Текст для слайда"
        variant="outlined"
        size="medium"
        value={text}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={focusHandler}
        fullWidth
        multiline
        maxRows={3}
        sx={{
          flex: 1,
          display: 'flex',
          '& div': {
            height: '100%',
            alignItems: 'flex-start',
          },
          '& textarea': toolsClasses.list,
        }}
      />
    </Stack>
  );
};
