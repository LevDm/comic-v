'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
  DropResult,
  Droppable,
  DroppableProps,
  DroppableProvided,
} from 'react-beautiful-dnd';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ControlPointRoundedIcon from '@mui/icons-material/ControlPointRounded';
import DragHandleRoundedIcon from '@mui/icons-material/DragHandleRounded';
import GradingRoundedIcon from '@mui/icons-material/GradingRounded';
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';
import PlaylistAddRoundedIcon from '@mui/icons-material/PlaylistAddRounded';
import SettingsBackupRestoreRoundedIcon from '@mui/icons-material/SettingsBackupRestoreRounded';
import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Fade,
  FormControl,
  Grow,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';

import { isNull, isUndefined } from 'lodash';
import { observer } from 'mobx-react-lite';
import { enqueueSnackbar } from 'notistack';
import { makeStyles } from 'tss-react/mui';

import { THEME_LIMIT_SYMBOLS, THESES_LIMIT, THESES_LIMIT_SYMBOLS, TITLE_LIMI_SYMBOLS } from './limits';
import { useSlideDescriptionRequest } from '@/api/generaion-text/use-slide-description-request';
import { useSlidesDetailsRequest } from '@/api/generaion-text/use-slide-details-request';
import { useSlideScriptRequest } from '@/api/generaion-text/use-slide-script-request';
import { useThesesRequest } from '@/api/generaion-text/use-theses-request';
import { useThesisRequest } from '@/api/generaion-text/use-thesis-request';
import { useImageRequest } from '@/api/generation-image/use-image-request';
import { LoadingLine, useToolsStyles } from '@/components/tools-elements';
import { backgroundGradient } from '@/theme';
import { useProcessStore } from '@/utils/mobx-stores';
import { TImageFormat, TImageStyle } from '@/utils/mobx-stores/process-store';
import { textFilter } from '@/utils/text-filter/text-filter';

const useStyles = makeStyles()((theme) => ({
  initBackdrop: {
    top: 0,
    left: 0,
    zIndex: 100,
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: `${'#1F1D2B'}ff`,
  },

  inicContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    background: backgroundGradient(),
  },

  initCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '50%',
    minWidth: 300,
    padding: theme.spacing(2),
    margin: 'auto',
    backgroundColor: `${theme.palette.background.paper}80`,
    backdropFilter: 'blur(10px)',
    borderRadius: theme.shape.borderRadius,
  },
}));

export const ProjectInitController = observer(() => {
  const {
    stage,
    name,
    theme,
    format,
    style,
    refrence,
    setFormat,
    setStyle,
    deleteTheses,
    addTheses,
    parseSetTheses,
    updateTheses,
    moveTheses,
    setStage,
    setRefrence,
    setTheme,
    setName,
    addSlide,
    setHeroes,
    setScenes,
    updateRefrence,
    updateSlide,
    addLoading,
    removeLoading,
    setImageToPull,
  } = useProcessStore();
  const curStage = stage.get();
  const thematic = theme.get();

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

  const withImage = useRef(false);

  const { getSlideScript } = useSlideScriptRequest({
    onSuccess(result, payload: { slideId: string; thesesId: string }) {
      removeLoading(payload.slideId, 'GS');
      if ((result?.screenplay ?? '').length > 0) {
        updateSlide(payload.slideId, { script: result.screenplay, thesesId: payload.thesesId });

        addLoading(payload.slideId, 'GD');
        getSlideDescription({ script: result.screenplay }, { slideId: payload.slideId });

        /*
        if (withImage.current) {
          addLoading(slideId, 'K');
          getImage(
            {
              theme: theme.get() ?? '',
              script: result.screenplay,
              format: format.get(),
              style: style.get(),
              heroes: [],
              scene: [],
            },
            slideId,
          ); 
        }*/
      } else {
        enqueueSnackbar({ variant: 'warning', message: '[Слайд]: Ошибка при генерации сценария' });
      }
    },
    onError(_, payload) {
      removeLoading(payload.slideId, 'GS');
      enqueueSnackbar({ variant: 'error', message: '[Слайд]: Ошибка при генерации сценария' });
    },
  });

  const { isLoading: isLoadingDetails, getSlidesDetails } = useSlidesDetailsRequest({
    onSuccess(result) {
      const { scenes_pull, heroes_pull } = result;
      const scenes = scenes_pull.map((text, index) => ({ id: `scene-${Date.now() + index}`, description: text }));
      const heroes = heroes_pull.map((item, index) => ({ id: `hero-${Date.now() + index}`, ...item }));
      setScenes(scenes);
      setHeroes(heroes);

      const refrenceList = refrence.get().filter((el) => !['', null, undefined].includes(el.text));

      const slides = addSlide(undefined, refrenceList.length);
      const thematic = theme.get() ?? '';

      for (let i = 0; i < slides.length; i++) {
        const slideId = slides[i].id;
        getSlideScript({ theme: thematic, theses: refrenceList[i].text }, { slideId: slideId, thesesId: refrenceList[i].id });
        addLoading(slideId, 'GS');

        if (withImage.current) {
          addLoading(slideId, 'K');
          getImage(
            {
              theme: theme.get() ?? '',
              script: refrenceList[i].text, //result.screenplay,
              format: format.get(),
              style: style.get(),
              heroes: [],
              scene: [],
            },
            slideId,
          );
        }
      }
      enqueueSnackbar({ variant: 'success', message: '[Проект]: Запуск генерации' });
      setStage('editing');
    },
    onError() {
      enqueueSnackbar({ variant: 'error', message: '[Проект]: Ошибка при генерации' });
    },
  });

  const { isLoading: isLoadingTheses, getTheses } = useThesesRequest({
    onSuccess(result) {
      if ((result?.theses ?? []).length > 0) {
        parseSetTheses(result.theses);
        if (curStage === 'emply') setStage('initial');
      } else {
        enqueueSnackbar({ variant: 'warning', message: '[Проект]: Ошибка при генерации тезисов' });
      }
    },
    onError() {
      enqueueSnackbar({ variant: 'error', message: '[Проект]: Ошибка при генерации тезисов' });
    },
  });

  const { isLoading: isLoadingThesis, getThesis } = useThesisRequest({
    onSuccess(result, payload) {
      if ((result?.thesis ?? '').length > 0) {
        switch (payload?.mode) {
          case 'addit':
            addTheses(result.thesis, payload.index);
            break;
          case 'rebuild':
            updateTheses(result.thesis, payload.index);
            break;
        }
      } else {
        enqueueSnackbar({ variant: 'warning', message: `[Тезис-${payload.index}]: Ошибка при генерации` });
      }
    },
    onError(_, payload) {
      enqueueSnackbar({ variant: 'error', message: `[Тезис-${payload.index}]: Ошибка при генерации` });
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
      getThesis(requestData, payload);
    }
  };

  const isLoading = isLoadingThesis || isLoadingTheses || isLoadingDetails;

  const requestSlides = () => {
    const refrenceList = refrence.get();
    if (!isNull(thematic)) {
      getSlidesDetails({ theme: thematic, theses: refrenceList.map((el) => el.text) });
    }
  };

  const isVisible = ['emply', 'initial'].includes(curStage);
  if (!isVisible) {
    return null;
  }

  return (
    <ProjectInit
      stage={curStage}
      isLoading={isLoading}
      title={name.get()}
      onChangeTitle={(value: string) => {
        setName(value);
      }}
      theme={thematic}
      onChangeTheme={(value: string) => {
        if (curStage === 'initial' && thematic != value) {
          setStage('emply');
          setRefrence([]);
        }
        setTheme(value);
      }}
      refeneces={refrence.get()}
      onChangeRefenece={(id: string, value: string) => {
        updateRefrence(id, value);
      }}
      onNextStage={(params?: 'no-image') => {
        const nextStage = curStage === 'emply' ? 'initial' : 'editing';

        if (nextStage === 'editing') {
          withImage.current = params === 'no-image' ? false : true;
          requestSlides();
        } else if (!isNull(theme.get())) {
          getTheses({ theme: theme.get() as string });
        } else {
          console.error('!!! ТЕМА');
        }
      }}
      onRebuidRefrences={() => {
        if (!isNull(thematic)) {
          getTheses({ theme: thematic });
        }
      }}
      onAction={(index: number, mode: SendRMode) => {
        switch (mode) {
          case 'addit':
            requestThesis({ index, mode });
            break;
          case 'detele':
            deleteTheses(index);
            break;
          case 'rebuild':
            requestThesis({ index, mode });
            break;
        }
      }}
      onMove={(prevIndex: number, nextIndex: number, item: TRefrence) => {
        moveTheses(prevIndex, nextIndex, item);
      }}
      format={format.get()}
      onChangeFormat={(newFormat: TImageFormat) => {
        setFormat(newFormat);
      }}
      style={style.get()}
      onChangeStyle={(newStyle: TImageStyle) => {
        setStyle(newStyle);
      }}
    />
  );
});

type TRefrence = {
  id: string;
  text: string;
};
const SLIDE_IMAGE_FORMATS: TImageFormat[] = ['9/16', '3/4', '4/5', '1/1', '4/3', '16/9'];
const SLIDE_IMAGE_STYLES: TImageStyle[] = ['UHD', 'ANIME', 'KANDINSKY', 'DEFAULT'];

type TProcessStage = 'emply' | 'initial' | 'editing';
interface ProjectInitProps {
  stage: TProcessStage;
  isLoading: boolean;
  title: string | undefined | null;
  onChangeTitle: (v: string) => void;
  theme: string | undefined | null;
  onChangeTheme: (v: string) => void;
  refeneces: TRefrence[];
  onChangeRefenece: (id: string, v: string) => void;
  onNextStage: (params?: 'no-image') => void;
  onRebuidRefrences: () => void;
  onAction: (index: number, mode: SendRMode) => void;
  onMove: (prevIndex: number, nextIndex: number, item: TRefrence) => void;
  format: TImageFormat;
  style: TImageStyle;
  onChangeFormat: (newFormat: TImageFormat) => void;
  onChangeStyle: (newFormat: TImageStyle) => void;
}
const ProjectInit: React.FC<ProjectInitProps> = (props) => {
  const {
    stage,
    isLoading,
    title,
    onChangeTitle,
    theme,
    onChangeTheme,
    refeneces,
    onChangeRefenece,
    onNextStage,
    onRebuidRefrences,
    onAction,
    onMove,
    format,
    onChangeFormat,
    style,
    onChangeStyle,
  } = props;

  const { classes } = useStyles();

  const [mode, setMode] = useState<RMode>(null);

  const changeMode = (newMode: RMode) => {
    if (newMode === 'addit' && refeneces.length == 0) {
      onAction(0, 'addit');
    } else {
      setMode(newMode);
    }
  };

  const rebuildhandler = () => {
    setMode(null);
    onRebuidRefrences();
  };

  const actionHandler = (index: number, mode: SendRMode) => {
    setMode(null);
    onAction(index, mode);
  };

  return (
    <Fade in={true} timeout={500}>
      <Box component={'section'} className={classes.initBackdrop}>
        <Box className={classes.inicContainer}>
          <Stack className={classes.initCard} spacing={2} gap={2}>
            {stage === 'initial' && (
              <InitProjectToolbar
                isLoading={isLoading}
                title={title}
                onChangeTitle={onChangeTitle}
                thesesCount={refeneces.length}
                mode={mode}
                onChangeMode={changeMode}
                format={format}
                onChangeFormat={onChangeFormat}
                style={style}
                onChangeStyle={onChangeStyle}
              />
            )}

            <ThemeInput
              value={theme}
              onChangeValue={onChangeTheme}
              isLoading={isLoading}
              stage={stage}
              onFocus={() => setMode(null)}
            />

            {stage === 'initial' && (
              <RefrenceList
                mode={mode}
                onChangeMode={changeMode}
                data={refeneces}
                onChange={onChangeRefenece}
                isLoading={isLoading}
                onAction={actionHandler}
                onMove={onMove}
              />
            )}

            <ActionButtons
              isDisabled={
                isLoading || ((theme?.length ?? 0) <= 2 && stage === 'emply') || (refeneces.length == 0 && stage === 'initial')
              }
              stage={stage}
              onNext={onNextStage}
              onRebuild={rebuildhandler}
            />
          </Stack>
        </Box>
      </Box>
    </Fade>
  );
};

interface ActionButtonsProps {
  isDisabled: boolean;
  stage: TProcessStage;
  onNext: (params?: 'no-image') => void;
  onRebuild: () => void;
}
const ActionButtons: React.FC<ActionButtonsProps> = (props) => {
  const { isDisabled, stage, onNext, onRebuild } = props;
  const { classes } = useToolsStyles();
  const nextNoImageHandler = () => {
    onNext('no-image');
  };
  const nextHandler = () => {
    onNext();
  };
  return (
    <Stack direction={'row'} flexGrow={1} gap={1} maxHeight={'50px'} width={'100%'}>
      {stage === 'initial' && (
        <Button
          variant="contained"
          className={classes.control}
          sx={{ flex: 1, lineHeight: 1 }}
          onClick={nextNoImageHandler}
          disabled={isDisabled}
        >
          Далее без картинок
        </Button>
      )}
      <Button variant="contained" className={classes.control} sx={{ flex: 3 }} onClick={nextHandler} disabled={isDisabled}>
        Далее
      </Button>
      {stage === 'initial' && (
        <Tooltip title={'Сгенерировать снова (3 тезиса)'}>
          <Button
            variant="contained"
            startIcon={<SettingsBackupRestoreRoundedIcon />}
            className={classes.control}
            onClick={onRebuild}
            disabled={isDisabled}
          />
        </Tooltip>
      )}
    </Stack>
  );
};

interface InitProjectToolbarProps {
  isLoading: boolean;
  title: string | undefined | null;
  onChangeTitle: (v: string) => void;
  thesesCount: number;
  mode: RMode;
  onChangeMode: (mode: RMode) => void;
  format: TImageFormat;
  style: TImageStyle;
  onChangeFormat: (newFormat: TImageFormat) => void;
  onChangeStyle: (newFormat: TImageStyle) => void;
}
const InitProjectToolbar: React.FC<InitProjectToolbarProps> = (props) => {
  const { isLoading, title, onChangeTitle, thesesCount, mode, onChangeMode, format, style, onChangeStyle, onChangeFormat } =
    props;
  const { classes } = useToolsStyles();

  const handleChange = (event: SelectChangeEvent) => {
    onChangeFormat(event.target.value as TImageFormat);
  };

  const handleChangeStyle = (event: SelectChangeEvent) => {
    onChangeStyle(event.target.value as TImageStyle);
  };

  return (
    <Stack direction={'row'} flexGrow={1} maxHeight={'40px'} width={'100%'}>
      <InitProjectTitle value={title} onChangeValue={onChangeTitle} />

      <LoadingLine visible={isLoading} />

      <ButtonGroup variant="outlined">
        <Tooltip title={mode === 'addit' ? 'Не добавлять тезис' : 'Добавить тезис'}>
          <Badge
            badgeContent={thesesCount > 0 ? `${thesesCount}/${THESES_LIMIT}` : undefined}
            color="secondary"
            style={{ userSelect: 'none' }}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <Button
              disabled={isLoading || thesesCount >= THESES_LIMIT}
              startIcon={(mode === 'addit' && <GradingRoundedIcon />) || <ControlPointRoundedIcon />}
              className={classes.control}
              onClick={() => {
                onChangeMode(mode === 'addit' ? null : 'addit');
              }}
            />
          </Badge>
        </Tooltip>

        <FormControl fullWidth disabled={isLoading}>
          <InputLabel id="style-select-label" sx={{ color: 'primary.main' }}>
            Стиль
          </InputLabel>
          <Select
            label="Стиль"
            variant="outlined"
            id="style-select"
            value={style}
            onChange={handleChangeStyle}
            sx={{
              //maxWidth: 100,
              width: 75,
              height: 40,
              borderRadius: 0,

              color: 'primary.main',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.dark',
                borderWidth: '1px',
              },
              '& .MuiFormLabel-root': {
                color: 'primary.main',
              },
              '& .MuiSvgIcon-root': {
                color: 'primary.main',
              },
              '& div': {
                padding: 0,
                paddingLeft: 2,
                height: 40,
              },
            }}
          >
            {SLIDE_IMAGE_STYLES.map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth disabled={isLoading}>
          <InputLabel id="format-select-label" sx={{ color: 'primary.main' }}>
            Формат
          </InputLabel>
          <Select
            label="Формат"
            variant="outlined"
            id="format-select"
            value={format}
            onChange={handleChange}
            sx={{
              maxWidth: 100,
              minWidth: 70,
              height: 40,
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              color: 'primary.main',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.dark',
                borderWidth: '1px',
              },
              '& .MuiFormLabel-root': {
                color: 'primary.main',
              },
              '& .MuiSvgIcon-root': {
                color: 'primary.main',
              },
              '& div': {
                padding: 0,
                paddingLeft: 2,
                height: 40,
              },
            }}
          >
            {SLIDE_IMAGE_FORMATS.map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </ButtonGroup>
    </Stack>
  );
};

interface InitProjectTitleProps {
  value: string | undefined | null;
  onChangeValue: (v: string) => void;
}
const InitProjectTitle: React.FC<InitProjectTitleProps> = ({ value, onChangeValue }) => {
  const [text, setText] = useState<string>(value ?? '');

  useEffect(() => {
    const newValue = value ?? '';
    if (newValue != text) setText(newValue);
  }, [value]);

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newText = e.target.value.slice(0, TITLE_LIMI_SYMBOLS);
    const filtredText = textFilter(newText);
    setText(filtredText);
  };

  const [labelVisible, setLabelVisible] = useState<boolean>(false);

  const onBlur = () => {
    onChangeValue(text);
    setLabelVisible(false);
  };

  const focusHandler = () => {
    setLabelVisible(true);
  };
  return (
    <TextField
      {...(text.length > 0 && labelVisible && { label: `${text.length}/${TITLE_LIMI_SYMBOLS}` })}
      value={text}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={focusHandler}
      placeholder="Название проекта"
      variant="outlined"
      size="small"
      sx={{ minWidth: 180, minHeight: '40px' }}
    />
  );
};

interface ThemeInputProps {
  stage: TProcessStage;
  isLoading: boolean;
  value: string | undefined | null;
  onChangeValue: (v: string) => void;
  onFocus?: () => void;
}
const ThemeInput: React.FC<ThemeInputProps> = ({ stage, isLoading, value, onChangeValue, onFocus }) => {
  const [text, setText] = useState<string>(value ?? '');

  useEffect(() => {
    const newValue = value ?? '';
    if (newValue != text) setText(newValue);
  }, [value]);

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newText = e.target.value.slice(0, THEME_LIMIT_SYMBOLS);
    const filtredText = textFilter(newText);
    setText(filtredText);
  };

  const [labelVisible, setLabelVisible] = useState<boolean>(false);

  const onBlur = () => {
    onChangeValue(text);
    setLabelVisible(false);
  };

  const focusHandler = () => {
    setLabelVisible(true);
    onFocus?.();
  };

  const clearText = () => {
    setText('');
    onChangeValue('');
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
      }}
    >
      <TextField
        {...(text.length > 0 && labelVisible && { label: `${text.length}/${THEME_LIMIT_SYMBOLS}` })}
        disabled={isLoading}
        value={text}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={focusHandler}
        //label="Тема генерации"
        placeholder="Тема генерации - например, супергерой спасает планету"
        variant="outlined"
        size="medium"
        fullWidth
        autoFocus={stage === 'initial'}
        sx={{
          '& input': {
            paddingRight: '48px',
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          right: '4px',
          top: '50%',
          transform: 'translate(0%, -50%)',
          maxHeight: '50px',
          maxWidth: '50px',
          minHeight: '40px',
          minWidth: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {(stage === 'emply' && isLoading && <CircularProgress size={'24px'} color="secondary" />) ||
          (text.length > 0 && (
            <Tooltip title="Стереть">
              <Button
                disabled={isLoading}
                sx={{
                  minHeight: '40px',
                  minWidth: '40px',
                  '& span': {
                    margin: 0,
                  },
                }}
                startIcon={<CloseRoundedIcon />}
                onClick={clearText}
              />
            </Tooltip>
          ))}
      </Box>
    </Box>
  );
};

type RMode = null | 'addit';
type SendRMode = 'addit' | 'detele' | 'rebuild';
interface RefrenceListProps {
  isLoading: boolean;
  data: TRefrence[];
  mode: RMode;
  onChangeMode: (mode: RMode) => void;
  onChange: (id: string, v: string) => void;
  onAction: (index: number, mode: SendRMode) => void;
  onMove: (prevIndex: number, nextIndex: number, item: TRefrence) => void;
}
const RefrenceList: React.FC<RefrenceListProps> = ({ data, mode, onChange, onChangeMode, isLoading, onAction, onMove }) => {
  const { classes } = useToolsStyles();

  const resetMode = () => {
    onChangeMode(null);
  };

  const renderItems = () => {
    const items = [];
    const itemsCount = data.length + (isNull(mode) ? 0 : data.length + 1);
    for (let i = 0; i < itemsCount; i++) {
      if (!isNull(mode) && i % 2 === 0) {
        const indexAction = i / 2;
        items.push(
          <ActionButton
            key={`ab-${indexAction}`}
            onClick={() => {
              onAction(indexAction, 'addit');
            }}
          />,
        );
        continue;
      }
      const indexData = isNull(mode) ? i : (i - 1) / 2;
      const item = data[indexData];
      items.push(
        <Draggable key={item.id} draggableId={item.id} index={indexData}>
          {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              style={{
                marginTop: 16,
                marginBottom: 16,
                ...provided.draggableProps.style,
                ...(snapshot.isDragging && {
                  top: 'auto !important',
                  left: 'auto !important',
                }),
              }}
            >
              <Grow in={true}>
                <Stack direction={'row'} width={'100%'} paddingLeft={1}>
                  <RefrenceInput data={item} onChange={onChange} isLoading={isLoading} onFocus={resetMode} />
                  <Stack direction={'column'} width={50} paddingX={1}>
                    <Tooltip title={'Удерживай, чтобы переместить'}>
                      <div
                        style={{ height: 40, width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        {...provided.dragHandleProps}
                      >
                        <DragHandleRoundedIcon color={snapshot.isDragging ? 'secondary' : 'disabled'} />
                      </div>
                    </Tooltip>
                    <Tooltip title={'Заменить тезис'}>
                      <IconButton
                        sx={{ height: 40, width: 40 }}
                        disabled={isLoading}
                        onClick={() => {
                          onAction(indexData, 'rebuild');
                        }}
                      >
                        <SettingsBackupRestoreRoundedIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={'Удалить тезис'}>
                      <IconButton
                        sx={{ height: 40, width: 40 }}
                        disabled={isLoading}
                        onClick={() => {
                          onAction(indexData, 'detele');
                        }}
                      >
                        <HighlightOffRoundedIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              </Grow>
            </div>
          )}
        </Draggable>,
      );
    }
    return items;
  };

  const onDragEnd = (res: DropResult) => {
    const { source, destination, draggableId } = res;

    if (!destination) return;

    const oldIndex = source.index;
    const newIndex = destination.index;

    if (oldIndex == newIndex) return;

    const newData = [...data];
    const item = newData.find((el) => el.id == draggableId);
    if (!isUndefined(item)) {
      onMove(oldIndex, newIndex, item);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd} onBeforeDragStart={resetMode}>
      <DroppableSM droppableId="droppable" direction="vertical">
        {(provided: DroppableProvided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              overflowY: 'auto',
              maxHeight: 'calc(100vh - 420px)',
              width: '100%',
              gap: 2,
              paddingLeft: 2,
            }}
            className={classes.list}
          >
            {renderItems()}
            {provided.placeholder}
          </div>
        )}
      </DroppableSM>
    </DragDropContext>
  );
};

export const DroppableSM = ({ children, ...props }: DroppableProps) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));

    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return <Droppable {...props}>{children}</Droppable>;
};

interface ActionButtonProps {
  onClick?: () => void;
}
const ActionButton: React.FC<ActionButtonProps> = ({ onClick }) => {
  const clickAction = () => {
    onClick?.();
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
        <Tooltip title={'Добавить сюда'}>
          <IconButton onClick={clickAction} sx={{ minHeight: 40 }}>
            <PlaylistAddRoundedIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Grow>
  );
};

interface RefrenceItemProps {
  isLoading: boolean;
  data: TRefrence;
  onChange: (id: string, v: string) => void;
  onFocus?: () => void;
}
const RefrenceInput: React.FC<RefrenceItemProps> = ({ data, onChange, isLoading, onFocus }) => {
  const [text, setText] = useState<string>(data.text ?? '');

  useEffect(() => {
    const newValue = data.text ?? '';
    if (newValue != text) setText(newValue);
  }, [data]);

  const onChangeText = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newText = e.target.value.slice(0, THESES_LIMIT_SYMBOLS);
    const filtredText = textFilter(newText);
    setText(filtredText);
  };
  const { classes: toolsClasses } = useToolsStyles();

  const [labelVisible, setLabelVisible] = useState<boolean>(false);

  const onBlur = () => {
    onChange(data.id, text);
    setLabelVisible(false);
  };

  const focusHandler = () => {
    setLabelVisible(true);
    onFocus?.();
  };

  return (
    <TextField
      {...(text.length > 0 && labelVisible && { label: `${text.length}/${THESES_LIMIT_SYMBOLS}` })}
      disabled={isLoading}
      value={text}
      onChange={onChangeText}
      onFocus={focusHandler}
      onBlur={onBlur}
      placeholder="Тезис"
      variant="outlined"
      size="medium"
      fullWidth
      multiline
      sx={{
        display: 'flex',
        flexGrow: 1,
        '& div': {
          height: '100%',
          alignItems: 'flex-start',
        },
        '& textarea': toolsClasses.list,
      }}
    />
  );
};
