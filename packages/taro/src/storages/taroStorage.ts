import Taro from '@tarojs/taro';
import { PersistStorage } from '../core';

const taro: PersistStorage = {
  async getItem(key) {
    return Taro.getStorage({ key }).then(({ data }) => {
      return typeof data === 'string' ? data : null;
    });
  },
  async setItem(key, value) {
    Taro.setStorage({
      key,
      data: value,
    });
  },
  async removeItem(key) {
    Taro.removeStorage({ key });
  }
};

export default taro;
