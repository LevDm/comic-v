'use client';

import { ChangeEvent, useEffect, useState } from 'react';

import { Paper, Stack, TextField } from '@mui/material';

import { isNull, isUndefined } from 'lodash';
import { observer } from 'mobx-react-lite';
import { enqueueSnackbar } from 'notistack';

import { MAX_SCRIPT_LEN } from './limits';
import { TextToolbar, TextToolbarProps } from './text-input-toolbar';
import { useSlideScriptRequest } from '@/api/generaion-text/use-slide-script-request';
import { useToolsStyles } from '@/components/tools-elements';
import { useProcessStore } from '@/utils/mobx-stores';
import { textFilter } from '@/utils/text-filter/text-filter';

export const SlideScriptController = observer(() => {
  const { selectedSlideData, loadingStackGS, updateSlide, theme, removeLoading, addLoading, loading } = useProcessStore();

  const slideData = selectedSlideData.get();

  const { getSlideScript } = useSlideScriptRequest({
    onSuccess(result, payload: { slideId: string; thesesId: string }) {
      removeLoading(payload.slideId, 'GS');
      if ((result?.screenplay ?? '').length > 0) {
        updateSlide(payload.slideId, { script: result.screenplay, thesesId: payload.thesesId });
      } else {
        enqueueSnackbar({ variant: 'warning', message: '[Сценарий]: Ошибка при генерации' });
      }
    },
    onError(_, payload) {
      removeLoading(payload.slideId, 'GS');
      enqueueSnackbar({ variant: 'error', message: '[Сценарий]: Ошибка при генерации' });
    },
  });

  if (isNull(slideData)) return null;

  const onChangeScript = (text: string) => {
    updateSlide(slideData.id, { script: text });
  };

  const isLoadingScript = loadingStackGS.get().length > 0;

  const onBuild = () => {
    if (!isNull(slideData.theses)) {
      getSlideScript(
        { theme: theme.get() ?? '', theses: slideData.theses.text },
        { slideId: slideData.id, thesesId: slideData.theses.id },
      );
      addLoading(slideData.id, 'GS');
    }
  };

  const disabledBuild = isUndefined(slideData.theses?.text) || !isUndefined(loading.get().find((el) => el.api === 'G'));

  return (
    <Paper sx={{ display: 'flex', overflow: 'hidden' }}>
      <InputSlideScript
        isLoading={isLoadingScript}
        value={slideData.script}
        changeValue={onChangeScript}
        disabledBuild={disabledBuild}
        onBuild={onBuild}
      />
    </Paper>
  );
});

interface InputSlideScriptProps extends TextToolbarProps {
  isLoading: boolean;
  value: string | null | undefined;
  changeValue: (v: string) => void;
}
const InputSlideScript: React.FC<InputSlideScriptProps> = (props) => {
  const { isLoading, value, changeValue, disabledBuild, onBuild } = props;

  const [text, setText] = useState<string>(value ?? '');

  const { classes: toolsClasses } = useToolsStyles();

  useEffect(() => {
    const newValue = value ?? '';
    if (newValue != text) setText(newValue);
  }, [value]);

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newText = e.target.value.slice(0, MAX_SCRIPT_LEN);
    const filtredText = textFilter(newText);
    setText(filtredText);
  };

  const clearText = () => {
    setText('');
    changeValue('');
  };

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
        disabledBuild={disabledBuild}
        isLoading={isLoading}
        countSymbols={text.length}
        onBuild={onBuild}
        onClear={clearText}
      />
      <TextField
        {...(text.length > 0 && labelVisible && { label: `${text.length}/${MAX_SCRIPT_LEN}` })}
        disabled={isLoading}
        placeholder="Сценарий слайда"
        variant="outlined"
        size="medium"
        value={text}
        onBlur={onBlur}
        onFocus={focusHandler}
        onChange={onChange}
        fullWidth
        multiline
        maxRows={16}
        sx={{
          flex: 1,
          display: 'flex',
          maxHeight: 400,
          '& div': {
            maxHeight: 400,
            height: '100%',
            alignItems: 'flex-start',
          },
          '& textarea': toolsClasses.list,
        }}
      />
    </Stack>
  );
};
