import mapEvent from './view/commontypes/mapEvent';
import { Table, TableColumn } from 'element-ui';
import { Progress, Icon, Card, Collapse, Checkbox, Select, Button, Spin, Message, Input, Slider } from 'ant-design-vue';
import i18n, { setLocale, lang } from '../src/lang/index';
import * as themeFactory from './style/theme';
import * as components from './view/components';
import './assets/iconfont/iconfont.css';
import * as commontypes from './view/commontypes/index';
import * as utils from './utils/index';
const setTheme = (themeStyle = {}) => {
  if (typeof themeStyle === 'string') {
    themeStyle = themeFactory[themeStyle] || {};
  }
  mapEvent.$emit('change-theme', themeStyle);
};

const install = function(Vue, opts = {}) {
  if (opts.locale) {
    setLocale(opts.locale);
  }
  let theme = opts.theme || 'light';

  require(`./style/theme/${theme}.scss`);
  setTheme(theme);

  // TIP:引入element组件时，需在style/index.scss中引入组件对应的scsss。确保样式变量对elemenet组件生效
  Vue.use(Button);
  Vue.use(Checkbox);
  Vue.use(Card);
  Vue.use(Slider);
  Vue.use(Select);
  Vue.use(Collapse);
  Vue.use(Input);
  Vue.use(Table);
  Vue.use(TableColumn);
  Vue.use(Progress);
  Vue.use(Icon);
  Vue.use(Spin);
  Vue.prototype.$message = Message;
  for (let component in components) {
    Vue.component(components[component].name, components[component]);
  }
};
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue, {
    theme: 'light'
  });
}

export default {
  setTheme,
  commontypes,
  utils,
  lang,
  i18n,
  locale: setLocale,
  install
};
