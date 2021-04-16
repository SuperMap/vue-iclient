import TabPane from './TabPane';
import Tabs from './Tabs';
import init from 'vue-iclient/src/init';

Tabs.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(TabPane.options ? TabPane.options.name : TabPane.name, TabPane);
  Vue.component(Tabs.options ? Tabs.options.name : Tabs.name, Tabs);
};

export default Tabs;
