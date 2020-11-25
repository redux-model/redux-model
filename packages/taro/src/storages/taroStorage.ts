import { PersistStorage } from '@redux-model/core';
import { getTaro } from '../utils/getTaro';

const TaroJS = getTaro();

const taro: PersistStorage = {
  getItem(key) {
    return Promise.resolve().then(() => {
      try {
        const data = TaroJS.getStorageSync(key);
        if (data === '') {
          return null;
        }
        return typeof data === 'string' ? data : null;
      } catch (e) {
        // Mini program will throw error when key is not found.
        return null;
      }
    });
  },
  setItem(key, value) {
    return Promise.resolve().then(() => {
      return TaroJS.setStorageSync(key, value);
    });
  },
};

export default taro;
