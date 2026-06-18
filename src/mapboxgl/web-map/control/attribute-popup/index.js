import AttributePopup from './AttributePopup';
import init from 'vue-iclient/src/init';

AttributePopup.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(AttributePopup.options ? AttributePopup.options.name : AttributePopup.name, AttributePopup);
};

export default AttributePopup;
