<script setup lang="ts">
import Draw from '../draw.vue'
import WebMap from '@supermapgis/mapboxgl/components/web-map/webmap.vue'
import Button from '@supermapgis/common/components/button/Button'
import { ref } from 'vue'
import '../style'

const position = ref('top-left')
const mapTarget = ref('map1')
const bgColor = ref()

const changeBg = () => {
  bgColor.value = bgColor.value === '#d90f' ? '#f0f' : '#d90f'
}
</script>
<template>
  <div>
    <div>
      <Button type="primary" @click="changeBg">切换背景</Button>
    </div>
    <WebMap serverUrl="http://172.16.14.44:8190/iportal" :map-id="331024164" target="map1">
      <Draw
        :position="position"
        :map-target="mapTarget"
        :background="bgColor"
      />
    </WebMap>
  </div>
</template>
<style lang="scss">
@use '@supermapgis/common/theme-chalk/button.scss';
@use '@supermapgis/mapboxgl/theme-chalk/webmap.scss';

.sm-component-web-map {
  margin-right: 10px;
  height: 800px;
}
</style>
