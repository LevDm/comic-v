'use client';

import React, { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { Box, Button, Fab, Stack, Tooltip, Typography } from '@mui/material';

import { isNull, isUndefined } from 'lodash';
import { observer } from 'mobx-react-lite';
import { enqueueSnackbar } from 'notistack';
import { makeStyles } from 'tss-react/mui';

import { ProjectList } from '../project-list';
import { LoadingLine } from '../tools-elements';

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

interface IProjects {
  projects: MyProject[];
  viewingId: string | null;
  localId?: string | null;
  isLoading?: boolean;
  loading?: string[];
  onCreate?: () => void;
  onChangeProject?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
  onSave?: (id: string) => void;
  onShow?: (id: string, inPlayer?: boolean, inModal?: boolean) => void;
}

export const ProjectsController = observer(() => {
  const localCallback = () => {
    getProjects();
  };

  const {
    id: localId,
    isloading,
    stage,
    backup,
    resetStore,
    setBackup,
    setProjectId,
    getViewingProject,
    getServerSavedProject,
    saveStore,
    loadStore,
    setInProcess,
  } = useProcessStore();

  const localLoading = isloading.get();

  const { projects, setProjects, updateSlidesProject, setViewingId, viewingId, loading, loaded, addLoading, removeLoading } =
    useViewStore();

  const { isLoading, getProjects } = useProjetsRequest({
    onSuccess(result) {
      setProjects(result ?? ([] as Project[]), getViewingProject() as MyProject, stage.get());
    },
    onError() {
      enqueueSnackbar({ variant: 'error', message: '[Проекты]: Ошибка при загрузке' });
    },
  });

  const router = useRouter();

  const onChangeProject = (id: string) => {
    setViewingId(id);
  };

  const onCreate = () => {
    if (stage.get() !== 'emply') {
      if (backup.get() === 'server') {
        resetStore();
      } else {
        onSave(localId.get() ?? DEFAULT_LOCAL_PROJECT_ID);
      }
    }
    router.replace('/comics/constructor');
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

  const onSave = (id: string, transition?: string, transitionId?: string) => {
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
      //updateProjects();
      router.replace('/comics/constructor');
    },
    onError(_, payload) {
      enqueueSnackbar({ variant: 'error', message: '[Проект]: Ошибка при загрузке' });
      removeLoading(payload);
    },
  });
  const onEdit = (id: string) => {
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
  const onShow = (id: string, inPlayer?: boolean, inModal?: boolean) => {
    const isLoaded = loaded.get().includes(id);
    if (isLoaded) {
      setViewingId(id, inPlayer, inModal);
    } else {
      getProjectSlides({ projectId: id }, { id: id, inPlayer: inPlayer, inModal: inModal });
      addLoading(id);
    }
  };

  const updateProjects = () => {
    loadStore(localCallback);
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

  const onDelete = (id: string) => {
    if (isNull(id) || id == DEFAULT_LOCAL_PROJECT_ID || id == localId.get()) {
      resetStore();
    }
    const deletedProject = projects.get().find((el) => el.id == id);
    if (deletedProject?.backup === 'server') {
      addLoading(id);
      deleteProject({ projectId: id }, id);
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

  const onDownload = (id: string) => {
    addLoading(id);
    downloadZIP({ projectId: id }, id);
  };

  useEffect(() => {
    updateProjects();
  }, []);

  return (
    <Projects
      isLoading={isLoading || localLoading}
      loading={loading.get()}
      projects={projects.get()}
      viewingId={viewingId.get()}
      localId={localId.get() ?? DEFAULT_LOCAL_PROJECT_ID}
      onCreate={onCreate}
      onChangeProject={onChangeProject}
      onEdit={onEdit}
      onDelete={onDelete}
      onDownload={onDownload}
      onSave={onSave}
      onShow={onShow}
    />
  );
});

const Projects: React.FC<IProjects> = (props) => {
  const {
    isLoading,
    loading = [],
    projects,
    viewingId,
    localId,
    onCreate,
    onChangeProject,
    onEdit,
    onDelete,
    onDownload,
    onSave,
    onShow,
  } = props;
  const { classes } = useStyles();

  return (
    <Stack className={classes.flexBox} direction={'column'} gap={2}>
      <CreateButton onClick={onCreate} />
      <LoadingLine visible={isLoading} />
      {!isLoading && projects.length === 0 && <Typography sx={{ textAlign: 'center' }}>У вас пока нет проектов</Typography>}
      <ProjectList
        data={projects}
        loading={loading}
        selectedItemId={viewingId}
        localId={localId}
        onChange={onChangeProject}
        onEdit={onEdit}
        onDelete={onDelete}
        onDownload={onDownload}
        onSave={onSave}
        onShow={onShow}
      />
    </Stack>
  );
};

const CreateButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  return (
    <>
      <Button
        onClick={onClick}
        variant="contained"
        startIcon={<AddRoundedIcon />}
        sx={{ minHeight: 80, textTransform: 'none', display: { xs: 'none', sm: 'none', md: 'inline-flex' } }}
        size="large"
      >
        Создать новый проект
      </Button>
      <CreateFAButton onClick={onClick} />
    </>
  );
};

const CreateFAButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 8,
        right: 20,
        display: { xs: 'inline-flex', md: 'none' },
        justifyContent: 'flex-end',
      }}
    >
      <Tooltip title="Создать новый проект">
        <Fab color={'primary'} aria-label="add" onClick={onClick}>
          <AddRoundedIcon />
        </Fab>
      </Tooltip>
    </Box>
  );
};
