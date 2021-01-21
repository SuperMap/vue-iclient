<script lang="ts">
import TreeSelect from 'ant-design-vue/es/tree-select';
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';
import VueTypes from '../_utils/vue-types';

export const treeSelectNodeTypes = {
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
  name: 'SmTreeSelectNode',
  defaultComponent: TreeSelect.TreeNode,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  __ANT_TREE_NODE: true,
  isTreeNode: 1,
  props: treeSelectNodeTypes
};
</script>
