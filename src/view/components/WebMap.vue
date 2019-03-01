<template>
  <div
    :id="(webMapOptions.hasOwnProperty('target') ? webMapOptions.target : 'map')"
    :style="initStyle"
  >
    <slot></slot>
  </div>
</template>

<script>
import WebMapViewModel from '../../viewmodel/WebMapViewModel';
import mapEvent from "../commontypes/mapEvent";
import Widget from "./Widget";

export default {
  name: "SmWebMap",
  extends: Widget,
  props: {
    mapId: {
      type: String,
      required: true
    },
    webMapOptions: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  computed: {
    initStyle() {
      return Object.assign({width: '100%', height: '100%'}, this.widgetStyle);
    }
  },
  mounted() {
    const webmap = this.initializeWebMap();
    this.registerEvents(webmap);
  },
  methods: {
    initializeWebMap() {
      const webmap = new WebMapViewModel(this.mapId, this.webMapOptions);
      return webmap;
    },
    registerEvents(webmap) {
      webmap.on("addlayerssucceeded", e => {
        mapEvent.$emit("initMap", e.map);
      });
    }
  }
};
</script>

