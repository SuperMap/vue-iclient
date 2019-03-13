<template>
  <div :id="target" class="sm-map">
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
    const map = this.initializeMap();
    this.registerEvents(map);
  },
  methods: {
    initializeMap() {
      this.mapOptions.container = this.target;
      this.map = new mapboxgl.Map(this.mapOptions);
     return this.map;
    },
    registerEvents(map) {
      map.on('load', () => {
        mapEvent.$emit(`initMap-${this.target}`, map);
      });
    }
  }
};
</script>
