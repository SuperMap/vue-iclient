<script lang="ts">
import Tree from 'ant-design-vue/es/tree';
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';
import VueTypes from '../_utils/vue-types';

export const treeNodeTypes = {
  eventKey: VueTypes.oneOfType([VueTypes.string, VueTypes.number]), // Pass by parent `cloneElement`
  prefixCls: VueTypes.string,
  // className: VueTypes.string,
  root: VueTypes.object,
  // onSelect: VueTypes.func,

  // By parent
  expanded: VueTypes.bool,
  selected: VueTypes.bool,
  checked: VueTypes.bool,
  loaded: VueTypes.bool,
  loading: VueTypes.bool,
  halfChecked: VueTypes.bool,
  title: VueTypes.any,
  pos: VueTypes.string,
  dragOver: VueTypes.bool,
  dragOverGapTop: VueTypes.bool,
  dragOverGapBottom: VueTypes.bool,

  // By user
  isLeaf: VueTypes.bool,
  checkable: VueTypes.bool,
  selectable: VueTypes.bool,
  disabled: VueTypes.bool,
  disableCheckbox: VueTypes.bool,
  icon: VueTypes.any,
  dataRef: VueTypes.object,
  switcherIcon: VueTypes.any,
  label: VueTypes.any,
  value: VueTypes.any
};

export default {
  name: 'SmTreeNode',
  __ANT_TREE_NODE: true,
  isTreeNode: 1,
  defaultComponent: Tree.TreeNode,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  props: treeNodeTypes
};
</script>
