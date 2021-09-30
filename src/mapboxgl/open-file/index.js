import OpenFile from './OpenFile';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

OpenFile.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(OpenFile.options ? OpenFile.options.name : OpenFile.name, OpenFile);
};

export default OpenFile;
