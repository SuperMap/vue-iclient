import globalEvent from '../common/_utils/global-event';
import { registerProjection } from '../common/_utils/epsg-define';
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
  message,
  Modal,
  Tree,
  Tabs
} from 'ant-design-vue';
import { lang, setLocale, initi18n } from '../common/_lang';
import themeFactory from '../common/_utils/style/theme/theme.json';
import * as components from './components';
import '../common/_assets/iconfont/icon-sm-components.css';
import * as commontypes from './_types';
import * as utils from './_utils';
import VueCesium from 'vue-cesium';

const setTheme = (themeStyle = {}) => {
  if (typeof themeStyle === 'string') {
    themeStyle = themeFactory.filter(item => item.label === themeStyle)[0] || {};
  }
  globalEvent.$options.theme = themeStyle;
  globalEvent.$emit('change-theme', themeStyle);
};

const install = function(Vue, opts: any = {}) {
  let theme = opts.theme || 'light';

  require(`../common/_utils/style/theme/${theme}.scss`);
  require('./style.scss');
  setTheme(theme);
  registerProjection(opts.projections);

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
  Vue.use(Modal);
  Vue.use(Tree);
  Vue.use(Tabs);
  Vue.use(VueCesium, {
    cesiumPath: opts.cesiumPath || '../../static/libs/Cesium/Cesium.js'
  });
  Vue.prototype.$message = message;
  initi18n(Vue, opts);
  for (let component in components) {
    const com = components[component];
    Vue.component(com.options ? com.options.name : com.name, com);
  }
};
if (typeof window !== 'undefined' && window['Vue']) {
  install(window['Vue'], {
    theme: 'light'
  });
}

export default {
  setTheme,
  commontypes,
  utils,
  lang,
  locale: setLocale,
  install
};
