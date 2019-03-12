import Vue from 'vue'
import './style/index.scss';
import 'element-ui/lib/theme-chalk/icon.css'
import { Button, Checkbox, Card, Slider, Select, Option, Collapse, CollapseItem } from 'element-ui';
import * as components from './view/components';
Vue.use(Button)
Vue.use(Checkbox)
Vue.use(Card)
Vue.use(Slider)
Vue.use(Select)
Vue.use(Option)
Vue.use(Collapse)
Vue.use(CollapseItem)
const install = function(Vue, opts = {}) {
    for(let component in components){
        Vue.component(components[component].name,components[component])
    };
}

install(Vue);

export default components;
