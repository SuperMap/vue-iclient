<script setup lang="ts">
import WebScene from '@supermapgis/mapboxgl/components/web-scene/webscene.vue'
import LayerList from '../scene-layer-list.vue'
import '../style'
import { ref } from 'vue'
import Button from '@supermapgis/common/components/button/Button'

const defaultProps = {
    // "sceneUrl": "http://localhost:8080/iportal/web/scenes/841074362",  //图层多的
    "sceneUrl": "http://localhost:8080/iportal/web/scenes/491256644",
    "widgetsPath": "http://localhost:8080/iportal/apps/earth/v2/SuperMap3D/Widgets/widgets.css",
    "cesiumPath": "http://localhost:8080/iportal/apps/earth/v2/SuperMap3D/SuperMap3D.js",
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
  const operations = {
      fitBounds: true,
      draggable: true
    }
  const position = ref('top-left')
  function click() {
    if (position.value === 'top-left') {
      position.value = 'top-right'
    } else {
      position.value = 'top-left'
    }
  }
</script>
<template>
  <div>
    <Button @click="click">切换位置</Button>
    <WebScene v-bind='defaultProps'>
      <LayerList sceneTarget='scene' :operations="operations" :position="position"></LayerList>
    </WebScene>
    <!-- <WebScene v-bind='defaultProps' target="scene123">
      <LayerList sceneTarget='scene123' :operations="operations" :position="position"></LayerList>
    </WebScene> -->
  </div>
</template>
<style>
#map, #map1 {
  height: 500px;
}
</style>
