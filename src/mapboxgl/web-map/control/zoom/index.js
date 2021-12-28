import Zoom from './Zoom';
import init from 'vue-iclient/src/init';

Zoom.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Zoom.options ? Zoom.options.name : Zoom.name, Zoom);
};

export default Zoom;
