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
import cssVars from 'css-vars-ponyfill';
// import 'ant-design-vue/dist/antd.css';
import { dealWithTheme, ThemeStyleParams, StyleReplacerParams } from '../common/_utils/style/color/serialColors';

function getCSSString(url: string, nextThemeStyle: ThemeStyleParams): Promise<StyleReplacerParams> {
  return new Promise(resolve => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        const styleData = dealWithTheme(xhr.responseText, nextThemeStyle);
        resolve(styleData);
      }
    };
    xhr.open('GET', url);
    xhr.send();
  });
}

const setAntdStyle = async (theme: ThemeStyleParams) => {
  const data: StyleReplacerParams = await getCSSString('../../static/libs/ant-design-vue/antd.css', theme);
  const antdStyleId = 'sm-component-style';
  let antStyleTag = document.getElementById(antdStyleId);
  if (!antStyleTag) {
    antStyleTag = document.createElement('style');
    antStyleTag.setAttribute('id', antdStyleId);
    antStyleTag.setAttribute('type', 'text/css');
    document.head.insertBefore(antStyleTag, document.head.firstChild);
  }
  antStyleTag.innerHTML = data.cssStyle;
  return data.themeStyle;
};

const setTheme = async (themeStyle: any = {}) => {
  if (typeof themeStyle === 'string') {
    try {
      require(`../common/_utils/style/theme/${themeStyle}.scss`);
    } catch (e) {
      themeStyle = 'light';
      require(`../common/_utils/style/theme/${themeStyle}.scss`);
    }
    themeStyle = themeFactory.filter(item => item.label === themeStyle)[0] || {};
  }
  const nextThemeStyle = await setAntdStyle(themeStyle);
  const nextTheme = Object.assign({}, themeStyle, nextThemeStyle);
  globalEvent.$options.theme = nextTheme;
  globalEvent.$emit('change-theme', nextTheme);
};

const install = function(Vue, opts: any = {}) {
  cssVars();
  let theme = opts.theme || 'light';
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
  if (VueCesium) {
    Vue.use(VueCesium, {
      cesiumPath: opts.cesiumPath || '../../static/libs/Cesium/Cesium.js'
    });
  }
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
