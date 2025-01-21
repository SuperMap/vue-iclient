import DirectoryTree from './DirectoryTree';
import Tree from './Tree';
import TreeNode from './TreeNode';
import init from 'vue-iclient/src/init';

Tree.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(DirectoryTree.options ? DirectoryTree.options.name : DirectoryTree.name, DirectoryTree);
  Vue.component(Tree.options ? Tree.options.name : Tree.name, Tree);
  Vue.component(TreeNode.options ? TreeNode.options.name : TreeNode.name, TreeNode);
};

export default Tree;
