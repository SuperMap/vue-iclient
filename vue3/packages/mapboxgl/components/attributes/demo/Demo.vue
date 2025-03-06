<script setup lang="ts">
import Attributes from '../attributes.vue'
import WebMap from '../../web-map/webmap.vue'
import Button from '@supermapgis/common/components/button/Button'
import { ref } from 'vue'
import '../style'

const bgColor = ref()
const changeBg = () => {
  bgColor.value = bgColor.value === '#d90f' ? '#f0f' : '#d90f'
}
</script>
<template>
  <WebMap server-url="https://www.supermapol.com/" :map-id="505367620" target='map2'></WebMap>
  <Button type="primary" @click="changeBg">切换背景</Button>
  <Attributes layer-name="全国671个气象站观测数据" :background="bgColor" mapTarget='map2'></Attributes>
</template>
<style>
#map2 {
  height: 500px;
}
</style>
