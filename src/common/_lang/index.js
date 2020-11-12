// import Vue from 'vue';
import Cookies from 'js-cookie';
import enLocale from './en';
import zhLocale from './zh';
import antdZhCN from 'ant-design-vue/es/locale/zh_CN';
import antdEnUS from 'ant-design-vue/es/locale/en_US';
import clonedeep from 'lodash.clonedeep';
import VueI18n from 'vue-i18n';

const dateTimeFormats = {
  en: enLocale.dateTimeFormat,
  zh: zhLocale.dateTimeFormat
};
let i18n = {};
let rooti18n;
const messages = {
  en: {
    ...antdEnUS,
    ...enLocale
  },
  zh: {
    ...antdZhCN,
    ...zhLocale
  }
};
export function getLanguage() {
  var lang = Cookies.get('language');
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
  }
  return 'zh';
}
export function geti18n(n) {
  return rooti18n || i18n;
}
export function setLocale(locales) {
  i18n.mergeLocaleMessage && i18n.mergeLocaleMessage(i18n.locale, locales);
}
export const lang = clonedeep(messages);
export function initi18n(Vue, config) {
  config = config || {};
  if (config.i18n) {
    i18n = config.i18n;
    if (!i18n.getDateTimeFormat().hasOwnProperty()) {
      i18n.setDateTimeFormat('en', enLocale.dateTimeFormat);
      i18n.setDateTimeFormat('zh', zhLocale.dateTimeFormat);
    }
    i18n.mergeLocaleMessage && i18n.mergeLocaleMessage('en', lang.en);
    i18n.mergeLocaleMessage && i18n.mergeLocaleMessage('zh', lang.zh);
  } else if (!Vue.prototype.hasOwnProperty('$i18n')) {
    Object.defineProperty(Vue.prototype, '$i18n', {
      get: function get() {
        if (!rooti18n && this.$root && this.$root.$options.i18n) {
          rooti18n = this.$root.$options.i18n;
        }
        return rooti18n || i18n;
      }
    });
    Vue.use(VueI18n);
    i18n = new VueI18n({
      dateTimeFormats,
      locale: getLanguage(),
      fallbackLocale: 'zh',
      messages
    });
  }
  if (config.locale) {
    setLocale(config.locale);
  }
}

export default i18n;
/*
Example
假设国际化资源配置为：
layerList: {
    title: "图层",
    hello: '{msg} world',
    hello1: '{0} world',
    theWorld: 'the world',
    dio: 'DIO:',
    linked: '@:(message.dio) @:(message.theWorld) !!!!'，
    apple: 'no apples | one apple | {count} apples'
},
vue中调用：
this.$tc('layerList.apple',10,{ count: 20 })

文本模板调用：
$t方法：
<span>{{$t("layerList.title")}}</span>
==>
<span>图层</span>

<span>{{$t("layerList.hello",{msg:"hello"})}}</span>
==>
<span>hello world</span>

<span>{{$t("layerList.hello1",["bye"])}}</span>
==>
<span>bye world</span>

<span>{{$t("layerList.linked")}}</span>
==>
<span>DIO: the world !!!!</span>

$tc方法：
<p>{{ $tc('layerList.apple', 0) }}</p>
==>
<p>no apples</p>

<p>{{ $tc('layerList.apple', 1) }}</p>
==>
<p>one apple</p>

<p>{{ $tc('layerList.apple', 10}}</p>
==>
<p>10 apples</p>

<p>{{ $tc('layerList.apple', 10, { count: 20 }) }}</p>
==>
<p>20 apples</p>

日期格式处理（$d）：https://kazupon.github.io/vue-i18n/guide/datetime.html
数字格式处理（$n）：https://kazupon.github.io/vue-i18n/guide/number.html
*/
