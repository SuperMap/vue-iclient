
<template>
  <div class="mapboxgl-ctrl-minimap" :style="miniMapStyle"></div>
</template>

<script>
/* eslint-disable */
import MiniMapViewModel from "../../viewmodel/MiniMapViewModel";
import mapboxgl from "@libs/mapboxgl/mapbox-gl-enhance";
import Widget from "./Widget";

export default {
  name: "SmMiniMap",
  extends: Widget,
  computed: {
    miniMapStyle() {
      if (this.widgetStyle) {
        let style = Object.assign(this.widgetStyle.position);
        style.width = this.widgetStyle.width;
        style.height = this.widgetStyle.height;
        return style;
      }
    }
  },
  loaded() {
    new MiniMapViewModel(this.$el, this.map);
  }
};
</script>

<style scoped lang='scss'>
.mapboxgl-ctrl-minimap {
  box-shadow: 0 0px 5px rgba(0, 0, 0, 0.2);
  background: white;
  width: 220px;
  height: 180px;
}
</style>


