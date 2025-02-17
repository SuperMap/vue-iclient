<script setup lang="ts">
import WebMap from '../../web-map/webmap.vue'
import LayerList from '../layerList.vue'
import '../style'
</script>
<template>
  <div>
    <WebMap server-url="https://www.supermapol.com/" :map-id="505367620" style="height:700px">
      <LayerList v-bind="$attrs"></LayerList>
    </WebMap>
  </div>
</template>
<style>
#map {
  width: 100%;
  height: 900px;
}
</style>
