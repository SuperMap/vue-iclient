<script setup lang="ts">
import WebScene from '@supermapgis/mapboxgl/components/web-scene/webscene.vue'
import SceneFullscreen from '../scene-fullscreen.vue'
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
</script>

<template>
  <div>
    <WebScene v-bind="defaultProps">
      <SceneFullscreen sceneTarget="scene" :position="'top-left'"/>
    </WebScene>
  </div>
</template>
