import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: 'GIS Components/layerList'
};
export const LayerList = () => ({
  mixins: [theme],
  template: `
  <sm-web-map style="height:700px" serverUrl="https://iportal.supermap.io/iportal" mapId="801571284">
    <sm-layer-list :collapsed="false"></sm-layer-list>
  </sm-web-map>
    `
});

LayerList.story = {
  name: toI18n('gisComponent.layerList')
};

export const ExpandLayerList = () => ({
  template: `
  <sm-web-map target="map111" style="height:700px" serverUrl='https://iportal.supermap.io/iportal' mapId="1329428269">
    <sm-vector-tile-layer styleOptions="https://iserver.supermap.io/iserver/services/map-Population/rest/maps/PopulationDistribution/tileFeature/vectorstyles.json?type=MapBox_GL&styleonly=true"></sm-vector-tile-layer>
    <sm-layer-list :collapsed="false"></sm-layer-list>
  </sm-web-map>
    `
});

ExpandLayerList.story = {
  name: toI18n('gisComponent.expandLayerList')
};
