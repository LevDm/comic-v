import { isNull } from 'lodash';
import { IObservableValue, action, computed, observable } from 'mobx';

import { RequeiredProject } from '@/api/projects/get-project';

export type TSlide = {
  id: string;
  description: string | null;
  script: string | null;
  heroesId: string[];
  imageId: string | null;
  thesesId: string | null;
  sceneDetailsId: string[];
};

export type TLightSlide = {
  id: string;
  description: string | null;
  image: string | null;
};

export type TImageFormat = '9/16' | '3/4' | '4/5' | '1/1' | '4/3' | '16/9';
export type TBackupProject = 'local' | 'server';
export type TImageStyle = 'UHD' | 'ANIME' | 'KANDINSKY' | 'DEFAULT';
export type TProcessStage = 'emply' | 'initial' | 'editing';

type TRefrence = {
  id: string;
  text: string;
};

type ProjectParams = {
  id: null | string;
  format: TImageFormat;
  style: TImageStyle;
  backup: TBackupProject;
  creationDate: null | string | Date;
};

type SceneItem = { id: string; description: string };
type HeroItem = { id: string; name: string; description: string };

type ProjectContent = {
  theme: string | null;
  name: string | null;
  refrence: TRefrence[];

  scenesDetails: SceneItem[];

  heroes: HeroItem[];

  slides: TSlide[];

  imagesPull: Record<string, ImageItem[]>;
};

type ImageItem = { id: string; image: string };

type Project = ProjectParams & ProjectContent;

const PROJECT_START: Project = {
  id: null,

  theme: null,
  name: null,
  refrence: [],

  format: '4/3',
  style: 'UHD',
  backup: 'local',

  creationDate: null,

  scenesDetails: [],

  heroes: [],

  slides: [],

  imagesPull: {},
};

type Proccess = {
  lastSave: null | string | Date;
  stage: TProcessStage;
  selectedSlide: string | null;
  //loading: string[];
};

const DEFAULT_STORE: Project & Proccess = {
  lastSave: null,

  stage: 'emply',
  selectedSlide: null,

  ...PROJECT_START,
};

export type CallbackLoad = () => void;

export type KeyAPI = 'GD' | 'GS' | 'K';
export type API = 'G' | 'K';

type Stacks = 'loadingStackGD' | 'loadingStackGS' | 'loadingStackK';
const loadingStack: Record<KeyAPI, Stacks> = {
  GD: 'loadingStackGD',
  GS: 'loadingStackGS',
  K: 'loadingStackK',
};
export const DEFAULT_LOCAL_PROJECT_ID = 'new-project-0';
export class ProcessStore {
  readonly storageName: string = 'PROCESS_STORE';
  isloading: IObservableValue<boolean> = observable.box(false);
  loadSuccses: IObservableValue<boolean> = observable.box(false);
  error: IObservableValue<unknown | null> = observable.box(null);
  //
  lastSave: IObservableValue<Proccess['lastSave']> = observable.box(DEFAULT_STORE.lastSave);
  stage: IObservableValue<Proccess['stage']> = observable.box(DEFAULT_STORE.stage);
  selectedSlide: IObservableValue<Proccess['selectedSlide']> = observable.box(DEFAULT_STORE.selectedSlide, { deep: false });

  loadingStackGD: IObservableValue<string[]> = observable.box([]);
  loadingStackGS: IObservableValue<string[]> = observable.box([]);
  loadingStackK: IObservableValue<string[]> = observable.box([]);

  id: IObservableValue<ProjectParams['id']> = observable.box(DEFAULT_STORE.id);
  backup: IObservableValue<ProjectParams['backup']> = observable.box(DEFAULT_STORE.backup);
  creationDate: IObservableValue<ProjectParams['creationDate']> = observable.box(DEFAULT_STORE.creationDate);
  format: IObservableValue<ProjectParams['format']> = observable.box(DEFAULT_STORE.format);
  style: IObservableValue<ProjectParams['style']> = observable.box(DEFAULT_STORE.style);

  name: IObservableValue<ProjectContent['theme']> = observable.box(DEFAULT_STORE.name);
  theme: IObservableValue<ProjectContent['theme']> = observable.box(DEFAULT_STORE.theme);

  refrence: IObservableValue<ProjectContent['refrence']> = observable.box(DEFAULT_STORE.refrence, { deep: false });

  scenesDetails: IObservableValue<ProjectContent['scenesDetails']> = observable.box(DEFAULT_STORE.scenesDetails, { deep: false });

  heroes: IObservableValue<ProjectContent['heroes']> = observable.box(DEFAULT_STORE.heroes, { deep: false });

  slides: IObservableValue<ProjectContent['slides']> = observable.box(DEFAULT_STORE.slides, { deep: false });

  imagesPull: IObservableValue<ProjectContent['imagesPull']> = observable.box(DEFAULT_STORE.imagesPull, { deep: false });

  // ---
  getViewingProject = () => {
    if (this.stage.get() === 'emply') return null;
    const localProject = {
      id: this.id.get() ?? DEFAULT_LOCAL_PROJECT_ID,
      format: this.format.get(),
      style: this.style.get(),
      backup: this.backup.get(),
      creationDate: this.creationDate.get() ?? new Date(),
      theme: this.theme.get() ?? '',
      name: this.name.get() ?? '',
      slides: this.lightSlides.get(),
    };
    return localProject;
  };
  getServerSavedProject = () => {
    const parseSlides = this.slides.get().map((el, index) => ({
      order_number: index + 1,
      script: el.script ?? '',
      text_on_shot: el.description ?? '',
      image: this.getSlideImage(el.id, el.imageId ?? '') ?? '',
      heroes: el.heroesId,
      scene: el.sceneDetailsId,
      thesis: this.refrence.get().find((thesis) => thesis.id == el.thesesId)?.text ?? '',
    }));
    const project = {
      id: this.id.get(), //...(!isNull(this.id.get()) && { project_id: this.id.get() }),
      format: this.format.get(),
      style: this.style.get(),
      theme: this.theme.get() ?? '',
      name: this.name.get() ?? `Неназванный проект`,
      slides: parseSlides,
      scenes_pull: this.scenesDetails.get(),
      heroes_pull: this.heroes.get(),
    };
    return project;
  };
  setBackup = action((value: ProjectParams['backup']) => {
    this.backup.set(value);
  });
  setProjectLoading = action((value: boolean) => {
    this.isloading.set(value);
  });
  setProjectId = action((newId: ProjectParams['id']) => {
    this.id.set(newId);
    this.saveStore();
  });

  setStyle = action((newStyle: ProjectParams['style']) => {
    this.style.set(newStyle);
    this.saveStore();
  });

  setFormat = action((newFormat: ProjectParams['format']) => {
    this.format.set(newFormat);
    this.saveStore();
  });
  formatNumber = computed(() => {
    const [width, heidht] = this.format
      .get()
      .split('/')
      .map((el: string) => parseInt(el));
    const number = width / heidht;
    if (isNaN(number)) return 1;
    return number;
  });

  addLoading = action((id: string, api: KeyAPI) => {
    const key = loadingStack[api];
    const newLoading = [...this[key].get(), id];
    this[key].set(newLoading);
  });
  removeLoading = action((id: string, api: KeyAPI) => {
    const key = loadingStack[api];
    const newLoading = [...this[key].get()];
    const index = newLoading.indexOf(id);
    newLoading.splice(index, 1);
    this[key].set(newLoading);
  });
  loading = computed(() => {
    const stackGD = this.loadingStackGD.get().map((value) => ({ api: 'G' as API, slideId: value }));
    const stackGS = this.loadingStackGS.get().map((value) => ({ api: 'G' as API, slideId: value }));
    const stackK = this.loadingStackK.get().map((value) => ({ api: 'K' as API, slideId: value }));
    return [...stackGS, ...stackGD, ...stackK];
  });

  setStage = action((value: Proccess['stage']) => {
    if (value === 'initial') {
      this.creationDate.set(new Date().toISOString());
    }
    this.stage.set(value);
    this.saveStore();
  });

  getSlideImage = (slideId: string, imageId: string) => {
    const pull = this.imagesPull.get();
    const imageItem = pull[slideId]?.find((img) => img.id == imageId);
    return imageItem?.image;
  };

  lightSlides = computed(() => {
    const slides = this.slides.get();
    const pull = this.imagesPull.get();
    return slides.map((slide) => {
      const imageItem = pull[slide.id]?.find((img) => img.id == slide.imageId);
      return {
        id: slide.id,
        image: imageItem?.image ?? null,
        description: slide.description,
      };
    });
  });

  selectedSlideData = computed(() => {
    try {
      const slides = this.slides.get();

      const slideId = this.selectedSlide.get() ?? slides[0]?.id ?? null;
      const index = slides.findIndex((el) => el.id == slideId);

      if (isNull(slideId) || index < 0) {
        return null;
      }
      const slide = slides[index];

      const imageItem = this.imagesPull.get()[slideId]?.find((el) => el.id == slide.imageId);

      const theses = this.refrence.get().find((el) => el.id == slide.thesesId);

      const result: TSlide & {
        id: string;
        index: number;
        imageItem: ImageItem | null;
        theses: TRefrence | null;
        scenesItems: SceneItem[];
        heroesItems: HeroItem[];
      } = {
        ...slide,
        //id: slideId,
        index: index,
        imageItem: imageItem ?? null,
        theses: theses ?? null,
        scenesItems: this.scenesDetails.get().filter((el) => slide.sceneDetailsId.includes(el.id)),
        heroesItems: this.heroes.get().filter((el) => slide.heroesId.includes(el.id)),
      };
      return result;
    } catch (e) {
      console.error(e);
      return null;
    }
  });

  deleteHero = action((slideId: string, itemId: string) => {
    const newHeros = this.slides
      .get()
      .find((el) => el.id == slideId)
      ?.heroesId.filter((el) => el != itemId);
    this.updateSlide(slideId, { heroesId: newHeros });
  });
  deleteScene = action((slideId: string, itemId: string) => {
    const newSceneDetailsId = this.slides
      .get()
      .find((el) => el.id == slideId)
      ?.sceneDetailsId.filter((el) => el != itemId);
    this.updateSlide(slideId, { sceneDetailsId: newSceneDetailsId });
  });
  addHero = action((slideId: string, itemId: string) => {
    const newHeros = [itemId, ...(this.slides.get().find((el) => el.id == slideId)?.heroesId ?? [])];
    this.updateSlide(slideId, { heroesId: newHeros });
  });
  addScene = action((slideId: string, itemId: string) => {
    const newValue = [itemId, ...(this.slides.get().find((el) => el.id == slideId)?.sceneDetailsId ?? [])];
    this.updateSlide(slideId, { sceneDetailsId: newValue });
  });
  createAddScene = action((slideId: string, value: { description: string }) => {
    const id = `scene-${Date.now()}`;
    const newItem = {
      id: id,
      ...value,
    };
    const news = [newItem, ...this.scenesDetails.get()];
    this.scenesDetails.set(news);

    const newValue = [id, ...(this.slides.get().find((el) => el.id == slideId)?.sceneDetailsId ?? [])];
    this.updateSlide(slideId, { sceneDetailsId: newValue });
  });
  createAddHero = action((slideId: string, value: { description: string; name: string }) => {
    const id = `hero-${Date.now()}`;
    const newItem = {
      id: id,
      ...value,
    };
    const news = [newItem, ...this.heroes.get()];
    this.heroes.set(news);

    const newValue = [id, ...(this.slides.get().find((el) => el.id == slideId)?.heroesId ?? [])];
    this.updateSlide(slideId, { heroesId: newValue });
  });
  updateHero = action((itemId: string, value: { description?: string; name?: string }) => {
    const news = [...this.heroes.get()];
    const index = news.findIndex((el) => el.id == itemId);
    const val = {
      description: value.description ?? news[index].description,
      name: value.name ?? news[index].name,
    };
    news[index] = { ...news[index], ...val };
    this.heroes.set(news);
  });
  updateScene = action((itemId: string, value: { description?: string }) => {
    const news = [...this.scenesDetails.get()];
    const index = news.findIndex((el) => el.id == itemId);
    const val = {
      description: value.description ?? news[index].description,
    };
    news[index] = { ...news[index], ...val };
    this.scenesDetails.set(news);
  });

  setSelectedSlide = action((slideId: Proccess['selectedSlide']) => {
    this.selectedSlide.set(slideId);
  });

  setTheme = action((text: string) => {
    this.theme.set(text);
    this.saveStore();
  });

  setName = action((text: string) => {
    this.name.set(text);
    this.saveStore();
  });

  setRefrence = action((refrenceList: ProjectContent['refrence']) => {
    this.refrence.set(refrenceList);
    this.saveStore();
  });

  updateRefrence = (id: string, value: string) => {
    const newRefrence = [...this.refrence.get()];
    const index = newRefrence.findIndex((el) => el.id == id);
    newRefrence[index].text = value;
    this.setRefrence(newRefrence);
  };

  setSlides = action((newSlides: ProjectContent['slides']) => {
    if (newSlides.length > 0 && this.slides.get().length == 0) {
      this.setSelectedSlide(newSlides[0].id);
    }

    const selected = this.selectedSlide.get();
    const index = this.slides.get().findIndex((el) => el.id == selected);
    const newIndex = Math.max(Math.min(index + 1, newSlides.length - (index >= newSlides.length - 1 ? 2 : 1)), 0);
    const newSelected = newSlides.find((el) => el.id == selected) ?? newSlides[newIndex] ?? null;
    this.setSelectedSlide(newSelected.id);

    this.slides.set(newSlides);
    this.saveStore();
  });

  setHeroes = action((heroesList: ProjectContent['heroes']) => {
    this.heroes.set(heroesList);
    this.saveStore();
  });

  setScenes = action((scenesList: ProjectContent['scenesDetails']) => {
    this.scenesDetails.set(scenesList);
    this.saveStore();
  });

  setImageToPull = action((slideId: string, image: string, custId?: string) => {
    const newPull = { ...this.imagesPull.get() };
    const imageId = custId ?? `image-${Date.now().toString()}`;
    const imageItem = { image: image, id: imageId };
    newPull[slideId] = [...(newPull[slideId] ?? []), imageItem];
    this.imagesPull.set(newPull);
    this.saveStore();

    const slide = this.slides.get().find((el) => el.id == slideId) ?? null;
    if (!isNull(slide)) {
      if (isNull(slide.imageId) || newPull[slideId].length <= 1) {
        this.updateSlide(slideId, { imageId: imageId });
      }
    }
  });
  removeImageToPull = action((slideId: string, imageId: string) => {
    const newPull = { ...this.imagesPull.get() };
    const images = this.imagesPull.get()[slideId] ?? [];

    const index = images.findIndex((el) => el.id == imageId);
    const newImages = [...images].filter((el) => el.id != imageId);

    newPull[slideId] = newImages;

    const newIndex = Math.max(Math.min(index + 1, newImages.length - (index >= newImages.length - 1 ? 2 : 1)), 0);
    const newTargetItem = newImages[newIndex] ?? null;

    this.updateSlide(slideId, { imageId: newTargetItem?.id });

    this.imagesPull.set(newPull);
  });

  updateSlide = (slideId: string, value: Partial<Omit<ProjectContent['slides'][0], 'id'>>) => {
    const newSlides = [...this.slides.get()];
    const index = newSlides.findIndex((el) => el.id == slideId);
    newSlides[index] = { ...newSlides[index], ...value };
    this.setSlides(newSlides);
  };
  addSlide = (index?: number, count?: number) => {
    const newSlides = [...this.slides.get()];
    const add: ProjectContent['slides'] = [];

    for (let i = 0; i < (count ?? 1); i++) {
      const id = `slide-${(Date.now() + i).toString()}`;
      const newSlide: ProjectContent['slides'][0] = {
        id: id,
        script: null,
        description: null,
        imageId: null,
        thesesId: null,
        heroesId: [],
        sceneDetailsId: [],
      };
      add.push(newSlide);
    }

    newSlides.splice(index ?? 0, 0, ...add);
    this.setSlides(newSlides);

    return add;
  };
  moveSlide = (slideId: string, index: number) => {
    const newSlides = [...this.slides.get()];
    const curIndex = newSlides.findIndex((el) => el.id == slideId);
    const slide = newSlides[curIndex];
    newSlides.splice(curIndex, 1);
    const newIndex = index + (curIndex > index ? -1 : 0);
    newSlides.splice(newIndex, 0, slide);

    this.setSlides(newSlides);
  };
  deleteSlide = (slideId: string) => {
    const newSlides = [...this.slides.get()];
    const curIndex = newSlides.findIndex((el) => el.id == slideId);
    const deletedSlide = newSlides[curIndex];
    newSlides.splice(curIndex, 1);

    if (!isNull(deletedSlide.thesesId)) {
      const newRefrence = [...this.refrence.get()];
      const thesesIndex = newRefrence.findIndex((el) => el.id == slideId);
      newRefrence.splice(thesesIndex, 1);
      this.setRefrence(newRefrence);
    }

    this.setSlides(newSlides);
  };
  parseSetTheses = (value: string[]) => {
    const newTheses = value.map((text, index) => ({
      id: `theses-${Date.now() + (index ?? 0)}`,
      text: text,
    }));
    this.setRefrence(newTheses);
  };
  addTheses = (text: string, index?: number) => {
    const newTheses = [...this.refrence.get()];
    const newItem: TRefrence = {
      id: `theses-${Date.now() + (index ?? 0)}`,
      text: text,
    };
    newTheses.splice(index ?? 0, 0, newItem);
    this.setRefrence(newTheses);
    return newItem;
  };
  updateTheses = (text: string, index: number) => {
    const newTheses = [...this.refrence.get()];
    newTheses[index] = { ...newTheses[index], text: text };
    this.setRefrence(newTheses);
  };
  moveTheses = (oldIndex: number, index: number, item: TRefrence) => {
    const newTheses = [...this.refrence.get()];
    newTheses.splice(oldIndex, 1);
    const newIndex = Math.max(index + (oldIndex > index ? -1 : 0), 0);
    newTheses.splice(newIndex, 0, item);
    this.setRefrence(newTheses);
  };
  deleteTheses = (index: number) => {
    const newTheses = [...this.refrence.get()];
    newTheses.splice(index, 1);
    this.setRefrence(newTheses);
  };
  // ---

  parseStore = () => {
    try {
      const res: Project & Proccess = {
        lastSave: this.lastSave.get(),

        stage: this.stage.get(),
        selectedSlide: this.selectedSlide.get(),

        creationDate: this.creationDate.get(),

        id: this.id.get(),

        backup: this.backup.get(),

        format: this.format.get(),
        style: this.style.get(),

        name: this.name.get(),
        theme: this.theme.get(),
        refrence: this.refrence.get(),

        scenesDetails: this.scenesDetails.get(),
        heroes: this.heroes.get(),
        slides: this.slides.get(),
        imagesPull: this.imagesPull.get(),
      };

      return res;
    } catch (e) {
      console.error(e);
    }
  };

  setInProcess = (project: RequeiredProject) => {
    const refrence: Project['refrence'] = [];
    const imageesPull: Project['imagesPull'] = {};
    const slides: Project['slides'] = [];

    let i = 0;
    for (const slide of project.slides) {
      const slideId = `slide-${Date.now().toString() + i}`;
      const imageId = `image-${Date.now().toString() + i}`;
      const thesisId = `thesis-${Date.now().toString() + i}`;

      const fslide: Project['slides'][0] = {
        id: slideId,
        description: slide.text_on_shot,
        script: slide.script,
        heroesId: slide.heroes,
        imageId: imageId,
        thesesId: thesisId,
        sceneDetailsId: slide.scene,
      };
      refrence.push({ id: thesisId, text: slide.thesis });
      slides.push(fslide);
      imageesPull[slideId] = [{ id: imageId, image: slide.image }];

      i++;
    }

    const selectedSlide = slides[0]?.id ?? null;
    const stage = isNull(selectedSlide) ? 'emply' : 'editing';

    const formatProject: Project & Proccess = {
      lastSave: null,

      stage: stage,
      selectedSlide: selectedSlide,

      creationDate: project.creation_date,

      id: project.project_id ?? project.user_id,

      backup: 'server',

      format: project.format,
      style: project?.style ?? 'UHD',

      name: project.project_name,
      theme: project.theme,
      refrence: refrence, //<-

      scenesDetails: project.scenes_pull,
      heroes: project.heroes_pull,

      slides: slides, //<-

      imagesPull: imageesPull, //<-
    };

    this.setStore(formatProject);
  };

  setStore = action((data: Project & Proccess) => {
    try {
      const selectedSlide = data.slides.find((el) => el.id == data.selectedSlide) ?? data.slides[0] ?? null;

      this.lastSave.set(data.lastSave);

      this.stage.set(data.stage);
      this.selectedSlide.set(selectedSlide?.id);

      this.creationDate.set(data.creationDate);

      this.id.set(data.id);

      this.backup.set(data.backup);

      this.format.set(data.format);
      this.style.set(data?.style ?? 'UHD');

      this.name.set(data.name);
      this.theme.set(data.theme);
      this.refrence.set(data.refrence);

      this.scenesDetails.set(data.scenesDetails);
      this.heroes.set(data.heroes);
      this.slides.set(data.slides);
      this.imagesPull.set(data.imagesPull);
    } catch (e) {
      console.error(e);
      this.error.set(e);
    }
  });

  loadStore = action(async (callback?: CallbackLoad) => {
    this.error.set(null);
    this.isloading.set(true);
    try {
      const load = localStorage.getItem(this.storageName);

      if (!isNull(load)) {
        const data = JSON.parse(load) as Project & Proccess;
        this.setStore(data);
      }

      this.loadSuccses.set(true);
    } catch (e) {
      console.error(e);
      this.error.set(e);
    } finally {
      this.isloading.set(false);
      callback?.();
    }
  });

  saveStore = action(async (disabledTracking?: boolean) => {
    this.error.set(null);
    try {
      const tracking = !(disabledTracking ?? false);
      const saveTime = new Date();
      if (tracking) {
        this.lastSave.set(saveTime);
        this.backup.set('local');
      }

      const savedData = {
        ...this.parseStore(),
        ...(tracking && {
          lastSave: saveTime,
          backup: 'local',
        }),
      };
      localStorage.setItem(this.storageName, JSON.stringify(savedData));
    } catch (e) {
      console.error(e);
      this.error.set(e);
    }
  });

  resetStore = () => {
    this.setStore(DEFAULT_STORE);
    this.saveStore(true);
  };

  resetStorage = () => {
    localStorage.removeItem(this.storageName);
  };
}
