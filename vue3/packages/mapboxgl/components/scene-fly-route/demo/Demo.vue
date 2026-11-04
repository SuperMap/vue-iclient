<script setup lang="ts">
import WebScene from '@supermapgis/mapboxgl/components/web-scene/webscene.vue'
import '../style'

const sceneLibPaths = {
  sceneUrl: '/iportal/web/scenes/825657853',
  widgetsPath: '/iportal/apps/earth/v2/SuperMap3D/Widgets/widgets.css',
  cesiumPath: '/iportal/apps/earth/v2/SuperMap3D/SuperMap3D.js',
  openConfigPath: '/iportal/apps/earth/v2/lib/OpenConfig.js'
}
const emptyScanOptions = {
  scanEffect: {
    status: true,
    type: 'noScan' as const,
    centerPostion: { x: null, y: null, z: null },
    period: 2000,
    speed: 500
  }
}
const sceneProps = {
  sceneUrl: '/iportal/web/scenes/1773481018',
  target: 'web-scene-demo',
  ...sceneLibPaths,
  options: {
    ...emptyScanOptions,
    position: {
      orientation: { pitch: null, roll: null, heading: null },
      destination: { x: null, y: null, z: null }
    }
  }
}
const sceneFlyRouteControl = {
  show: true,
  fpfUrl: '/road.fpf',
  position: 'top-left' as const
}
</script>

<template>
  <WebScene v-bind="sceneProps" :scene-fly-route-control="sceneFlyRouteControl" />
</template>
