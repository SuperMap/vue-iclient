import VueTypes from 'vue-types';

VueTypes.defaults = {
  func: () => undefined,
  bool: false,
  string: '',
  number: undefined,
  array: () => [],
  object: () => ({}),
  integer: undefined
};

export default VueTypes;
