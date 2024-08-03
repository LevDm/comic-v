'use client';

import React, { useEffect } from 'react';

import { CallbackLoad, ProcessStore } from './process-store';
import { ViewStore } from './view-store';

interface IRootStore {
  processStore: ProcessStore;
  viewStore: ViewStore;
}

class RootStore implements IRootStore {
  processStore: ProcessStore;
  viewStore: ViewStore;

  constructor() {
    this.processStore = new ProcessStore();
    this.viewStore = new ViewStore();
  }
}

const Root = new RootStore();

export const StoreContext = React.createContext(Root);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  return <StoreContext.Provider value={Root}>{children}</StoreContext.Provider>;
};

interface IUseProcessStore {
  onLoad?: CallbackLoad;
}
export const useProcessStore = (params?: IUseProcessStore) => {
  const store = React.useContext(StoreContext).processStore;

  useEffect(() => {
    if (!store.loadSuccses.get()) {
      store.loadStore(params?.onLoad);
    }
  }, []);

  if (!store) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return store;
};

export const useViewStore = () => {
  const store = React.useContext(StoreContext).viewStore;
  if (!store) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return store;
};
