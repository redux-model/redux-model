import * as Vue from 'vue';
import cloneDeep from 'clone';
import { applyPatch } from './diff';
import { storeHelper } from '@redux-model/core';

storeHelper.listenOnce(() => {
  const getCurrentState = storeHelper.store.getState as () => object;
  let originalState = getCurrentState();
  const observer = Vue.reactive(cloneDeep(originalState));

  // Vue component will never visit state during dispatching.
  // So original state will respond by storeHelper.getState() during dispatching.
  storeHelper.getState = () => {
    return observer;
  };

  storeHelper.store.subscribe(() => {
    const currentState = getCurrentState();

    if (currentState !== originalState) {
      applyPatch(originalState, currentState, observer);
      originalState = currentState;
    }
  });
});
