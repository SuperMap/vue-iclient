import ColorPicker from './ColorPicker';
import init from 'vue-iclient/src/init';

ColorPicker.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(ColorPicker.options ? ColorPicker.options.name : ColorPicker.name, ColorPicker);
};

export default ColorPicker;
