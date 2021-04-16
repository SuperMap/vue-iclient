import WebScene from './WebScene';
import init from 'vue-iclient/src/init';
import VueCesium from 'vue-cesium';

WebScene.install = function (Vue, opts) {
  init(Vue, opts);
  if (VueCesium) {
    Vue.use(VueCesium, {
      cesiumPath: opts.cesiumPath || '../static/libs/Cesium/Cesium.js'
    });
  }
  Vue.component(WebScene.options ? WebScene.options.name : WebScene.name, WebScene);
};

export default WebScene;
