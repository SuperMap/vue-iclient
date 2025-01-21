import FillExtrusion from './FillExtrusion';
import init from 'vue-iclient/src/init';

FillExtrusion.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(FillExtrusion.options ? FillExtrusion.options.name : FillExtrusion.name, FillExtrusion);
};

export default FillExtrusion;
