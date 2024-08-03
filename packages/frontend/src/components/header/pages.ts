export type TPaths = '/' | '/account' | '/comics' | '/comics/constructor';

export type TPage = {
  title: string;
  path: TPaths;
};

export const PAGES: TPage[] = [
  { title: 'Проекты', path: '/comics' },
  { title: 'Конструктор', path: '/comics/constructor' },
];
