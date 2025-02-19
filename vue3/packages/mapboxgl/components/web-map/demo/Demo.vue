<script setup lang="ts">
import WebMap from '../webmap.vue'
import '../style'
import { ref } from 'vue'
import { Button } from 'ant-design-vue';

const mapId = ref(692091022)
const changeMapId = (id) => {
  mapId.value = id;
}
const handleMousedown = (params: Record<string, any>) => {
  console.log(params);
}
</script>
<template>
  <div>
    <div><Button @click="changeMapId(1641486307)">切换地图</Button></div>
    <WebMap serverUrl="http://172.16.14.44:8190/iportal" :map-id="mapId" target="map" @mousedown="handleMousedown"></WebMap>
  </div>
</template>
<style>
#map, #map1 {
  position: absolute;
  top: 80px;
  width: 48%;
  height: 900px;
  margin-top: 300px;
}
#map {
  margin-right: 20px;
  left: 0;
}
#map1 {
  right: 0;
}
</style>
