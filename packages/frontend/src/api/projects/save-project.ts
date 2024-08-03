'use client';

import { useCallback } from 'react';

import { isUndefined } from 'lodash';

import { UseFetch, useFetch } from '../use-fetch';

type Hero = {
  id: string;
  name: string;
  description: string;
};

type Detail = {
  id: string;
  description: string;
};

type Parameters = {
  format: string;
  style: string;
  theme: string;
  name: string;
  heroes_pull: Hero[];
  scenes_pull: Detail[];
  slides: {
    thesis: string;
    script: string;
    text_on_shot: string;
    image: string;
    heroes: string[];
    scene: string[];
    order_number: number;
  }[];
};

type Result = {
  project_id: string;
};

type Payload = {
  id: string;

  transition?: string;
  transitionId?: string;
};

export const useSaveProjectRequest = (props?: UseFetch<Result, Payload>) => {
  const { getSessionData, fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const saveProject = useCallback(
    async ({ format, theme, name, slides, heroes_pull, scenes_pull, style }: Parameters, payload: Payload) => {
      const session = await getSessionData();
      const userId = session?.user?.id;

      if (isUndefined(userId)) console.error('user-id !');
      return fetchData(
        `/api/user/project`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            format: format,
            style: style,
            theme: theme,
            project_name: name,
            heroes_pull: heroes_pull,
            scenes_pull: scenes_pull,
            slides: slides,
          }),
        },
        payload,
      );
    },
    [],
  );

  return {
    saveProject: saveProject,
    ...rest,
  };
};
