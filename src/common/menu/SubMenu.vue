<script lang="ts">
import Menu from 'ant-design-vue/es/menu';
import VueTypes from '../_utils/vue-types';
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';

export const subMenuTypes = {
  parentMenu: VueTypes.object,
  title: VueTypes.any,
  selectedKeys: VueTypes.array.def([]),
  openKeys: VueTypes.array.def([]),
  openChange: VueTypes.func,
  rootPrefixCls: VueTypes.string,
  eventKey: VueTypes.oneOfType([VueTypes.string, VueTypes.number]),
  multiple: VueTypes.bool,
  active: VueTypes.bool, // TODO: remove
  isRootMenu: VueTypes.bool.def(false),
  index: VueTypes.number,
  triggerSubMenuAction: VueTypes.string,
  popupClassName: VueTypes.string,
  getPopupContainer: VueTypes.func,
  forceSubMenuRender: VueTypes.bool,
  openAnimation: VueTypes.oneOfType([VueTypes.string, VueTypes.object]),
  disabled: VueTypes.bool,
  subMenuOpenDelay: VueTypes.number.def(0.1),
  subMenuCloseDelay: VueTypes.number.def(0.1),
  level: VueTypes.number.def(1),
  inlineIndent: VueTypes.number.def(24),
  openTransitionName: VueTypes.string,
  popupOffset: VueTypes.array,
  isOpen: VueTypes.bool,
  store: VueTypes.object,
  mode: VueTypes.oneOf(['horizontal', 'vertical', 'vertical-left', 'vertical-right', 'inline']).def('vertical'),
  manualRef: VueTypes.func,
  builtinPlacements: VueTypes.object.def(function () {
    return {};
  }),
  itemIcon: VueTypes.any,
  expandIcon: VueTypes.any,
  subMenuKey: VueTypes.string
};

export default {
  name: 'SmSubMenu',
  isSubMenu: true,
  defaultComponent: Menu.SubMenu,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  props: subMenuTypes
};
</script>
