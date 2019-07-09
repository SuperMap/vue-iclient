import globalEvent from '../common/_utils/global-event';
import {
  Progress,
  Icon,
  Card,
  Collapse,
  Checkbox,
  Select,
  Button,
  Spin,
  Input,
  Slider,
  Table,
  message
} from 'ant-design-vue';
import i18n, { setLocale, lang } from '../common/_lang';
import themeFactory from '../common/_utils/style/theme/theme.json';
import * as components from './components';
import '../common/_assets/iconfont/iconfont.css';
import * as commontypes from './_types';
import * as utils from './_utils';

const setTheme = (themeStyle = {}) => {
  if (typeof themeStyle === 'string') {
    themeStyle = themeFactory.filter(item => item.label === themeStyle)[0] || {};
  }
  globalEvent.$emit('change-theme', themeStyle);
};

const install = function(Vue, opts: any = {}) {
  if (opts.locale) {
    setLocale(opts.locale);
  }
  let theme = opts.theme || 'light';

  require(`../common/_utils/style/theme/${theme}.scss`);
  require('./style.scss');
  setTheme(theme);

  Vue.use(Button);
  Vue.use(Checkbox);
  Vue.use(Card);
  Vue.use(Slider);
  Vue.use(Select);
  Vue.use(Collapse);
  Vue.use(Input);
  Vue.use(Table);
  Vue.use(Progress);
  Vue.use(Icon);
  Vue.use(Spin);
  Vue.prototype.$message = message;
  for (let component in components) {
    const com = components[component];
    Vue.component(com.options ? com.options.name : com.name, com);
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
