<script lang="ts">
import Menu from 'ant-design-vue/es/menu';
import VueTypes from 'vue-iclient/src/common/_utils/vue-types';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import AntdRender from 'vue-iclient/src/common/_mixin/AntdRender';

export const menuItemTypes = {
  attribute: VueTypes.object,
  rootPrefixCls: VueTypes.string,
  eventKey: VueTypes.oneOfType([VueTypes.string, VueTypes.number]),
  active: VueTypes.bool,
  selectedKeys: VueTypes.array,
  disabled: VueTypes.bool,
  title: VueTypes.any,
  index: VueTypes.number,
  inlineIndent: VueTypes.number.def(24),
  level: VueTypes.number.def(1),
  mode: VueTypes.oneOf(['horizontal', 'vertical', 'vertical-left', 'vertical-right', 'inline']).def('vertical'),
  parentMenu: VueTypes.object,
  multiple: VueTypes.bool,
  value: VueTypes.any,
  isSelected: VueTypes.bool,
  manualRef: VueTypes.func,
  role: VueTypes.any,
  subMenuKey: VueTypes.string,
  itemIcon: VueTypes.any
};

export default {
  name: 'SmMenuItem',
  isMenuItem: true,
  defaultComponent: Menu.Item,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  props: menuItemTypes
};
</script>
