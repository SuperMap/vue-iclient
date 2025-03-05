<script setup lang="ts">
import { reactive } from 'vue'
import Compare from '../compare.vue'
import '../style'

const props = reactive({
  beforeMapOptions: {
    target: 'beforeMap',
    serverUrl: 'https://www.supermapol.com',
    mapId: 2134374143,
    mapOptions: {
      center: [-39.9535, 38.0542],
      zoom: 2.44
    }
  },
  afterMapOptions: {
    target: 'afterMap',
    serverUrl: 'https://www.supermapol.com/',
    mapId: 1127786844,
    mapOptions: {
      center: [-39.9535, 38.0542],
      zoom: 2.44
    }
  }
})
</script>
<template>
  <Compare v-bind="props" style="height: 500px;"/>
</template>
<style></style>
