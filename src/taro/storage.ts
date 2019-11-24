import { PersistStorage } from './types';

let persistStorage: PersistStorage;
let isRn: boolean = false;

export const setStorage = (storage: PersistStorage): void => {
  persistStorage = storage;
  isRn = persistStorage.getEnv() === persistStorage.ENV_TYPE.RN;
};

export const getStorageItem = (key: string): string | null | Promise<string | null> => {
  if (isRn) {
    return persistStorage.getStorage({ key }).then(({ data }) => {
      return data;
    });
  }

  return persistStorage.getStorageSync(key);
};

export const setStorageItem = (key: string, value: any) => {
  if (isRn) {
    return persistStorage.setStorage({
      key,
      data: value,
    });
  }

  return persistStorage.setStorageSync(key, value);
};

export const removeStorageItem = (key: string) => {
  if (isRn) {
    return persistStorage.removeStorage({ key });
  }

  return persistStorage.removeStorageSync(key);
};
