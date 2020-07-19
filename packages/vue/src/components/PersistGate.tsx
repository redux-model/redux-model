import { defineComponent, onUnmounted, reactive } from 'vue';
import { storeHelper } from '@redux-model/core';

// TODO: How to receive loading component?
export const PersistGate = defineComponent({
  setup(_, { slots }) {
    const ready = reactive({
      isReady: false,
    });

    const unlisten = storeHelper.persist.listen(() => {
      ready.isReady = true;
    });

    onUnmounted(() => {
      unlisten();
    });

    return () => (
      ready.isReady ? slots.default?.() || null : null
    );
  }
});
