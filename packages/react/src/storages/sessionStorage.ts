import { PersistStorage } from '@redux-model/core';

const session: PersistStorage = {
  async getItem(key) {
    return sessionStorage.getItem(key);
  },
  async setItem(key, value) {
    sessionStorage.setItem(key, value);
  },
  async removeItem(key) {
    sessionStorage.removeItem(key);
  }
};

export default session;
