<template>
  <div
    :id="(mapOptions.hasOwnProperty('container') ? mapOptions.container : 'map')"
    :style="initStyle"
  >
    <slot></slot>
  </div>
</template>

<script>
import mapboxgl from "@libs/mapboxgl/mapbox-gl-enhance";
import mapEvent from '../commontypes/mapEvent';
import Widget from "./Widget";

export default {
  name: 'SmMap',
  extends: Widget,
  props: {
    mapOptions: {
      type: Object,
      default() {
        return {};
      }
    },
    accessToken: {
      type: String
    }
  },
  computed: {
    initStyle() {
      return {width: '100%', height: '100%'};
    }
  },
  mounted() {
    const map = this.initializeMap();
    this.registerEvents(map);
  },
  methods: {
    initializeMap() {
      if (this.accessToken) {
        mapboxgl.accessToken = this.accessToken;
      }
      if (!this.mapOptions.hasOwnProperty('container')) {
        this.mapOptions.container = 'map';
      }
      const map = new mapboxgl.Map(this.mapOptions);
      return map;
    },
    registerEvents(map) {
      map.on('load', () => {
        mapEvent.$emit('initMap', map);
      });
    }
  }
};
</script>
