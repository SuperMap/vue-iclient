import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: `${toI18n('gisComponent.title')}/${toI18n('gisComponent.layerColor.title')}`,
  id: 'GISComponents/layerColor'
};
export const LayerColor = () => ({
  mixins: [theme],
  template: `
  <sm-web-map style="height:700px" serverUrl="https://iportal.supermap.io/iportal" mapId="801571284">
    <sm-vector-tile-layer styleOptions="https://iserver.supermap.io/iserver/services/map-Population/rest/maps/PopulationDistribution/tileFeature/vectorstyles.json?type=MapBox_GL&styleonly=true"></sm-vector-tile-layer>
    <sm-layer-color :collapsed="false"></sm-layer-color>
  </sm-web-map>
    `
});

LayerColor.story = {
  name: toI18n('gisComponent.basic')
};
