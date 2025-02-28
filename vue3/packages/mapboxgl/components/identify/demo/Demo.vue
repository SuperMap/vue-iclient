<script setup lang="ts">
import Identify from '../identify.vue'
import Button from '@supermapgis/common/components/button/Button'
import { ref, reactive } from 'vue'
import '../style'

const mapTarget = ref('map1')
const bgColor = ref()
const identifyProps = reactive({
  layers: ['北京轨道交通分布.geojson', '北京住宅小区分布.geojson']
})

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
      <Button @click="changeMapTarget">切换绑定地图</Button>
    </div>
    <Identify
      v-bind="identifyProps"
      :map-target="mapTarget"
      :background="bgColor"
      headerName="identify"
    />
  </div>
</template>
