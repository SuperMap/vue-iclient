<script setup lang="ts">
import { ref } from 'vue'
import CoordinateConversion from '../coordinate-conversion.vue'
import WebMap from '@supermapgis/mapboxgl/components/web-map/webmap.vue'
import '../style'

const position = ref('top-left')
const mapTarget = ref('map1')
</script>
<template>
  <div>
    <WebMap serverUrl="http://172.16.14.44:8190/iportal" :map-id="331024164" target="map1">
      <CoordinateConversion :position="position" :map-target="mapTarget" headerName="坐标转换" />
    </WebMap>
  </div>
</template>
<style lang="scss">
@use '@supermapgis/mapboxgl/theme-chalk/webmap.scss';

.sm-component-web-map {
  height: 800px;
}
</style>
