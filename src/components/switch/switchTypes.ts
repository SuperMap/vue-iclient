import VueTypes from '../utils/vue-types';

export default {
  autofocus: VueTypes.bool,
  checked: VueTypes.bool,
  checkedChildren: VueTypes.any,
  unCheckedChildren: VueTypes.any,
  defaultChecked: VueTypes.bool,
  disabled: VueTypes.bool,
  loading: VueTypes.bool,
  size: VueTypes.oneOf(['small', 'large', 'default']).def('default')
}
