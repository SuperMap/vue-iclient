import FillExtrusionLayer from './FillExtrusionLayer';
import init from 'vue-iclient/src/init';

FillExtrusionLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(FillExtrusionLayer.options ? FillExtrusionLayer.options.name : FillExtrusionLayer.name, FillExtrusionLayer);
};

export default FillExtrusionLayer;
