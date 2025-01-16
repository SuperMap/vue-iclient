import Layer from 'vue-iclient/src/leaflet/_mixin/Layer';

export default {
  mixins: [Layer],
  props: {
    pane: {
      type: String,
      default: 'tilePane'
    },
    opacity: {
      type: Number,
      default: 1,
      validator(opacity) {
        return opacity >= 0 && opacity <= 1;
      }
    },
    bounds: {
      type: Array
    },
    zIndex: {
      type: Number,
      default: 1
    },
    tileSize: {
      type: Number,
      default: 256
    },
    noWrap: {
      type: Boolean,
      default: false
    }
  }
};
