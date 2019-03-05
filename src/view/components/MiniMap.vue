
<template>
  <div id="miniMap"></div>
</template>

<script>
/* eslint-disable */
import MiniMapViewModel from "../../viewmodel/MiniMapViewModel";
import mapboxgl from "@libs/mapboxgl/mapbox-gl-enhance";
import Widget from "./Widget";

export default {
  name: "SmMiniMap",
  extends: Widget,
  props: {
    iconClass: {
      type: String,
      default: "el-icon-back"
    }
  },

  loaded() {
    this.$el.classList.add("mapboxgl-ctrl-minimap");
    !this.parentIsWebMapOrMap && this.$el.classList.add("mini-map-container");
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
  &.mini-map-container {
    position: absolute;
    bottom: 10px;
    right: 10px;
  }
}
</style>


