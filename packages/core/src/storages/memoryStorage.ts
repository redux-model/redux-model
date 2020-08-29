import { PersistStorage } from '../stores/Persist';

const cache: Record<string, string> = {};

const memory: PersistStorage = {
  getItem(key) {
    return Promise.resolve(
      cache[key] === undefined ? null : cache[key]
    );
  },
  setItem(key, value) {
    cache[key] = value;
    return Promise.resolve();
  },
};

export default memory;
