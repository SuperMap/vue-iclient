import {
  toI18n
} from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: 'GIS Components/legend'
};

export const Legend = () => ({
  mixins: [theme],
  template: `
  <sm-web-map target="map111" style="height:700px" mapId="801571284" serverUrl="https://iportal.supermap.io/iportal">
    <sm-legend :layerNames="['民航数据']" :collapsed="false" position="top-left" />
  </sm-web-map>
  `
});
Legend.story = {
  name: toI18n('gisComponent.legend')
};

export const PanlLegend = () => ({
  template: `
  <sm-web-map style="height:700px" mapId="801571284" serverUrl="https://iportal.supermap.io/iportal">
    <sm-legend style="width:160px" isShowTitle isShowField mode="panel" :layerNames="['民航数据']" position="top-left" :collapsed="false" />
  </sm-web-map>
    `
});
PanlLegend.story = {
  name: toI18n('gisComponent.panlLegend')
};
