<template>
  <div flex-grow />

  <button class="slidev-icon-btn lt-md:hidden" :class="{
    'op-100': shellVisible
  }" title="Show editor" @click="shellVisible = !shellVisible">
    <span class="sr-only">Show shell</span>
    <div class="i-carbon:terminal"></div>
  </button>
</template>

<script setup lang="ts">
import { useShellStates } from './states';
const { shellVisible } = useShellStates();
</script>