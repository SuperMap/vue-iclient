<template>
  <div :id="target" :style="initStyle">
    <slot></slot>
  </div>
</template>

<script>
import mapboxgl from '@libs/mapboxgl/mapbox-gl-enhance';
import mapEvent from '../commontypes/mapEvent';
import Widget from './Widget';

export default {
  name: 'SmMap',
  extends: Widget,
  props: {
    target: {
      type: String,
      default: 'map'
    },
    mapOptions: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  computed: {
    initStyle() {
      return { width: '100%', height: '100%' };
    }
  },
  created() {
    if (!mapEvent.firstMapTarget) {
      mapEvent.firstMapTarget = this.target;
    }
  },
  mounted() {
    const map = this.initializeMap();
    this.registerEvents(map);
  },
  methods: {
    initializeMap() {
      this.mapOptions.container = this.target;
      const map = new mapboxgl.Map(this.mapOptions);
      return map;
    },
    registerEvents(map) {
      map.on('load', () => {
        mapEvent.$emit(`initMap-${this.target}`, map);
      });
    }
  }
};
</script>
