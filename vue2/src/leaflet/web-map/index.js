import WebMap from './WebMap';
import init from 'vue-iclient/src/init';

WebMap.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(WebMap.options ? WebMap.options.name : WebMap.name, WebMap);
};

export default WebMap;
