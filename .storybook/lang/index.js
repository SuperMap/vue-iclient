import Cookies from 'js-cookie';
import enLocale from './locale/en';
import zhLocale from './locale/zh';
import Vue from 'vue';
import VueI18n from 'vue-i18n';

export const messages = {
  en: enLocale,
  zh: zhLocale
};

Vue.use(VueI18n);
const i18n = new VueI18n({
  locale: getLanguage(),
  fallbackLocale: 'zh',
  messages
});

Vue.prototype.i18n = i18n;

export function getLanguage() {
  let lang = Cookies.get('language') || getStoryGlobalI18n();
  if (!lang) {
    if (navigator.appName === 'Netscape') {
      lang = navigator.language;
    } else {
      lang = navigator.browserLanguage;
    }
  }

  if (lang) {
    if (lang.indexOf('zh') === 0) {
      return 'zh';
    }
    if (lang.indexOf('en') === 0) {
      return 'en';
    }
    return lang;
  }
  return 'zh';
}

export function setLanguage(lang) {
  Cookies.set('language', lang);
}

export function getStoryGlobalI18n() {
  const store = sessionStorage.getItem('@storybook/preview/store');
  return store && JSON.parse(store).globals.locale;
}

export function geti18n() {
  return Vue.prototype.i18n;
}

export function toI18n(key) {
  return geti18n().t(key);
}

export default i18n;
