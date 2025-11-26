<template>
  <!-- @vue-expect-error -->
  <Transition v-if="__SLIDEV_HAS_SERVER__" name="terminal-slide">
    <div fixed inset-0 backdrop-blur-12px class="bg-[#dddddd77]" v-show="shellVisible">
      <Terminal absolute inset-6px :is-dark="isDark" />
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useDarkMode } from '@slidev/client';
import Terminal from './Terminal.vue';
import { useShellStates } from './states';

const { isDark } = useDarkMode()
const { shellVisible } = useShellStates();
</script>

<style scoped>
/* 上浮下沉动画效果 */
.terminal-slide-enter-active,
.terminal-slide-leave-active {
  transition: all 0.25s ease-out;
}

.terminal-slide-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.terminal-slide-enter-to {
  transform: translateY(0);
  opacity: 1;
}

.terminal-slide-leave-from {
  transform: translateY(0);
  opacity: 1;
}

.terminal-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>