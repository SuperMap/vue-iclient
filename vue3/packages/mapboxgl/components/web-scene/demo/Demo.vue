<script setup lang="ts">
import WebScene from '../webscene.vue'
import '../style'

const defaultProps = {
    "sceneUrl": "http://172.16.15.52:8080/iportal/web/scenes/491256644",
    "widgetsPath": "http://172.16.15.52:8080/iportal/apps/earth/v2/SuperMap3D/Widgets/widgets.css",
    "cesiumPath": "http://172.16.15.52:8080/iportal/apps/earth/v2/SuperMap3D/SuperMap3D.js",
    // "target": 'test1',
    "options": {
      "scanEffect": {
        "status": true,
        "type": "noScan",
        "centerPostion": {
          "x": null,
          "y": null,
          "z": null
        },
        "period": 2000,
        "speed": 500
      },
      "position": {
        "orientation": {
          "pitch": null,
          "roll": null,
          "heading": null
        },
        "destination": {
          "x": null,
          "y": null,
          "z": null
        }
      }
    }
  }
</script>
<template>
  <div>
    <WebScene v-bind='defaultProps'></WebScene>
  </div>
</template>
<style>
#map, #map1 {
  height: 500px;
}
</style>
