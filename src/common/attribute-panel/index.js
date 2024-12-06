import AttributePanel from './AttributePanel';
import init from 'vue-iclient/src/init';

AttributePanel.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(AttributePanel.options ? AttributePanel.options.name : AttributePanel.name, AttributePanel);
};

export default AttributePanel;
