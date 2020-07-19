import { PersistStorage } from '@redux-model/core';

const session: PersistStorage = {
  getItem(key) {
    return Promise.resolve(sessionStorage.getItem(key));
  },
  setItem(key, value) {
    return Promise.resolve(sessionStorage.setItem(key, value));
  },
};

export default session;
