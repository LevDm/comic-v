'use client';

import { ChangeEvent, useEffect, useState } from 'react';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import OndemandVideoRoundedIcon from '@mui/icons-material/OndemandVideoRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import RotateLeftRoundedIcon from '@mui/icons-material/RotateLeftRounded';
import SaveAltRoundedIcon from '@mui/icons-material/SaveAltRounded';
import SaveAsRoundedIcon from '@mui/icons-material/SaveAsRounded';
import { Button, ButtonGroup, Stack, TextField, Tooltip } from '@mui/material';

import { isNull } from 'lodash';
import { observer } from 'mobx-react-lite';
import { enqueueSnackbar } from 'notistack';

import { TITLE_LIMI_SYMBOLS } from './limits';
import { useDownloadProjetRequest } from '@/api/projects/download-project';
import { useSaveProjectRequest } from '@/api/projects/save-project';
import { useUpdateProjectRequest } from '@/api/projects/update-project';
import { ComicsModalShow } from '@/components/comics-viewing/comics-show/comics-show';
import { LoadingLine, useToolsStyles } from '@/components/tools-elements';
import { useProcessStore } from '@/utils/mobx-stores';
import {
  DEFAULT_LOCAL_PROJECT_ID,
  TBackupProject,
  TImageFormat,
  TImageStyle,
  TLightSlide,
} from '@/utils/mobx-stores/process-store';
import { textFilter } from '@/utils/text-filter/text-filter';

export const ProjectToolbarController = observer(() => {
  const {
    isloading,
    name,
    lightSlides,
    loading,
    resetStore,

    getServerSavedProject,
    setProjectLoading,
    setName,
    id,
    backup,
    setBackup,
    setProjectId,
    format,
    style,
    formatNumber,
    saveStore,
  } = useProcessStore();

  const { isLoading: updateLoading, updateProject } = useUpdateProjectRequest({
    onSuccess() {
      setBackup('server');
      setProjectLoading(false);
      saveStore(true);
    },
    onError() {
      setProjectLoading(false);
      enqueueSnackbar({ variant: 'error', message: '[Проект]: Ошибка при обновлении' });
    },
  });

  const { isLoading: saveLoading, saveProject } = useSaveProjectRequest({
    onSuccess(result) {
      setProjectId(result.project_id);
      setBackup('server');
      setProjectLoading(false);
      saveStore(true);
    },
    onError() {
      setProjectLoading(false);
      enqueueSnackbar({ variant: 'error', message: '[Проект]: Ошибка при сохранении' });
    },
  });

  const backupProject = () => {
    setProjectLoading(true);
    const project = getServerSavedProject();
    const projectId = project.id;

    if (isNull(projectId) || projectId == DEFAULT_LOCAL_PROJECT_ID) {
      saveProject(project, { id: DEFAULT_LOCAL_PROJECT_ID });
    } else {
      updateProject(
        {
          ...project,
          project_id: projectId,
        },
        { id: projectId },
      );
    }
  };

  const onReset = () => {
    resetStore();
  };

  const onSave = () => {
    backupProject();
  };

  const { isLoading: downloadLoading, downloadZIP } = useDownloadProjetRequest({
    onSuccess() {
      setProjectLoading(false);
      enqueueSnackbar({ variant: 'success', message: '[Проект]: Скачивание файла' });
    },
    onError() {
      setProjectLoading(false);
      enqueueSnackbar({ variant: 'error', message: '[Проект]: Ошибка при загрузке файла' });
    },
  });

  const onDownload = () => {
    const projectId = id.get();
    if (!isNull(projectId)) {
      setProjectLoading(true);
      downloadZIP({ projectId: projectId }, projectId);
    }
  };

  return (
    <ConstructorProjectToolbar
      isLoading={isloading.get() || saveLoading || updateLoading || downloadLoading}
      isThirdLoading={loading.get().length > 0}
      onSave={onSave}
      onDownload={onDownload}
      onReset={onReset}
      onChangeTitle={(title: string) => {
        setName(title);
      }}
      title={name.get()}
      slides={lightSlides.get()}
      format={format.get()}
      style={style.get()}
      formatNumber={formatNumber.get()}
      backup={backup.get()}
      id={id.get()}
    />
  );
});

interface InputTitleProps {
  isLoading?: boolean;
  value: string | null | undefined;
  changeValue: (v: string) => void;
  error?: boolean;
}
const InputTitle: React.FC<InputTitleProps> = ({ value, changeValue, error = false }) => {
  const [text, setText] = useState<string>(value ?? '');

  useEffect(() => {
    const newValue = value ?? '';
    if (newValue != text) setText(newValue);
  }, [value]);

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newText = e.target.value.slice(0, TITLE_LIMI_SYMBOLS);
    const filtredText = textFilter(newText);
    if (error) {
      changeValue(filtredText);
    }
    setText(filtredText);
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
    <TextField
      {...((error || (text.length > 0 && labelVisible)) && {
        label: error ? 'Назовите проект' : `${text.length}/${TITLE_LIMI_SYMBOLS}`,
      })}
      error={error}
      value={text}
      onBlur={onBlur}
      onChange={onChange}
      onFocus={focusHandler}
      placeholder="Название проекта"
      variant="outlined"
      size="small"
      sx={{ width: '100%', minHeight: '40px', maxWidth: '400px' }}
    />
  );
};

interface ProjectToolbarProps {
  isLoading: boolean;
  isThirdLoading: boolean;
  onSave: () => void;
  onDownload: () => void;
  onReset: () => void;
  onChangeTitle: (v: string) => void;
  title: string | undefined | null;
  format: TImageFormat;
  style: TImageStyle;
  formatNumber: number;
  slides: TLightSlide[];
  backup: TBackupProject;
  id: string | null;
}

const ConstructorProjectToolbar: React.FC<ProjectToolbarProps> = (props) => {
  const {
    isLoading,
    isThirdLoading,
    onSave,
    onDownload,
    onReset,
    onChangeTitle,
    title,
    slides,
    format,
    style,
    formatNumber,
    backup,
    id,
  } = props;

  const { classes } = useToolsStyles();

  const [titleError, setTitleError] = useState(false);

  const saveClick = () => {
    if ((title?.length ?? 0) > 0) {
      onSave();
    } else {
      setTitleError(true);
    }
  };

  const downloadClick = () => {
    onDownload();
  };

  const changeTitle = (text: string) => {
    if (titleError && (text?.length ?? 0) > 0) {
      setTitleError(false);
    }
    onChangeTitle(text);
  };

  const resetClick = () => {
    onReset();
  };

  return (
    <Stack direction={'row'} flexGrow={1} maxHeight={'40px'} width={'100%'}>
      <InputTitle changeValue={changeTitle} value={title} error={titleError} />

      <LoadingLine visible={isLoading} />

      <ButtonGroup variant="outlined">
        <Tooltip title={backup === 'server' ? 'Скачать' : 'Сохранить на сервер'}>
          <Button
            disabled={isLoading || isThirdLoading}
            startIcon={(backup === 'server' && <SaveAltRoundedIcon />) || <SaveAsRoundedIcon />}
            className={classes.control}
            onClick={backup === 'server' ? downloadClick : saveClick}
          />
        </Tooltip>
        <Tooltip title={backup === 'server' ? 'Новый проект' : !isNull(id) ? 'Сбросить изменения' : 'Начать заново'}>
          <Button
            disabled={isLoading || isThirdLoading}
            startIcon={
              (backup === 'server' && <AddRoundedIcon />) ||
              (!isNull(id) && <RestartAltRoundedIcon />) || <RotateLeftRoundedIcon />
            }
            className={classes.control}
            onClick={resetClick}
          />
        </Tooltip>

        <Button disabled sx={{ lineHeight: 1 }} className={classes.control}>
          {format} {style.slice(0, 3)}
        </Button>

        <ProjectPreviewButton slides={slides} title={title} format={formatNumber} />
      </ButtonGroup>
    </Stack>
  );
};

const ProjectPreviewButton: React.FC<{ slides: TLightSlide[]; format: number; title?: string | null }> = ({
  slides,
  title,
  format,
}) => {
  const { classes } = useToolsStyles();

  const [isPlayer, setIsPlayer] = useState(false);

  const showClick = () => {
    setIsPlayer((prev) => !prev);
  };

  return (
    <>
      <Tooltip title={'Предпросмотр'}>
        <Button
          startIcon={<OndemandVideoRoundedIcon />}
          className={classes.control}
          onClick={showClick}
          disabled={slides.length === 0}
        />
      </Tooltip>

      <ComicsModalShow slides={slides} open={isPlayer} onClose={showClick} title={title} format={format} />
    </>
  );
};
