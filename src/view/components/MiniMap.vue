
<template>
  <sm-card
    :icon-class="iconClass"
    :icon-position="position"
    :header-name="headerName"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :id="(!iconClass&&!headerName)&&'miniMap'"
  >
    <div :id="(iconClass||headerName)&&'miniMap'"></div>
  </sm-card>
</template>

<script>
/* eslint-disable */
import MiniMapViewModel from "../../viewmodel/MiniMapViewModel";
import Control from "../mixin/control";
import Card from "../mixin/card";
import MapGetter from "../mixin/map-getter";

export default {
  name: "SmMiniMap",
  mixins: [MapGetter,Control,Card],
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
    this.$el.classList.add("sm-widget-minimap");
    this.viewModel = new MiniMapViewModel( this.$el.querySelector("#miniMap") || this.$el, this.map );
    this.iconClass && this.icon && this.viewModel.on("minimapinitialized", () => {
      this.icon.style.visibility = "visible";
    });
  }
};
</script>

