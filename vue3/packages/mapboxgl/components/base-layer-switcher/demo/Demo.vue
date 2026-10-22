<script setup lang="ts">
import { ref } from 'vue'
import WebMap from '@supermapgis/mapboxgl/components/web-map/webmap.vue'
import BaseLayerSwitcher from '../base-layer-switcher.vue'
import type { BaseLayerItem } from '../types'
import '../style'

defineOptions({
  name: 'BaseLayerSwitcherDemo'
})

const layers = ref<BaseLayerItem[]>([
  {
    id: 'china-imagery',
    title: '影像地图',
    thumbnail: 'https://tile.openstreetmap.org/6/52/27.png',
    sources: {
      'china-imagery': {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap contributors'
      }
    },
    layers: [{ id: 'china-imagery', type: 'raster', source: 'china-imagery' }]
  },
  {
    id: 'china-dark',
    title: '深色地图',
    thumbnail: 'https://basemaps.cartocdn.com/dark_all/6/52/27.png',
    sources: {
      'china-dark': {
        type: 'raster',
        tiles: ['https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
      }
    },
    layers: [{ id: 'china-dark', type: 'raster', source: 'china-dark' }]
  }
])

const baseLayerInfo = ref({ show: true, title: '原始底图', thumbnail: '' })
</script>

<template>
  <WebMap serverUrl="http://172.16.14.44:8190/iportal" :map-id="331024164" target="base-layer-map">
    <BaseLayerSwitcher
      map-target="base-layer-map"
      :layers="layers"
      :base-layer-info="baseLayerInfo"
      :collapsed="false"
    />
  </WebMap>
</template>

<style lang="scss">
@use '@supermapgis/mapboxgl/theme-chalk/webmap.scss';

.sm-component-web-map {
  height: 800px;
}
</style>
