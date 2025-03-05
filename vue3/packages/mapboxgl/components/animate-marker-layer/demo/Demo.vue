<script setup lang="ts">
import AnimateMarkerLayer from '../animate-marker-layer.vue'
import mapboxgl from 'vue-iclient-core/libs/mapboxgl/mapbox-gl-enhance'
import Button from '@supermapgis/common/components/button/Button'
import { onBeforeMount, reactive } from 'vue'
import '../style'

const breathingApertureParam = {
  width: 80
}
// const haloRingParam = {
//   width: 44
// }
// const rotatingTextBorderParam = {
//   width: 120
// }
const animateMarkerProps = reactive({
  features: [],
  type: 'breathingAperture',
  ...breathingApertureParam
})

onBeforeMount(() => {
  getFeatures()
})

const changeType = () => {
  animateMarkerProps.type = animateMarkerProps.type === 'breathingAperture' ? 'haloRing' : 'breathingAperture'
  animateMarkerProps.width = animateMarkerProps.type === 'breathingAperture' ? 44 : 80
}

function _unproject(point) {
  let d = 180 / Math.PI,
    r = 6378137,
    ts = Math.exp(-point[1] / r),
    phi = Math.PI / 2 - 2 * Math.atan(ts)
  for (let i = 0, dphi = 0.1, con; i < 15 && Math.abs(dphi) > 1e-7; i++) {
    con = 1
    dphi = Math.PI / 2 - 2 * Math.atan(ts * con) - phi
    phi += dphi
  }
  return [(point[0] * d) / r, phi * d]
}

function getFeatures() {
  const url = 'https://iserver.supermap.io/iserver/services/map-china400/rest/maps/China'
  const param = new mapboxgl.supermap.QueryBySQLParameters({
    queryParams: {
      name: 'China_provincename_A_txt@China',
      attributeFilter: 'SMID > 0'
    }
  })
  new mapboxgl.supermap.QueryService(url).queryBySQL(param, function (serviceResult) {
    const recordsets = serviceResult && serviceResult.result && serviceResult.result.recordsets
    const featuresCollection = recordsets && recordsets[0] && recordsets[0].features
    featuresCollection.features.forEach(function (feature) {
      feature.geometry.coordinates = _unproject(feature.geometry.coordinates)
      feature.properties.name = feature.properties.texts[0]
    })
    animateMarkerProps.features = featuresCollection
  })
}
const handleMousedown = (params: Record<string, any>) => {
  console.log('layerclick', params);
}
</script>
<template>
  <AnimateMarkerLayer
    map-target="map"
    text-field="name"
    :fit-bounds="false"
    v-bind="animateMarkerProps"
    @contextmenu="handleMousedown"
  />
  <Button @click="changeType">切换marker类型</Button>
</template>
