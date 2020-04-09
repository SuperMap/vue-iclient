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
  watch: {
    options: {
      handler(val) {
        this.viewModel && this.viewModel.setOptions(val);
      },
      deep: true
    }
  },
  created() {
    this.viewModel = new EchatsLayerViewModel(this.options);
  },
  render() {}
};
</script>
