<script>
import MapGetter from '../../../_mixin/map-getter';
import EchatsLayerViewModel from './EchatsLayerViewModel';

export default {
  name: 'SmEchartsLayer',
  mixins: [MapGetter],
  props: {
    options: {
      type: Object,
      required: true,
      validator(value) {
        return JSON.stringify(value) !== '{}';
      }
    }
  },
  loaded() {
    this.viewModel = new EchatsLayerViewModel(this.map, this.options);
  },
  render() {},
  removed() {
    this.viewModel && this.viewModel.clear();
  }
};
</script>
