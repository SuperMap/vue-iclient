import GridLayer from 'vue-iclient/src/leaflet/_mixin/GridLayer';

export default {
  mixins: [GridLayer],
  props: {
    tms: {
      type: Boolean,
      default: false
    },
    detectRetina: {
      type: Boolean,
      default: false
    }
  },
  render () {
    return null;
  }
};
