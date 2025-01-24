/* eslint-disable */
import Vue from 'vue';

import SmComponents from '../../../src/index.js';
import App from './App';
import '../../../../core/libs/mapboxgl/mapbox-gl-enhance.css';

Vue.config.productionTip = false;

Vue.use(SmComponents,
  //{
  // locale: {
  //   el: {
  //     messagebox: {
  //       confirm: '确定SM',
  //     },
  //   },
  //   layerList: {
  //     title: "MMMMMMMMMMMMM"
  //   }
  // },
  //theme:"dark"
  //}
);

new Vue({
  el: '#app',
  components: {
    App
  },
  template: '<App />'
});
