import { PersistStorage } from '../stores/PersistStorage';

const cache: Record<string, string> = {};

const memory: PersistStorage = {
  async getItem(key) {
    return cache.hasOwnProperty(key) && cache[key] !== undefined ? cache[key] : null;
  },
  async setItem(key, value) {
    cache[key] = value;
  },
  async removeItem(key) {
    delete cache[key];
  }
};

export default memory;
