import Taro from '@tarojs/taro';
import { PersistStorage } from '@redux-model/core';

const taro: PersistStorage = {
  getItem(key) {
    return new Promise((resolve) => {
      Taro.getStorage({ key })
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
      Taro.setStorage({
        key,
        data: value,
      }).then(() => {
        resolve();
      });
    });
  },
};

export default taro;
