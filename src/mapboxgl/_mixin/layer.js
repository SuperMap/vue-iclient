import UniqueId from 'lodash.uniqueid';

export default {
  name: 'LayerMixin',
  props: {
    layerId: {
      type: String,
      default() {
        const defaultLayerId = UniqueId(`${this.$options.name.toLowerCase()}-`);
        return defaultLayerId;
      }
    },
    minzoom: {
      type: Number,
      default: 0
    },
    maxzoom: {
      type: Number,
      default: 22
    },
    filter: {
      type: Array
    },
    layout: {
      type: Object
    },
    paint: {
      type: Object
    },
    before: {
      type: String,
      default: undefined
    }
  },
  data() {
    return {
      eventList: [
        'mousedown',
        'mouseup',
        'click',
        'dblclick',
        'mousemove',
        'mouseenter',
        'mouseleave',
        'mouseover',
        'mouseout',
        'contextmenu',
        'touchstart',
        'touchend',
        'touchcancel'
      ]
    };
  },
  computed: {
    sourceLoaded() {
      const sourceId = this.sourceId || this.layerId;
      return this.map && sourceId ? this.map.isSourceLoaded(sourceId) : false;
    },
    mapLayer() {
      return this.map ? this.map.getLayer(this.layerId) : null;
    },
    mapSource() {
      const sourceId = this.sourceId || this.layerId;
      return this.map && sourceId ? this.map.getSource(sourceId) : null;
    }
  },
  created() {
    if (this.minzoom || this.minzoom === 0) {
      this.$watch('minzoom', function(next) {
        this.map.setLayerZoomRange(this.layerId, next, this.maxzoom);
      });
    }

    if (this.maxzoom || this.minzoom === 0) {
      this.$watch('maxzoom', function(next) {
        this.map.setLayerZoomRange(this.layerId, this.minzoom, next);
      });
    }

    if (this.filter) {
      this.$watch('filter', function(next) {
        this.map.setFilter(this.layerId, next);
      });
    }

    if (this.layout) {
      this.$watch('layout', function(next) {
        if (next) {
          for (let prop of Object.keys(next)) {
            this.map.setLayoutProperty(this.layerId, prop, next[prop]);
          }
        }
      });
    }

    if (this.paint) {
      this.$watch('paint', function(next) {
        if (next) {
          for (let prop of Object.keys(next)) {
            this.map.setPaintProperty(this.layerId, prop, next[prop]);
          }
        }
      });
    }

    this.$watch('layerId', function(newLayerId) {
      this.viewModel && this.viewModel.setLayerId && this.viewModel.setLayerId(newLayerId);
    });
  },
  methods: {
    $_emitEvent(name, data = {}) {
      this.$emit(name, {
        map: this.map,
        layerId: this.layerId,
        ...data
      });
    },
    $_emitLayerMapEvent(event) {
      this.$_emitEvent(event.type, { mapboxEvent: event });
    },
    $_bindLayerEvents() {
      Object.keys(this.$listeners).forEach(eventName => {
        if (this.eventList.includes(eventName)) {
          this.map.on(eventName, this.layerId, this.$_emitLayerMapEvent);
        }
      });
    },
    $_unbindLayerEvents(events) {
      if (this.map) {
        events.forEach(eventName => {
          this.map.off(eventName, this.layerId, this.$_emitLayerMapEvent);
        });
      }
    },
    move(beforeId) {
      this.map.moveLayer(this.layerId, beforeId);
      this.$_emitEvent('layer-moved', {
        beforeId: beforeId
      });
    },
    remove() {
      this.viewModel && this.viewModel.clear && this.viewModel.removed();
      this.$_emitEvent('layer-removed');
    }
  },
  removed() {
    this.remove();
  }
};
