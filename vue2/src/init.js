import { registerProjection } from 'vue-iclient/src/common/_utils/epsg-define';
import { lang, initi18n } from 'vue-iclient/src/common/_lang/index';
import { setTheme } from 'vue-iclient/src/common/_utils/style/theme/set-theme';
import Base from 'ant-design-vue/es/base';

function init(Vue, opts = {}) {
  opts.projections && registerProjection(opts.projections);

  Vue.use(Base);
  if (!Vue.iclient || !Vue.iclient.theme) {
    initTheme(Vue, opts);
  }
  if (!Vue.iclient || !Vue.iclient.locale) {
    initI18n(Vue, opts);
  }
  const theme = (Vue.iclient && Vue.iclient.theme) || opts.theme || 'light';
  const locale = (Vue.iclient && Vue.iclient.locale) || opts.locale || opts.i18n || lang.zh;
  return { theme, locale };
}
function initTheme(Vue, opts = {}) {
  const theme = opts.theme || 'light';
  setTheme(theme);
  return theme;
}

function initI18n(Vue, opts = {}) {
  const locale = opts && opts.i18n ? { i18n: opts.i18n } : { locale: (opts && opts.locale) || lang.zh };
  initi18n(Vue, locale);
  return (opts && (opts.locale || opts.i18n)) || lang.zh;
}

export default (Vue, opts) => {
  const { theme, locale } = Vue.iclient || {};
  if (!Vue.iclient || !theme || !locale) {
    Vue.iclient = init(Vue, opts);
    Vue.prototype.$iclient = Vue.iclient;
  }
};
