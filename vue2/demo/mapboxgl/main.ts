/* eslint-disable */
import Vue from 'vue';
import 'vue-iclient-static/libs/mapboxgl/mapbox-gl-enhance.css';
import '@supermapgis/iclient-mapboxgl/dist/iclient-mapboxgl.min.css';
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
