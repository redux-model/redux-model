import { PersistStorage } from './types';

let persistStorage: PersistStorage;

export const setStorage = (storage: PersistStorage): void => {
  persistStorage = storage;
};

export const getStorageItem = (key: string): Promise<string | null> => {
  return persistStorage.getItem(key);
};

export const setStorageItem = (key: string, value: any): Promise<void> => {
  return persistStorage.setItem(key, value);
};

export const removeStorageItem = (key: string): Promise<void> => {
  return persistStorage.removeItem(key);
};
