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
    }
  },
  methods: {
    move(beforeId) {
      this.map.moveLayer(this.layerId, beforeId);
    },
    remove(layerId = this.layerId) {
      this.map.removeLayer(layerId);
    },
    setLayoutProperty(layerId = this.layerId, name, value) {
      this.map.setLayoutProperty(layerId, name, value);
    }
  }
};
