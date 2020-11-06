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
  Modal,
  Tree,
  Tabs,
  Steps,
  Breadcrumb,
} from 'ant-design-vue';
import { lang, setLocale, initi18n } from '../common/_lang';
import themeFactory from '../common/_utils/style/theme/theme.json';
import * as components from './components';
// import { Message, Notification } from './components';
import '../common/_assets/iconfont/icon-sm-components.css';
import * as commontypes from './_types';
import * as utils from './_utils';
import VueCesium from 'vue-cesium';
import cssVars from 'css-vars-ponyfill';
import 'ant-design-vue/dist/antd.css';
import { dealWithTheme } from '../common/_utils/style/color/serialColors';
// import Message from '../common/message/Message';
// import Notification from '../common/notification/Notification';

const setTheme = (themeStyle: any = {}) => {
  if (typeof themeStyle === 'string') {
    try {
      require(`../common/_utils/style/theme/${themeStyle}.scss`);
    } catch (e) {
      themeStyle = 'light';
      require(`../common/_utils/style/theme/${themeStyle}.scss`);
    }
    themeStyle = themeFactory.filter(item => item.label === themeStyle)[0] || {};
  }
  const nextThemeData = dealWithTheme(themeStyle);
  const nextTheme = nextThemeData.themeStyle;
  globalEvent.$options.theme = nextTheme;
  globalEvent.$emit('change-theme', nextTheme);
};

const install = function(Vue, opts: any = {}) {
  cssVars();
  let theme = opts.theme || 'light';
  require('../common/_utils/style/theme/antd.less');
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
  Vue.use(Breadcrumb);
  Vue.use(Steps);
  if (VueCesium) {
    Vue.use(VueCesium, {
      cesiumPath: opts.cesiumPath || '../../static/libs/Cesium/Cesium.js'
    });
  }
  // let message = components.Message;
  Vue.prototype.$message = components.Message;
  Vue.prototype.$notification = components.Notification;
  initi18n(Vue, opts);
  for (let component in components) {
    if (!['Notification','Message'].includes(component)) {
      const com = components[component];
      Vue.component(com.options ? com.options.name : com.name, com);
    }
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
