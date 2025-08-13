import BaseLayerSwitcher from './BaseLayerSwitcher.vue';
import init from 'vue-iclient/src/init';

BaseLayerSwitcher.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(BaseLayerSwitcher.options?.name ?? BaseLayerSwitcher.name, BaseLayerSwitcher);
};

export default BaseLayerSwitcher;
