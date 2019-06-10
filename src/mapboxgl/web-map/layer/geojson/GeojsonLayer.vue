<script>
import MapGetter from '../../../_mixin/map-getter';
import Layer from '../../../_mixin/layer';
import GeojsonLayerViewModel from './GeojsonLayerViewModel';

export default {
  name: 'SmGeojsonLayer',
  mixins: [MapGetter, Layer],
  props: {
    layerStyle: {
      type: Object
    },
    data: {
      type: [Object, String]
    }
  },
  watch: {
    layerStyle: {
      handler() {
        for (let key in this.layerStyle) {
          if (key === 'paint' && this.layerStyle.paint) {
            for (let prop of Object.keys(this.layerStyle.paint)) {
              this.map.setPaintProperty(this.layerId, prop, this.layerStyle.paint[prop]);
            }
          }
          if (key === 'layout' && this.layerStyle.layout) {
            for (let prop of Object.keys(this.layerStyle.layout)) {
              this.map.setPaintProperty(this.layerId, prop, this.layerStyle.layout[prop]);
            }
          }
        }
      },
      deep: true
    }
  },
  loaded() {
    this.viewModel = new GeojsonLayerViewModel(this.map, this.$props);
  },
  render() {}
};
</script>
