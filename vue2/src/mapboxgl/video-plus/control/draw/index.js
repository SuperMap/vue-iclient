import Draw from './Draw';
import init from 'vue-iclient/src/init';

Draw.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Draw.options ? Draw.options.name : Draw.name, Draw);
};

export default Draw;
