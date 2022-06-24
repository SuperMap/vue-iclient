import AnimateMarkerLayer from './AnimateMarkerLayer';
import init from 'vue-iclient/src/init';

AnimateMarkerLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(AnimateMarkerLayer.options ? AnimateMarkerLayer.options.name : AnimateMarkerLayer.name, AnimateMarkerLayer);
};

export default AnimateMarkerLayer;
