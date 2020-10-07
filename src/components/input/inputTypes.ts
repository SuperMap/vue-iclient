import VueTypes from '../utils/vue-types';

export default {
  addonAfter: VueTypes.any,
  addonBefore: VueTypes.any,
  defaultValue: VueTypes.string,
  disabled: VueTypes.bool,
  id: VueTypes.string,
  maxlength: VueTypes.number,
  prefix: VueTypes.any,
  suffix: VueTypes.any,
  size: VueTypes.oneOf(['small', 'large', 'default']).def('default'),
  type: VueTypes.string.def('text'),
  value: VueTypes.oneOfType([VueTypes.string, VueTypes.number]),
  allowClear: VueTypes.bool,
  loading: VueTypes.bool,
  onChange: VueTypes.func,
  onPressEnter: VueTypes.func
}
