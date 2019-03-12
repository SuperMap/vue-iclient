import Vue from 'vue';
import VueI18n from 'vue-i18n';
import Cookies from 'js-cookie';
import ElementLocale from 'element-ui/lib/locale';
import enLocale from './en';
import zhLocale from './zh';

Object.defineProperty(Vue.prototype, '$i18n', {
  get: function get() {
    return i18n
  }
});
Vue.use(VueI18n)

const messages = {
  en: {
    ...enLocale
  },
  zh: {
    ...zhLocale
  }
}
const i18n =
  new VueI18n({
    locale: Cookies.get('language') || "zh",
    fallbackLocale: "zh",
    messages
  })
export function setLocale(locales) {
  i18n.mergeLocaleMessage(i18n.locale, locales)
}
//让element使用vue-i18n
ElementLocale.i18n((key, value) => i18n.t(key, value))
export default i18n




