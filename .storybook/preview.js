import { initi18n } from '../src/common/_lang';
import Vue from 'vue';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
import '../static/libs/mapboxgl/mapbox-gl-enhance.css';
import '../static/libs/iclient-mapboxgl/iclient-mapboxgl.min.css';
import SmComponents from '../src/mapboxgl';

Vue.use(Antd);
Vue.use(SmComponents);
initi18n(Vue);

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  options: {
    showPanel: true,
    panelPosition: 'right'
  }
};