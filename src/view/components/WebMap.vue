<template>
  <div
    :id="target"
    class="sm-map"
  >
    <slot></slot>
  </div>
</template>

<script>
import WebMapViewModel from "../../viewmodel/WebMapViewModel";
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
    target: {
      type: String,
      default: "map"
    },
    webMapOptions: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  computed: {
    getMapTarget() {
      return this.target;
    }
  },
  created() {
    if (!mapEvent.firstMapTarget) {
      mapEvent.firstMapTarget = this.target;
    }
  },
  mounted() {
    this.initializeWebMap();
    this.registerEvents();
  },
  methods: {
    initializeWebMap() {
      this.webMapOptions.target = this.target;
      this.viewModel = new WebMapViewModel(this.mapId, this.webMapOptions);
    },
    registerEvents() {
      this.viewModel.on("addlayerssucceeded", e => {
        mapEvent.$emit(`initMap-${this.target}`, e.map, this.viewModel);
      });
    }
  }
};
</script>

