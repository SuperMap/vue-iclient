import {
  toI18n
} from '../../.storybook/lang';

export default {
  title: 'Gis Component/legend'
};

export const Legend = () => ({
  template: `
  <sm-web-map target="map111" style="height:700px" mapId="801571284" serverUrl="https://iportal.supermap.io/iportal">
    <sm-legend :layerNames="['民航数据']" position="bottom-right" :collapsed="false" />
  </sm-web-map>
  `
});
Legend.story = {
  name: toI18n('gisComponent.legend')
};

export const PanlLegend = () => ({
  template: `
    <sm-web-map style="height:700px" mapId="801571284" serverUrl="https://iportal.supermap.io/iportal">
      <sm-legend style="width:160px" isShowTitle isShowField mode="panel" :layerNames="['民航数据']" position="bottom-right" :collapsed="false" />
    </sm-web-map>
    `
});
PanlLegend.story = {
  name: toI18n('gisComponent.panlLegend')
};
