import { PersistStorage } from '@redux-model/core';
import { getTaro } from '../utils/getTaro';

const TaroJS = getTaro();

const taro: PersistStorage = {
  getItem(key) {
    return new Promise((resolve) => {
      TaroJS.getStorage({ key })
        .then(({ data }) => {
          resolve(typeof data === 'string' ? data : null);
        })
        .catch(() => {
          // Mini program will throw error when key is not found.
          resolve(null);
        });
    });
  },
  setItem(key, value) {
    return new Promise((resolve) => {
      TaroJS.setStorage({
        key,
        data: value,
      }).then(() => {
        resolve();
      });
    });
  },
};

export default taro;
