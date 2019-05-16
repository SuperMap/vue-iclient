<script>
import MapGetter from '../mixin/map-getter';
import Layer from '../mixin/layer';

export default {
  name: 'SmGeoJSONLayer',
  mixins: [MapGetter, Layer],
  props: {
    layerStyles: {
      type: Object
    },
    data: {
      type: Object
    },
    vectorType: {
      type: String
    }
  },
  loaded() {
    let { paint, layout } = this.layerStyles[this.vectorType];
    this.map.addLayer({
      id: this.layerId,
      type: this.vectorType,
      source: {
        type: 'geojson',
        data: this.data
      },
      layout,
      paint
    });
  },
  render() {}
};
</script>
