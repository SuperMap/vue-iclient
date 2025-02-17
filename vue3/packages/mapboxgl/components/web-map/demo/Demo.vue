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
    <Button @click="changeMapId(1641486307)">切换地图</Button>
    <WebMap serverUrl="http://172.16.14.44:8190/iportal" :map-id="mapId" @mousedown="handleMousedown"></WebMap>
  </div>
</template>
<style>
#map {
  width: 100%;
  height: 900px;
}
</style>
