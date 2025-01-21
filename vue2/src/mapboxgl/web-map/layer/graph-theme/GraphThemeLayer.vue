<script>
import MapGetter from 'vue-iclient/src/mapboxgl/_mixin/map-getter';
import Layer from 'vue-iclient/src/mapboxgl/_mixin/layer';
import themeLayerEvents from 'vue-iclient/src/mapboxgl/web-map/_mixin/theme-layer';
import GraphThemeLayerViewModel from './GraphThemeLayerViewModel.js';

export default {
  name: 'SmGraphThemeLayer',
  mixins: [MapGetter, Layer, themeLayerEvents],
  props: {
    chartsType: {
      type: String,
      required: true
    },
    layerName: {
      type: String
    },
    options: {
      type: Object,
      default() {
        return {};
      }
    },
    data: {
      type: Object,
      required: true
    }
  },
  watch: {
    data: {
      handler(val) {
        this.viewModel && this.viewModel.setData(val);
      },
      deep: true
    },
    options: {
      handler(val) {
        this.viewModel && this.viewModel.setOptions(val);
      },
      deep: true
    },
    chartsType(val) {
      this.viewModel && this.viewModel.setChartsType(val);
    },
    layerName(val) {
      this.viewModel && this.viewModel.setLayerName(val);
    }
  },
  created() {
    this.viewModel = new GraphThemeLayerViewModel(this.$props);
    this.viewModel.on('layerchange', this.bindEvents);
  },
  methods: {
    bindEvents() {
      this.bindLayerEvents();
      this.$emit('load', this.viewModel.themeLayer, this.map);
    }
  },
  removed() {
    this.viewModel.off('layerchange', this.bindEvents);
  },
  loaded() {
    this.bindEvents();
  },
  render() {}
};
</script>
