<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import type { Map } from 'mapbox-gl'
import type { MapOptions } from 'vue-iclient-controllers-mapboxgl/src/WebMapViewModel'
import type { ControlProps } from '@supermapgis/mapboxgl/utils'
import { SmResetView } from '../index'
import WebMap from '@supermapgis/mapboxgl/components/web-map/webmap.vue'
import SmButton from '@supermapgis/common/components/button/Button'
import '../style'
import '@supermapgis/mapboxgl/components/web-map/style'

defineOptions({ name: 'ResetViewDemo' })

const duration = ref(1000)
const position = ref<ControlProps['position']>('top-left')
const camera = ref({ center: '', zoom: '', bearing: '', pitch: '' })
const ready = ref(false)
const mapOptions: MapOptions = {
  center: [116.391, 39.907],
  zoom: 11,
  bearing: -20,
  pitch: 35,
  style: {
    version: 8,
    sources: {
      osm: {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap contributors'
      }
    },
    layers: [{ id: 'osm', type: 'raster', source: 'osm' }]
  }
}
let map: Map | undefined

function updateCamera() {
  const center = map.getCenter()
  camera.value = {
    center: `${center.lng.toFixed(3)}, ${center.lat.toFixed(3)}`,
    zoom: map.getZoom().toFixed(2),
    bearing: map.getBearing().toFixed(2),
    pitch: map.getPitch().toFixed(2)
  }
}

function handleLoad(event: { map: Map }) {
  map = event.map
  ready.value = true
  updateCamera()
  map.on('moveend', updateCamera)
}

function changeView() {
  map?.flyTo({ center: [121.4737, 31.2304], zoom: 9, bearing: 65, pitch: 55, duration: 600 })
}

onBeforeUnmount(() => map?.off('moveend', updateCamera))
</script>

<template>
  <div class="reset-view-demo">
    <div class="reset-view-demo__toolbar">
      <sm-button :disabled="!ready" @click="changeView">
        <i class="sm-components-icon-compass" aria-hidden="true" />
        切换到上海
      </sm-button>
      <label>
        动画时长（ms）
        <input v-model.number="duration" type="number" min="0" max="10000" step="100" />
      </label>
      <label>
        控件位置
        <select v-model="position">
          <option value="top-left">左上</option>
          <option value="top-right">右上</option>
          <option value="bottom-left">左下</option>
          <option value="bottom-right">右下</option>
        </select>
      </label>
    </div>
    <dl class="reset-view-demo__camera" aria-live="polite">
      <div><dt>中心点</dt><dd>{{ camera.center }}</dd></div>
      <div><dt>缩放</dt><dd>{{ camera.zoom }}</dd></div>
      <div><dt>旋转角</dt><dd>{{ camera.bearing }}</dd></div>
      <div><dt>俯仰角</dt><dd>{{ camera.pitch }}</dd></div>
    </dl>
    <WebMap target="reset-view-demo-map" :map-options="mapOptions" @load="handleLoad">
      <SmResetView :duration="duration" :position="position" />
    </WebMap>
  </div>
</template>

<style scoped>
.reset-view-demo {
  position: relative;
  min-width: 0;
}

.reset-view-demo__toolbar,
.reset-view-demo__toolbar label,
.reset-view-demo__camera {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.reset-view-demo__toolbar input,
.reset-view-demo__toolbar select {
  box-sizing: border-box;
  width: 110px;
  height: 32px;
  border: 1px solid var(--color-border);
  border-radius: 2px;
  background: var(--color-bg-container);
  color: inherit;
}

.reset-view-demo__camera {
  margin: 16px 0;
  gap: 16px 24px;
  font-size: 13px;
}

.reset-view-demo__camera div {
  display: flex;
  gap: 8px;
}

.reset-view-demo__camera dd {
  margin: 0;
  font-variant-numeric: tabular-nums;
}

.reset-view-demo .sm-component-web-map {
  width: 100%;
  height: 560px;
  max-height: 65vh;
  min-height: 320px;
}
</style>
