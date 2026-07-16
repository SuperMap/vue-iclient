<script setup lang="ts">
import WebScene from '@supermapgis/mapboxgl/components/web-scene/webscene.vue'
import SceneSkylineAnalysis from '../scene-skyline-analysis.vue'
import '../style'

const defaultProps = {
  sceneUrl: 'http://172.16.15.109:8082/iportal/web/scenes/825657853',
  widgetsPath: 'http://172.16.15.109:8082/iportal/apps/earth/v2/SuperMap3D/Widgets/widgets.css',
  cesiumPath: 'http://172.16.15.109:8082/iportal/apps/earth/v2/SuperMap3D/SuperMap3D.js',
  openConfigPath: 'http://172.16.15.109:8082/iportal/apps/earth/v2/lib/OpenConfig.js',
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
        pitch: -21.557888937961533,
        roll: 0,
        heading: 271.95957364884936
      },
      destination: {
        x: 116.47258137041715,
        y: 39.90992384387235,
        z: 492.3432
      }
    }
  }
}
</script>

<template>
  <WebScene v-bind="defaultProps">
    <SceneSkylineAnalysis sceneTarget="scene" position="top-left" />
  </WebScene>
</template>
