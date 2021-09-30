import Tooltip from './Tooltip';
import init from 'vue-iclient/src/init';

Tooltip.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Tooltip.options ? Tooltip.options.name : Tooltip.name, Tooltip);
};

export default Tooltip;
