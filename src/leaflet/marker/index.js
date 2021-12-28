import Marker from './Marker';
import init from 'vue-iclient/src/init';

Marker.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Marker.options ? Marker.options.name : Marker.name, Marker);
};

export default Marker;
