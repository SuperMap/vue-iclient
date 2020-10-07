import VueTypes from '../utils/vue-types';

export default {
  disabled: VueTypes.bool,
  ghost: VueTypes.bool,
  htmlType: VueTypes.oneOf(['button', 'submit', 'reset']).def('button'),
  icon: VueTypes.any,
  loading: VueTypes.oneOfType([VueTypes.bool, VueTypes.object]),
  shape: VueTypes.oneOf(['circle', 'circle-outline', 'round']),
  size: VueTypes.oneOf(['small', 'large', 'default']).def('default'),
  type: VueTypes.oneOf(['primary', 'dashed', 'danger', 'link', 'default']).def('default'),
  block: VueTypes.bool
}
