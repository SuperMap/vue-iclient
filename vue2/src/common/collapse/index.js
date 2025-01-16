import Collapse from './Collapse';
import Panel from './Panel';
import init from 'vue-iclient/src/init';

Collapse.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Collapse.options ? Collapse.options.name : Collapse.name, Collapse);
  Vue.component(Panel.options ? Panel.options.name : Panel.name, Panel);
};

export default Collapse;
