import MapPopup from './MapPopup';
import init from 'vue-iclient/src/init';

MapPopup.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(MapPopup.options ? MapPopup.options.name : MapPopup.name, MapPopup);
};

export default MapPopup;
