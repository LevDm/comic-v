import { TBackupProject, TImageFormat, TImageStyle } from '../mobx-stores/process-store';

type IDSlide = string;

export type TProcessProject = {
  id: string;
  format: TImageFormat;
  style: TImageStyle;
  backup: TBackupProject;
  creationDate: Date | string;
  theme: string;
  name: string;

  //scenesDetails: { id: IDSceneDetail; description: string }[];
  //heroesDetails: { id: IDHeroDetail; description: string }[];
  //heroes: { id: IDHero; name: string }[];
  //imagesPull: Record<IDSlide, { id: IDImage; image: string }[]>;

  slides: {
    id: IDSlide;
    //order?: number;
    //scene: IDSceneDetail[];
    //heroes: { hero_id: IDHero; details_id: IDHeroDetail[] }[];
    image: string | null;
    description: string | null;
  }[];
};
