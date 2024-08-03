import { compareAsc } from 'date-fns';
import { isNull } from 'lodash';
import { IObservableValue, action, computed, observable } from 'mobx';

import { TBackupProject, TImageFormat, TImageStyle, TProcessStage } from './process-store';

export type Project = {
  project_id: string;
  theme: string;
  format?: TImageFormat;
  style?: TImageStyle;
  project_name: string;
  creation_date: string | Date;
  slides: Slide[];
};

type Slide = {
  image: string;
  text_on_shot: string;
};

export type MyProject = {
  id: string;
  format: TImageFormat;
  style: TImageStyle;
  backup: TBackupProject;
  creationDate: string | Date;
  theme: string;
  name: string;
  slides: {
    id: string;
    image: string;
    description: string;
  }[];
};

type IViewStore = {
  projects: MyProject[];
  loading: string[];
  viewingId: string | null;
  loaded: string[];
};

const DEFAULT_STORE: IViewStore = {
  projects: [],
  loaded: [],
  loading: [],
  viewingId: null,
};

export class ViewStore {
  projects: IObservableValue<IViewStore['projects']> = observable.box(DEFAULT_STORE.projects, { deep: false });
  loading: IObservableValue<IViewStore['loading']> = observable.box(DEFAULT_STORE.loading);
  viewingId: IObservableValue<IViewStore['viewingId']> = observable.box(DEFAULT_STORE.viewingId);
  loaded: IObservableValue<IViewStore['loaded']> = observable.box(DEFAULT_STORE.loaded);
  modalPlayer: IObservableValue<boolean> = observable.box(false);
  player: IObservableValue<boolean> = observable.box(false);

  viewingProject = computed(() => {
    const id = this.viewingId.get();
    const project = this.projects.get().find((el) => el.id == id);
    return {
      project: project ?? null,
      inModal: this.modalPlayer.get(),
      inPlayer: this.player.get(),
      isLoading: this.loading.get().findIndex((el) => el == id) >= 0,
      isLoaded: this.loaded.get().findIndex((el) => el == id) >= 0,
    };
  });

  setViewingId = action((id: string | null, inPlayer?: boolean, inModal?: boolean) => {
    this.viewingId.set(id);
    this.modalPlayer.set(inModal ?? false);
    this.player.set(inPlayer ?? false);
  });

  addLoading = action((id: string) => {
    const newValue = [...this.loading.get(), id];
    this.loading.set(newValue);
  });

  addLoaded = action((id: string) => {
    const newValue = [...this.loaded.get(), id];
    this.loaded.set(newValue);
  });

  removeLoading = action((id: string, tracking?: boolean) => {
    const newValue = [...this.loading.get()];
    const index = newValue.indexOf(id);
    newValue.splice(index, 1);
    this.loading.set(newValue);
    if (tracking ?? false) {
      this.addLoaded(id);
    }
  });

  formatSlides = (slides: Slide[]) => {
    return slides.map((slide, index) => ({ id: `s-${index}`, image: slide.image, description: slide.text_on_shot }));
  };

  updateSlidesProject = action((projectId: string, slides: Slide[]) => {
    const formatSlides = this.formatSlides(slides);
    const newProjects = [...this.projects.get()];
    const index = newProjects.findIndex((el) => el.id == projectId);
    newProjects[index] = { ...newProjects[index], slides: formatSlides };
    if (isNull(this.viewingId.get())) {
      this.setViewingId(newProjects[0]?.id ?? null);
    }
    this.projects.set(newProjects);
  });

  setProjects = action((data: Project[], localProject: null | MyProject, stage: TProcessStage) => {
    const isLocalServer = localProject?.backup === 'server';

    const transformData = data
      .map((el) => ({
        id: el.project_id,
        format: el?.format ?? ('1/1' as TImageFormat),
        style: el?.style ?? ('UHD' as TImageStyle),
        backup: 'server' as TBackupProject,
        creationDate: el.creation_date,
        theme: el.theme,
        name: el.project_name,
        slides: this.formatSlides(el.slides),
      }))
      .filter((el) => isLocalServer || el.id != localProject?.id)
      .sort((a, b) => compareAsc(b.creationDate, a.creationDate));

    const projects =
      stage !== 'emply' && !isLocalServer && !isNull(localProject) ? [localProject, ...transformData] : transformData;

    if (!isNull(localProject)) {
      this.loaded.set([localProject.id]);
    }

    const curViewId = this.viewingId.get();
    const isIncludes = projects.findIndex((el) => el.id == curViewId) >= 0;
    if (isNull(curViewId) || !isIncludes) {
      this.setViewingId(projects[0]?.id ?? null);
    }

    this.projects.set(projects);
  });

  removeProject = action((id: string) => {
    const newValue = [...this.projects.get()].filter((el) => el.id != id);
    this.projects.set(newValue);
  });
}
