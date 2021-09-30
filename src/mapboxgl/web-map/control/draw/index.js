import Draw from './Draw';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

Draw.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(Draw.options ? Draw.options.name : Draw.name, Draw);
};

export default Draw;
