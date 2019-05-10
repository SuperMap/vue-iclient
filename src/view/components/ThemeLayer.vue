<script>
import MapGetter from '../mixin/map-getter';
import Layer from '../mixin/layer';
import ThemeLayerViewModel from '../../viewmodel/ThemeLayerViewModel';
export default {
  name: 'SmThemeLayer',
  mixins: [MapGetter, Layer],
  props: {
    dataUrl: {
      type: String,
      required: true
    },
    tileUrl: {
      type: String,
      required: true
    },
    themeParameters: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  loaded() {
    if (this.dataUrl && this.tileUrl) {
      this.viewModel = new ThemeLayerViewModel(this.map, this.$props);
    }
  },
  render() {}
};
</script>
