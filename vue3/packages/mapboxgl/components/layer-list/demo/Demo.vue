<script setup lang="ts">
import WebMap from '@supermapgis/vue-iclient-mapboxgl/web-map/webmap.vue'
import LayerList from '../layerList.vue'
import { Button } from 'ant-design-vue';
import { ref } from 'vue'
import '../style'

const position = ref('top-left')
const mapTarget = ref(null)


const changePosition = (pos: string) => {
  position.value = pos;
}
const changeMapTarget = () => {
  mapTarget.value = mapTarget.value === 'map1' ? 'map' : 'map1';
}
</script>
<template>
  <div> 
    <div><Button @click="changePosition('top-right')">切换位置</Button></div>
    <div><Button @click="changeMapTarget">切换绑定地图</Button></div>
    <WebMap serverUrl="http://172.16.14.44:8190/iportal" :map-id="1641486307" target="map1">
      <LayerList :position="position" :map-target="mapTarget" headerName="tuceng"></LayerList>
    </WebMap>
  </div>
</template>
<style>
</style>
