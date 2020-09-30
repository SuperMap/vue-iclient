import VueTypes from 'vue-types';

export default {
  disabled: VueTypes.bool.def(false),
  ghost: VueTypes.bool.def(false),
  htmlType: VueTypes.oneOf(['button', 'submit', 'reset']).def('button'),
  icon: VueTypes.any,
  loading: VueTypes.oneOfType([VueTypes.bool, VueTypes.object]).def(false),
  shape: VueTypes.oneOf(['circle', 'circle-outline', 'round']),
  size: VueTypes.oneOf(['small', 'large', 'default']).def('default'),
  type: VueTypes.oneOf(['primary', 'dashed', 'danger', 'link', 'default']).def('default'),
  block: VueTypes.bool.def(false),
  click: VueTypes.func
}
