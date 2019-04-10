
<template>
  <sm-card
    :icon-class="iconClass"
    :icon-position="position"
    :header-name="headerName"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :id="(!iconClass&&!headerName)&&'miniMap'"
  >
    <div :id="(iconClass||headerName)&&'miniMap'" ></div>
  </sm-card>
</template>

<script>
/* eslint-disable */
import MiniMapViewModel from "../../viewmodel/MiniMapViewModel";
import mapboxgl from "@libs/mapboxgl/mapbox-gl-enhance";
import Widget from "./Widget";
export default {
  name: "SmMiniMap",
  extends: Widget,
  relativeMap: true,
  props: {
    iconClass: {
      type: String,
      default: "el-icon-back"
    },
    autoRotate: {
      type: Boolean,
      default: true
    }
  },
  mounted() {
    this.icon = this.$el.children[0];
    this.iconClass && this.icon && (this.icon.style.visibility = "hidden");
  },
  loaded() {
    this.$el.classList.add("sm-minimap");
    this.viewModel = new MiniMapViewModel( this.$el.querySelector("#miniMap") || this.$el, this.map );
    this.iconClass && this.icon && this.viewModel.on("minimapinitialized", () => {
        this.icon.style.visibility = "visible";
      });
  }
};
</script>

