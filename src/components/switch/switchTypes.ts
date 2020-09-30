import VueTypes from 'vue-types';

export default {
  autofocus: VueTypes.bool.def(false),
  checked: VueTypes.bool.def(false),
  checkedChildren: VueTypes.any,
  unCheckedChildren: VueTypes.any,
  defaultChecked: VueTypes.bool.def(false),
  disabled: VueTypes.bool.def(false),
  loading: VueTypes.bool.def(false),
  size: VueTypes.oneOf(['small', 'large', 'default']).def('default'),
  click: VueTypes.func,
  change: VueTypes.func
}
