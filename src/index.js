import Vue from "vue";
import {
  Button,
  Checkbox,
  Card,
  Slider,
  Select,
  Option,
  Collapse,
  CollapseItem
} from "element-ui";
import { setLocale } from "../src/lang/index";
import * as components from "./view/components";

const install = function(Vue, opts = {}) {
  if (opts.locale) {
    setLocale(opts.locale);
  }
  const theme = opts.theme || "light";

  require(`./style/theme/${theme}.scss`);

  Vue.use(Button);
  Vue.use(Checkbox);
  Vue.use(Card);
  Vue.use(Slider);
  Vue.use(Select);
  Vue.use(Option);
  Vue.use(Collapse);
  Vue.use(CollapseItem);

  for (let component in components) {
    Vue.component(components[component].name, components[component]);
  }
};
if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}
export default {
  locale: setLocale,
  install
};
