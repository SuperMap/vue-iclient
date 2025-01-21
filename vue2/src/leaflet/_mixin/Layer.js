import { propsBinder } from 'vue-iclient/src/leaflet/_utils/props-binder';

export default {
  props: {
    pane: {
      type: String,
      default: 'overlayPane'
    },
    name: {
      type: String,
      default: undefined
    },
    attribution: {
      type: String,
      default: null
    }
  },
  mounted() {
    if (this.layer) {
      this.layer.on('add', (e) => {
        this.$emit('load', e);
      });
    }
    propsBinder(this, this.$props);
  }
};
