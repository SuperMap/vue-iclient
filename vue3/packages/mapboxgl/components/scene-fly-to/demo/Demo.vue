<script setup lang="ts">
import WebScene from '@supermapgis/mapboxgl/components/web-scene/webscene.vue'
import SceneFlyTo from '../scene-fly-to.vue'
import '../style'

const defaultProps = {
  sceneUrl: '/iportal/web/scenes/1773481018',
  widgetsPath: '/iportal/apps/earth/v2/SuperMap3D/Widgets/widgets.css',
  cesiumPath: '/iportal/apps/earth/v2/SuperMap3D/SuperMap3D.js',
  openConfigPath: '/iportal/apps/earth/v2/lib/OpenConfig.js',
  options: {
    scanEffect: {
      status: true,
      type: 'noScan',
      centerPostion: {
        x: null,
        y: null,
        z: null
      },
      period: 2000,
      speed: 500
    },
    position: {
      orientation: {
        pitch: null,
        roll: null,
        heading: null
      },
      destination: {
        x: null,
        y: null,
        z: null
      }
    }
  }
}

const flyOptions = {
  hpr: {
    "heading": 0,
    "pitch": -90,
    "roll": 0
  },
  duration: 1
}
// const destination = [116.3913, 39.9075, 3000]
const destination = {
  "lon": 120.25407677097833,
  "lat": 29.26779553773401,
  "height": 800000
}
</script>

<template>
  <div>
    <WebScene v-bind="defaultProps">
      <SceneFlyTo
        sceneTarget="scene"
        :position="'top-left'"
        :destination="destination"
        :fly-options="flyOptions"
      />
    </WebScene>
  </div>
</template>
