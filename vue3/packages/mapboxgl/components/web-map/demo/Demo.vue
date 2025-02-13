<script setup lang="ts">
import WebMap from '../webmap.vue'
import '../style'
</script>
<template>
  <div>
    <WebMap v-bind="$attrs"></WebMap>
  </div>
</template>
<style>
#map {
  width: 100%;
  height: 900px;
}
</style>
