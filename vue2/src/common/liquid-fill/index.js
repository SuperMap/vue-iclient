import LiquidFill from './LiquidFill';
import init from 'vue-iclient/src/init';

LiquidFill.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(LiquidFill.options ? LiquidFill.options.name : LiquidFill.name, LiquidFill);
};

export default LiquidFill;
