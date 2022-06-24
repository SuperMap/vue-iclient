<script>
import MapGetter from 'vue-iclient/src/mapboxgl/_mixin/map-getter';
import Layer from 'vue-iclient/src/mapboxgl/_mixin/layer';
import themeLayerEvents from 'vue-iclient/src/mapboxgl/web-map/_mixin/theme-layer';
import RanksymbolThemeLayerViewModel from './RanksymbolThemeLayerViewModel.js';

export default {
  name: 'SmRanksymbolThemeLayer',
  mixins: [MapGetter, Layer, themeLayerEvents],
  props: {
    symbolType: {
      type: String,
      default: 'Circle'
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
      type: Array,
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
    symbolType(val) {
      this.viewModel && this.viewModel.setSymbolType(val);
    },
    layerName(val) {
      this.viewModel && this.viewModel.setLayerName(val);
    }
  },
  created() {
    this.viewModel = new RanksymbolThemeLayerViewModel(this.$props);
    this.viewModel.on('layerchange', this.bindEvents);
  },
  methods: {
    bindEvents() {
      this.bindLayerEvents();
      this.$emit('load', this.viewModel.themeLayer, this.map);
    }
  },
  removed() {
    this.viewModel.off('layerChange', this.bindEvents);
  },
  loaded() {
    this.bindEvents();
  },
  render() {}
};
</script>
