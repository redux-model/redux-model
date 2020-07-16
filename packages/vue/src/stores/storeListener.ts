import * as Vue from 'vue';
import cloneDeep from 'clone';
import { applyPatch } from './diff';
import { storeHelper } from '../core';

const state = Vue.reactive({
  count: 0,
})

const ok = Vue.computed(() => { state.count + 1 })

ok.value

storeHelper.listenOnce((helper) => {
  const getCurrentState = helper.store.getState as () => object;
  let originalState = getCurrentState();
  const observer = Vue.reactive(cloneDeep(originalState));

  helper.getState = helper.store.getState = () => {
    return observer;
  };

  helper.store.subscribe(() => {
    const currentState = getCurrentState();

    if (currentState !== originalState) {
      applyPatch(originalState, currentState, observer);
      originalState = currentState;
    }
  });
});
