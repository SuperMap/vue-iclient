<script>
import MapGetter from '../../../_mixin/map-getter';
import Layer from '../../../_mixin/layer';
import themeLayerEvents from '../../_mixin/theme-layer';
import LabelThemeLayerViewModel from './LabelThemeLayerViewModel.js';

export default {
  name: 'SmLabelThemeLayer',
  mixins: [MapGetter, Layer, themeLayerEvents],
  props: {
    layerName: {
      type: String,
      required: true
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
    layerName(val) {
      this.viewModel && this.viewModel.setLayerName(val);
    }
  },
  created() {
    this.viewModel = new LabelThemeLayerViewModel(this.$props);
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
