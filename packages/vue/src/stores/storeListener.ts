import Vue from 'vue';
import cloneDeep from 'clone';
import { applyPatch } from './diff';
import { storeHelper } from '../core';

storeHelper.listenOnce(({ store }) => {
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
