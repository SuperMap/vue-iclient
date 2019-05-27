<template>
  <div :id="target" class="sm-widget-map">
    <slot></slot>
  </div>
</template>

<script>
import mapEvent from '../_types/mapEvent';
import mapboxgl from '../../../static/libs/mapboxgl/mapbox-gl-enhance';

export default {
  name: 'SmMap',
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
        mapEvent.$options.setMap(this.target, map);
        mapEvent.$emit(`initMap-${this.target}`, map);
        this.$emit('load', { map: map });
      });
    }
  }
};
</script>
