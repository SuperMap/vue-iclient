<template>
  <div :id="target" :style="initStyle">
    <slot></slot>
  </div>
</template>

<script>
import WebMapViewModel from '../../viewmodel/WebMapViewModel';
import mapEvent from '../commontypes/mapEvent';
import Widget from './Widget';

export default {
  name: 'SmWebMap',
  extends: Widget,
  props: {
    mapId: {
      type: String,
      required: true
    },
    target: {
      type: String,
      default: 'map'
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
      return { width: '100%', height: '100%' };
    },
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
    const webmap = this.initializeWebMap();
    this.registerEvents(webmap);
  },
  methods: {
    initializeWebMap() {
      this.webMapOptions.target = this.target;
      const webmap = new WebMapViewModel(this.mapId, this.webMapOptions);
      return webmap;
    },
    registerEvents(webmap) {
      webmap.on('addlayerssucceeded', e => {
        mapEvent.$emit(`initMap-${this.target}`, e.map);
      });
    }
  }
};
</script>

