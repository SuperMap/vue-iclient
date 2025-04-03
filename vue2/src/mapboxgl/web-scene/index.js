import WebScene from './WebScene';
import init from 'vue-iclient/src/init';

WebScene.install = function (Vue, opts) {
  init(Vue, opts);
  Vue.component(WebScene.options ? WebScene.options.name : WebScene.name, WebScene);
};

export default WebScene;
