import { PersistStorage } from '../stores/Persist';

const cache: Record<string, string> = {};

const memory: PersistStorage = {
  getItem(key) {
    const data = cache.hasOwnProperty(key) && cache[key] !== undefined ? cache[key] : null;

    return Promise.resolve(data);
  },
  setItem(key, value) {
    cache[key] = value;
    return Promise.resolve();
  },
};

export default memory;
