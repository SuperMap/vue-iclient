<script setup lang="ts">
import WebMap from '../webmap.vue'
import '../style'
import { ref } from 'vue'
import Button from '@supermapgis/common/components/button/Button'

const mapId = ref(692091022)
const changeMapId = (id) => {
  mapId.value = id;
}
const handleMousedown = (params: Record<string, any>) => {
  console.log('mapclick', params);
}

const handleLoad = (params: Record<string, any>) => {
  console.log('load', params);
}
</script>
<template>
  <div>
    <div><Button @click="changeMapId(1641486307)">切换地图</Button></div>
    <WebMap serverUrl="http://172.16.14.44:8190/iportal" :map-id="mapId" target="map" @mousedown="handleMousedown" @load="handleLoad"></WebMap>
  </div>
</template>
<style>
#map, #map1 {
  height: 500px;
}
</style>
