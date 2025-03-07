<script setup lang="ts">
import Identify from '../identify.vue'
import WebMap from '@supermapgis/mapboxgl/components/web-map/webmap.vue'
import Button from '@supermapgis/common/components/button/Button'
import { ref, reactive } from 'vue'
import '../style'

const mapTarget = ref('map1')
const bgColor = ref()
const identifyProps = reactive({
  layers: [
    'ms_base_北京轨道交通分布.geojson_1731400350143_31',
    'ms_composite_symbol_ms_base_北京轨道交通分布.geojson_1731400350143_31_1731400362150_59',
    'ms_composite_symbol_ms_base_北京轨道交通分布.geojson_1731400350143_31_1731400362150_60',
    'ms_composite_symbol_ms_base_北京轨道交通分布.geojson_1731400350143_31_1731400362150_61',
    '北京住宅小区分布.geojson'
  ]
})
const multiSelect = ref(false)

const mapOptions = {
  center: [116.37436332085963, 39.84975378768688],
  zoom: 10
}

const changeBg = () => {
  bgColor.value = bgColor.value === '#d90f' ? '#f0f' : '#d90f'
}
const changeMultiSelect = () => {
  multiSelect.value = !multiSelect.value
}
</script>
<template>
  <div>
    <div>
      <Button type="primary" @click="changeBg">切换背景</Button>
      <Button @click="changeMultiSelect">切换多选</Button>
    </div>
    <WebMap
      serverUrl="http://172.16.14.44:8190/iportal"
      :map-id="331024164"
      target="map1"
      :mapOptions="mapOptions"
    >
      <Identify
        v-bind="identifyProps"
        :map-target="mapTarget"
        :background="bgColor"
        headerName="identify"
        :multiSelect="multiSelect"
      />
    </WebMap>
  </div>
</template>
<style lang="scss">
@use '@supermapgis/common/theme-chalk/button.scss';
@use '@supermapgis/mapboxgl/theme-chalk/webmap.scss';
@use '@supermapgis/mapboxgl/theme-chalk/identify.scss';
</style>
