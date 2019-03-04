import Vue from 'vue'
import * as components from './view/components';

const install = function(Vue, opts = {}) {
    for(let component in components){
        Vue.component(components[component].name,components[component])
    };
}

install(Vue);

export default components;