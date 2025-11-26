import { createSharedComposable, useEventListener, useSessionStorage, whenever } from '@vueuse/core';
import { ref } from 'vue';

export const useShellStates = createSharedComposable(() => {
  const shellVisible = useSessionStorage('slidev-addon-shell:visible', false);

  const focusTerminal = ref(() => { });

  whenever(shellVisible, () => {
    focusTerminal.value();
  });

  useEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === '`') {
      e.preventDefault();
      e.stopImmediatePropagation();
      e.stopPropagation();
      shellVisible.value = !shellVisible.value;
    }
  }, true);

  return {
    shellVisible,
    focusTerminal
  };
});
