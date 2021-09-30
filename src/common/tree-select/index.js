import TreeSelect from './TreeSelect';
import TreeSelectNode from './TreeSelectNode';
import init from 'vue-iclient/src/init';

TreeSelect.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(TreeSelect.options ? TreeSelect.options.name : TreeSelect.name, TreeSelect);
  Vue.component(TreeSelectNode.options ? TreeSelectNode.options.name : TreeSelectNode.name, TreeSelectNode);
};

export default TreeSelect;
