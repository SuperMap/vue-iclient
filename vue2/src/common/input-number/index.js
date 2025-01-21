import InputNumber from './InputNumber';
import init from 'vue-iclient/src/init';

InputNumber.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(InputNumber.options ? InputNumber.options.name : InputNumber.name, InputNumber);
};

export default InputNumber;
