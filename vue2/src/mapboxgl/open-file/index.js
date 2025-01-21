import OpenFile from './OpenFile';
import init from 'vue-iclient/src/init';

OpenFile.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(OpenFile.options ? OpenFile.options.name : OpenFile.name, OpenFile);
};

export default OpenFile;
