'use client';

import React from 'react';

import { useRouter } from 'next/navigation';

import { Box, Paper, Stack, SxProps, Theme } from '@mui/material';

import { isNull, isUndefined } from 'lodash';
import { observer } from 'mobx-react-lite';
import { enqueueSnackbar } from 'notistack';
import { makeStyles } from 'tss-react/mui';

import { ComicsPreview } from '../comics-viewing';
import { ComicsModalShow, ComicsShow } from '../comics-viewing/comics-show/comics-show';
import { ProjectTools } from '../project-toolbar/project-toolbar';

import { useDeleteProjetRequest } from '@/api/projects/delete-project';
import { useDownloadProjetRequest } from '@/api/projects/download-project';
import { useProjetRequest } from '@/api/projects/get-project';
import { useProjetSlidesRequest } from '@/api/projects/get-project-slides';
import { useProjetsRequest } from '@/api/projects/get-projects';
import { useSaveProjectRequest } from '@/api/projects/save-project';
import { useUpdateProjectRequest } from '@/api/projects/update-project';
import { useProcessStore, useViewStore } from '@/utils/mobx-stores';
import { DEFAULT_LOCAL_PROJECT_ID } from '@/utils/mobx-stores/process-store';
import { MyProject, Project } from '@/utils/mobx-stores/view-store';

const getFormatNumber = (formatString: string) => {
  const [width, heidht] = formatString.split('/').map((el: string) => parseInt(el));
  const number = width / heidht;
  if (isNaN(number)) return 1;
  return number;
};

const useStyles = makeStyles()((theme) => ({
  container: {
    display: 'flex',
    width: '100vw',
    maxWidth: '100vw',
    height: '100vh',
    padding: theme.spacing('76px', 2, 2),
    [theme.breakpoints.down('md')]: {
      padding: theme.spacing('64px', 0.5, 0.5, 1),
    },
  },
  flexBox: {
    display: 'flex',
    flexGrow: 1,
  },
}));

export const ProjectViewController = observer(() => {
  const {
    id: localId,
    stage,
    backup,
    setBackup,
    setProjectId,
    getServerSavedProject,
    saveStore,
    resetStore,
    getViewingProject,
    setInProcess,
  } = useProcessStore();

  const { projects, updateSlidesProject, setViewingId, viewingId, addLoading, viewingProject, removeLoading, setProjects } =
    useViewStore();

  const { project, isLoading, isLoaded, inPlayer, inModal } = viewingProject.get();

  const router = useRouter();

  const { getProjects } = useProjetsRequest({
    onSuccess(result) {
      setProjects(result ?? ([] as Project[]), getViewingProject() as MyProject, stage.get());
    },
    onError() {
      enqueueSnackbar({ variant: 'error', message: '[Проекты]: Ошибка при загрузке' });
    },
  });

  const updateProjects = () => {
    getProjects();
  };

  const { updateProject } = useUpdateProjectRequest({
    onSuccess(_, payload) {
      setBackup('server');
      saveStore(true);
      removeLoading(payload.id);
      enqueueSnackbar({ variant: 'success', message: '[Проект]: Обновлен' });

      if (payload.transition == 'edit' && !isUndefined(payload?.transitionId)) {
        const tid = payload.transitionId;
        addLoading(tid);
        getProject({ projectId: tid }, tid);
      }
    },
    onError(_, payload) {
      enqueueSnackbar({ variant: 'error', message: '[Проект]: Ошибка при обновлении' });
      removeLoading(payload.id);
    },
  });

  const { saveProject } = useSaveProjectRequest({
    onSuccess(result, payload) {
      const id = result.project_id;
      setProjectId(id);
      setBackup('server');
      saveStore(true);
      removeLoading(payload.id);
      enqueueSnackbar({ variant: 'success', message: '[Проект]: Сохранен' });
      updateProjects();
      if (payload.transition == 'edit' && !isUndefined(payload?.transitionId)) {
        const tid = payload.transitionId;
        addLoading(tid);
        getProject({ projectId: tid }, tid);
      }
    },
    onError(_, payload) {
      enqueueSnackbar({ variant: 'error', message: '[Проект]: Ошибка при сохранении' });
      removeLoading(payload.id);
    },
  });

  const onSave = (idp?: string, transition?: string, transitionId?: string) => {
    const id = idp ?? viewingId.get() ?? '';
    const project = getServerSavedProject();
    const projectId = project.id;
    if (isNull(projectId) || id == DEFAULT_LOCAL_PROJECT_ID) {
      addLoading(DEFAULT_LOCAL_PROJECT_ID);
      saveProject(project, { id: DEFAULT_LOCAL_PROJECT_ID, transition: transition, transitionId: transitionId });
    } else {
      addLoading(projectId);
      updateProject(
        {
          ...project,
          project_id: projectId,
        },
        { id: projectId, transition: transition, transitionId: transitionId },
      );
    }
  };

  const { getProject } = useProjetRequest({
    onSuccess(project, payload) {
      removeLoading(payload);
      resetStore();
      setInProcess({ ...project, project_id: payload });
      router.replace('/comics/constructor');
    },
    onError(_, payload) {
      enqueueSnackbar({ variant: 'error', message: '[Проект]: Ошибка при загрузке' });
      removeLoading(payload);
    },
  });
  const onEdit = () => {
    const id = viewingId.get() ?? '';
    if (id == localId.get()) {
      router.replace('/comics/constructor');
      return;
    }
    if (stage.get() !== 'emply') {
      if (backup.get() === 'server') {
        addLoading(id);
        getProject({ projectId: id }, id);
      } else {
        onSave(localId.get() ?? DEFAULT_LOCAL_PROJECT_ID, 'edit', id);
      }
    } else {
      addLoading(id);
      getProject({ projectId: id }, id);
    }
  };

  const { getProjectSlides } = useProjetSlidesRequest({
    onSuccess(result, payload) {
      updateSlidesProject(payload?.id ?? '', result);
      removeLoading(payload?.id ?? '', true);
      setViewingId(payload?.id ?? '', payload?.inPlayer, payload?.inModal);
    },
    onError(_, payload) {
      enqueueSnackbar({ variant: 'error', message: '[Проект]: Ошибка при загрузке' });
      removeLoading(payload.id);
    },
  });
  const onShow = (inPlayer?: boolean, inModal?: boolean) => {
    const id = viewingId.get() ?? '';
    if (isLoaded) {
      setViewingId(id, inPlayer, inModal);
    } else {
      getProjectSlides({ projectId: id }, { id: id, inPlayer: inPlayer, inModal: inModal });
      addLoading(id);
    }
  };

  const { deleteProject } = useDeleteProjetRequest({
    onSuccess(_, id) {
      removeLoading(id);
      updateProjects();
      enqueueSnackbar({ variant: 'info', message: '[Проект]: Удален' });
    },
    onError(_, payload) {
      enqueueSnackbar({ variant: 'error', message: '[Проект]: Ошибка при удалении' });
      removeLoading(payload);
    },
  });
  const onDelete = () => {
    const id = viewingId.get();
    if (isNull(id) || id == DEFAULT_LOCAL_PROJECT_ID || id == localId.get()) {
      resetStore();
    }
    const deletedProject = projects.get().find((el) => el.id == id);
    if (deletedProject?.backup === 'server') {
      addLoading(id ?? '');
      deleteProject({ projectId: id ?? '' }, id ?? '');
    } else {
      updateProjects();
    }
  };

  const { downloadZIP } = useDownloadProjetRequest({
    onSuccess(_, id: string) {
      removeLoading(id);
      enqueueSnackbar({ variant: 'success', message: '[Проект]: Скачивание файла' });
    },
    onError(_, payload) {
      enqueueSnackbar({ variant: 'error', message: '[Проект]: Ошибка при загрузке файла' });
      removeLoading(payload);
    },
  });

  const onDownload = () => {
    const id = viewingId.get() ?? '';
    addLoading(id);
    downloadZIP({ projectId: id }, id);
  };

  return (
    <PresentProject
      project={project}
      isLoading={isLoading}
      isPlayer={inPlayer}
      isModalPlayer={inModal}
      onShow={onShow}
      onEdit={onEdit}
      onDelete={onDelete}
      onDownload={onDownload}
      onSave={onSave}
    />
  );
});

const PresentProject: React.FC<{
  project: MyProject | null;
  isLoading?: boolean;
  isPlayer?: boolean;
  isModalPlayer?: boolean;
  onShow?: (inPlayer?: boolean, inModal?: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
  onSave?: () => void;
}> = ({ project, isPlayer = false, isLoading = false, isModalPlayer = false, onShow, onDelete, onDownload, onEdit, onSave }) => {
  const format = project?.format ?? '1/1';

  const closeClick = () => {
    onShow?.(false, false);
  };

  const showModalClick = () => {
    onShow?.(!isModalPlayer, !isModalPlayer);
  };

  const slides = project?.slides ?? [];

  const formatNumber = getFormatNumber(format);

  return (
    <>
      <Paper
        sx={{
          flexGrow: 1,
          maxWidth: `calc((100vh - ${76 + 24}px) * ${getFormatNumber(format)})`,
          maxHeight: `calc(100vh - ${76 + 24}px)`,
          display: {
            xs: 'none',
            md: 'flex',
          },
        }}
      >
        {!isNull(project) && (
          <ShowProject
            project={project}
            isLoading={isLoading}
            isPlayer={isPlayer}
            isModalPlayer={isModalPlayer}
            onShow={onShow}
            onEdit={onEdit}
            onDelete={onDelete}
            onDownload={onDownload}
            onSave={onSave}
          />
        )}
      </Paper>
      <Box
        sx={{
          display: {
            xs: 'block',
            sm: 'block',
            md: 'none',
          },
        }}
      >
        <ComicsModalShow
          slides={slides}
          open={isModalPlayer}
          onClose={closeClick}
          changeFullscreen={showModalClick}
          format={formatNumber}
        />
      </Box>
    </>
  );
};

export const ShowProject: React.FC<{
  project: MyProject | null;
  isLoading?: boolean;
  isPlayer?: boolean;
  isModalPlayer?: boolean;
  onShow?: (inPlayer?: boolean, inModal?: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
  onSave?: () => void;
  previewSX?: SxProps<Theme>;
}> = ({
  project,
  isPlayer = false,
  isLoading = false,
  isModalPlayer = false,
  previewSX,
  onShow,
  onDelete,
  onDownload,
  onEdit,
  onSave,
}) => {
  const { classes } = useStyles();

  const showClick = () => {
    onShow?.(!isPlayer, false);
  };

  const showModalClick = () => {
    onShow?.(!isModalPlayer, !isModalPlayer);
  };

  const closeClick = () => {
    onShow?.(false, false);
  };

  const editClick = () => {
    onEdit?.();
  };

  const deleteClick = () => {
    onDelete?.();
  };

  const downloadClick = () => {
    onDownload?.();
  };

  const saveClick = () => {
    onSave?.();
  };

  const slides = project?.slides ?? [];
  const backup = project?.backup ?? 'server';
  const format = project?.format ?? '1/1';
  const style = project?.style ?? 'UHD';
  const formatNumber = getFormatNumber(format);

  const previewSlides =
    slides.length > 3 ? [slides[0], slides[Math.round(slides.length / 2)], slides[slides.length - 1]] : slides;

  return (
    <Stack direction={'column'} className={classes.flexBox} padding={1} gap={1}>
      <ProjectTools
        isLoading={isLoading}
        onClicks={{ show: showClick, edit: editClick, delete: deleteClick, save: saveClick, download: downloadClick }}
        isPlayer={isPlayer}
        format={format}
        style={style}
        fromSave={backup}
      />

      {!isPlayer && <ComicsPreview slides={previewSlides} sx={previewSX} format={formatNumber} />}
      {(isModalPlayer && (
        <ComicsModalShow
          slides={slides}
          open={isPlayer}
          onClose={closeClick}
          changeFullscreen={showModalClick}
          format={formatNumber}
        />
      )) ||
        (isPlayer && <ComicsShow slides={slides} format={formatNumber} />)}
    </Stack>
  );
};
