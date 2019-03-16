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
    locale: getLanguage(),
    fallbackLocale: "zh",
    messages
  })
export function setLocale(locales) {
  i18n.mergeLocaleMessage(i18n.locale, locales)
}
//让element使用vue-i18n
ElementLocale.i18n((key, value) => i18n.t(key, value))
export default i18n

function getLanguage() {
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
