<script setup lang="ts">
import LayerList from '../layer-list.vue'
import WebMap from '@supermapgis/mapboxgl/components/web-map/webmap.vue'
import Button from '@supermapgis/common/components/button/Button'
import { ref } from 'vue'
import '../style'

const position = ref('top-left')
const mapTarget = ref('map1')
const bgColor = ref()

const changePosition = (pos: string) => {
  position.value = pos
}
const changeMapTarget = () => {
  const target = mapTarget.value || 'map1'
  mapTarget.value = target === 'map1' ? 'map' : 'map1'
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
    <div class="maps-holder">
      <WebMap serverUrl="http://172.16.14.44:8190/iportal" :map-id="331024164" target="map1">
        <LayerList
          :position="position"
          :map-target="mapTarget"
          :background="bgColor"
          headerName="图层列表1"
        />
      </WebMap>
      <WebMap serverUrl="http://172.16.14.44:8190/iportal" :map-id="1641486307" target="map" />
    </div>
  </div>
</template>
<style lang="scss">
@use '@supermapgis/common/theme-chalk/button.scss';
@use '@supermapgis/mapboxgl/theme-chalk/webmap.scss';

.maps-holder .sm-component-web-map {
  display: inline-block;
  width: 48%;
  margin-right: 10px;
  height: 800px;
}
</style>
