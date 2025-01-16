import GeojsonLayer from './GeojsonLayer';
import init from 'vue-iclient/src/init';

GeojsonLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(GeojsonLayer.options ? GeojsonLayer.options.name : GeojsonLayer.name, GeojsonLayer);
};

export default GeojsonLayer;
