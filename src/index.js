import Vue from 'vue'

import WebMap from './view/components/WebMap.vue'
import LayerList from './view/components/LayerList.vue'
import Pan from './view/components/Pan.vue'
import Zoom from './view/components/Zoom.vue'
import Scale from './view/components/Scale.vue'
import Chart from './view/components/Chart.vue'
import Map from './view/components/Map.vue'
import MiniMap from './view/components/MiniMap.vue'

import {Button,Checkbox,Card,Slider} from 'element-ui';

import 'element-ui/lib/theme-chalk/button.css'
import 'element-ui/lib/theme-chalk/checkbox.css'
import 'element-ui/lib/theme-chalk/card.css'
import 'element-ui/lib/theme-chalk/slider.css'

Vue.use(Button);
Vue.use(Checkbox);
Vue.use(Card);
Vue.use(Slider);

const components = [
    WebMap,
    LayerList,
    Pan,
    Zoom,
    Scale,
    Chart,
    Map,
    MiniMap,
]

const install = function(Vue, opts = {}) {
    components.forEach(component => {
      Vue.component(component.name, component);
    });
}

if (typeof window !== 'undefined' && Vue) {
    install(Vue);
}

export default {
   WebMap,
   LayerList,
   Pan,
   Zoom,
   Scale,
   Chart,
   Map,
   MiniMap
}