/* eslint-disable */
import Vue from 'vue';
import SmWidgets from '../../dist/iclient9-mapboxgl-widgets-vue';
import App from './App';
import '../../dist/libs/mapboxgl/mapbox-gl-enhance.css';
import '../../dist/iclient9-mapboxgl-widgets-vue.css';

Vue.config.productionTip = false;

Vue.use(SmWidgets,
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
