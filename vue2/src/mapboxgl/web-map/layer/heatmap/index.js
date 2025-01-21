import HeatmapLayer from './HeatmapLayer';
import init from 'vue-iclient/src/init';

HeatmapLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(HeatmapLayer.options ? HeatmapLayer.options.name : HeatmapLayer.name, HeatmapLayer);
};

export default HeatmapLayer;
