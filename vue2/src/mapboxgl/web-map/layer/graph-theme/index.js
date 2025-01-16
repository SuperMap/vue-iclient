import GraphThemeLayer from './GraphThemeLayer';
import init from 'vue-iclient/src/init';

GraphThemeLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(GraphThemeLayer.options ? GraphThemeLayer.options.name : GraphThemeLayer.name, GraphThemeLayer);
};

export default GraphThemeLayer;
