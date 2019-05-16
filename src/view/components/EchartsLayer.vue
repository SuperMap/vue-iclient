<script>
import MapGetter from '../mixin/map-getter';
import EchatsLayerViewModel from '../../viewmodel/EchatsLayerViewModel';
export default {
  name: 'SmEchartsLayer',
  mixins: [MapGetter],
  props: {
    echartsOptions: {
      type: Object,
      required: true,
      validator(value) {
        return JSON.stringify(value) !== '{}';
      }
    }
  },
  loaded() {
    this.viewModel = new EchatsLayerViewModel(this.map, this.echartsOptions);
  },
  render() {}
};
</script>
