/* eslint-disable */
import Vue from 'vue';
import '../src/index.js';
import App from './App.vue';
import '@libs/mapboxgl/mapbox-gl-enhance.css';
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: {
    App
  },
  template: '<App />'
});
