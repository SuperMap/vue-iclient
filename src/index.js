import Vue from 'vue'
import 'element-ui/lib/theme-chalk/icon.css'
import './style/index.scss';
import {Button,Checkbox,Card,Slider} from 'element-ui';

import * as components from './view/components';
Vue.use(Button)
Vue.use(Checkbox)
Vue.use(Card)
Vue.use(Slider)
const install = function(Vue, opts = {}) {
    for(let component in components){
        Vue.component(components[component].name,components[component])
    };
}

install(Vue);

export default components;