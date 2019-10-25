import Vue from 'vue';
import cloneDeep from 'lodash.clonedeep';
import { applyPatch } from './diff';
import { onStoreCreated } from '../core/utils/createReduxStore';

onStoreCreated((store) => {
  const getCurrentState = store.getState as () => object;
  let originalState = getCurrentState();
  const observer = Vue.observable(cloneDeep(originalState));

  store.getState = () => {
    return observer;
  };

  store.subscribe(() => {
    const currentState = getCurrentState();

    if (currentState !== originalState) {
      applyPatch(originalState, currentState, observer);
      originalState = currentState;
    }
  });
});

export { createReduxStore } from '../core/utils/createReduxStore';
