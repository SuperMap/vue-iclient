<script setup lang="ts">
import WebMap from '@supermapgis/mapboxgl/components/web-map/webmap.vue'
import LayerList from '../layerList.vue'
import Button from '@supermapgis/common/components/button/Button'
import { ref } from 'vue'
import '../style'

const position = ref('top-left')
const mapTarget = ref(null)
const bgColor = ref()


const changePosition = (pos: string) => {
  position.value = pos;
}
const changeMapTarget = () => {
  const target = mapTarget.value || 'map1';
  mapTarget.value = target === 'map1' ? 'map' : 'map1';
}

const changeBg = () => {
  bgColor.value = bgColor.value === '#d90f' ? '#f0f' : '#d90f'
}
</script>
<template>
  <div> 
    <div>
      <Button type="primary" @click="changeBg">切换背景</Button>
      <Button type="primary" @click="changePosition('top-right')">切换位置</Button>
      <Button @click="changeMapTarget">切换绑定地图</Button>
    </div>
    <WebMap serverUrl="http://172.16.14.44:8190/iportal" :map-id="331024164" target="map1">
      <LayerList :position="position" :map-target="mapTarget" :background="bgColor" headerName="tuceng"></LayerList>
    </WebMap>
  </div>
</template>
<style>
</style>
