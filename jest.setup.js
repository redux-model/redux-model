const createStorage = () => {
  let store = {};

  return {
    getItem: function(key) {
      return store[key];
    },
    setItem: function(key, value) {
      store[key] = value.toString();
    },
    clear: function() {
      store = {};
    },
    removeItem: function(key) {
      delete store[key];
    }
  }
};

const localStorageMock = createStorage();
const sessionStorageMock = createStorage();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });
Object.defineProperty(globalThis, 'sessionStorage', { value: sessionStorageMock });
