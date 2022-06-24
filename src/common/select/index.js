import OptGroup from './OptGroup';
import Option from './Option';
import Select from './Select';
import init from 'vue-iclient/src/init';

Select.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(OptGroup.options ? OptGroup.options.name : OptGroup.name, OptGroup);
  Vue.component(Option.options ? Option.options.name : Option.name, Option);
  Vue.component(Select.options ? Select.options.name : Select.name, Select);
};

export default Select;
