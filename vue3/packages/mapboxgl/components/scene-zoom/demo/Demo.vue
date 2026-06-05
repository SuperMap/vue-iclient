<script setup lang="ts">
import WebScene from '../../web-scene/webscene.vue'
import '../style'

const defaultProps = {
  sceneUrl: 'http://172.16.15.52:8080/iportal/web/scenes/491256644',
  widgetsPath: 'http://172.16.15.52:8080/iportal/apps/earth/v2/SuperMap3D/Widgets/widgets.css',
  cesiumPath: 'http://172.16.15.52:8080/iportal/apps/earth/v2/SuperMap3D/SuperMap3D.js',
  options: {},
  sceneZoomControl: {
    show: true,
    position: 'top-left'
  }
}
</script>

<template>
  <WebScene v-bind="defaultProps" />
</template>
