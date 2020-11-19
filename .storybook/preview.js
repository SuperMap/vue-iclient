import Vue from 'vue';
import 'ant-design-vue/dist/antd.css';
import '../static/libs/mapboxgl/mapbox-gl-enhance.css';
import '../static/libs/iclient-mapboxgl/iclient-mapboxgl.min.css';
import SmComponents from '../src/mapboxgl';
import i18n, { getLanguage } from './lang';

Vue.use(SmComponents, { theme: 'dark', i18n });

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  options: {
    showPanel: true,
    panelPosition: 'right',
    storySort: {
      order: ['CustomizeTheme', 'Map', 'Chart', 'Basic']
    }
  }
};

export const globalTypes = {
  locale: {
    name: 'Locale',
    description: 'Internationalization locale',
    defaultValue: 'zh',
    toolbar: {
      icon: 'globe',
      items: [
        { value: 'en', right: '🇺🇸', title: 'English' },
        { value: 'zh', right: '🇨🇳', title: '中文' }
      ],
    },
  },
};

export const decorators = [() => {
  return {
    template: '<story />',
    updated() {
      const lang = getLanguage();
      if (this.$i18n.locale !== lang) {
        window.location.reload();
      }
    },
    i18n
  }
}];
