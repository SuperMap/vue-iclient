import { registerProjection } from '../common/_utils/epsg-define';
import { lang, setLocale, initi18n } from '../common/_lang';
import * as components from './components';
import '../common/_assets/iconfont/icon-sm-components.css';
import * as commontypes from './_types';
import { setTheme } from '../common/_utils/style/theme/set-theme';
import Base from 'ant-design-vue/es/base';

const install = function(Vue, opts: any = {}) {
  let theme = opts.theme || 'light';
  require('../common/_utils/style/theme/antd.less');
  require('./style.scss');
  setTheme(theme);
  registerProjection(opts.projections);

  Vue.use(Base);
  Vue.prototype.$message = components.Message;
  Vue.prototype.$notification = components.Notification;
  Vue.prototype.$info = components.Modal.info;
  Vue.prototype.$success = components.Modal.success;
  Vue.prototype.$error = components.Modal.error;
  Vue.prototype.$warning = components.Modal.warning;
  Vue.prototype.$confirm = components.Modal.confirm;
  Vue.prototype.$destroyAll = components.Modal.destroyAll;
  initi18n(Vue, opts);
  for (let component in components) {
    if (!['Notification', 'Message'].includes(component)) {
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
  lang,
  locale: setLocale,
  install
};
