/* eslint-disable */
import Vue from 'vue';
import '../../static/libs/mapboxgl/mapbox-gl-enhance.css';
import '../../static/libs/iclient-mapboxgl/iclient-mapboxgl.min.css';
import SmComponents from '../../src/mapboxgl';
import App from './App.vue';

Vue.config.productionTip = false;
Vue.use(
  SmComponents
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
  render: h => h(App)
}).$mount('#app');
