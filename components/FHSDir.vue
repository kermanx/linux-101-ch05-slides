<script setup lang="ts">
defineProps<{
  path: string
  title: string
}>()
</script>

<template>
  <div class="flex items-start gap-4 my-4">
    <div class="font-mono font-bold w-16">{{ path }}</div>
    <div>
      <div class="font-bold">{{ title }}</div>
      <div class="text-md opacity-80 fhsdir-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<style>
div.fhsdir-content code {
  background: none;
  font-weight: 600;
  padding: 0;
}


div.fhsdir-content li {
  list-style: none;
  margin-left: 0em;
  padding-left: 0em;
}
</style>
