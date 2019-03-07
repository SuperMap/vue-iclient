
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
    this.$el.classList.add("sm-minimap");
    !this.parentIsWebMapOrMap && this.$el.classList.add("sm-minimap--position");
    new MiniMapViewModel(this.$el, this.map);
  }
};
</script>

