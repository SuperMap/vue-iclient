/* eslint-disable */
import Vue from 'vue';
import 'leaflet/dist/leaflet.css';
import '../../static/libs/iclient-leaflet/iclient-leaflet.min.css';
import SmComponents from '../../src/leaflet';
import App from './App.vue';
import 'ant-design-vue/dist/antd.css';

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
