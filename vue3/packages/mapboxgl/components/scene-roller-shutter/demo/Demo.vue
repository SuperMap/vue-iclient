<script setup lang="ts">
import WebScene from '../../web-scene/webscene.vue'
import '../style'

defineOptions({
  name: 'SceneRollerShutterDemo'
})

const defaultProps = {
  sceneUrl: '/iportal/web/scenes/491256644',
  widgetsPath: '/iportal/apps/earth/v2/SuperMap3D/Widgets/widgets.css',
  cesiumPath: '/iportal/apps/earth/v2/SuperMap3D/SuperMap3D.js',
  openConfigPath: '/iportal/apps/earth/v2/lib/OpenConfig.js',
  options: {},
  sceneRollerShutterControl: {
    show: true,
    position: 'top-left',
    collapsed: false
  }
}
</script>

<template>
  <WebScene v-bind="defaultProps" />
</template>
