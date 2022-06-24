import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: `${toI18n('gisComponent.title')}/${toI18n('gisComponent.compass.title')}`,
  id: 'GISComponents/compass'
};

export const compare = () => ({
  mixins: [theme],
  template: `
  <sm-web-map style="width: 100%; height:700px" mapId="1329428269" serverUrl="https://iportal.supermap.io/iportal">
    <sm-compass />
  </sm-web-map>
  `
});
compare.story = {
  name: toI18n('gisComponent.basic')
};

export const changeComparePitch = () => ({
  mixins: [theme],
  data() {
    return {
      mapOptions: {
        bearing: -30,
        pitch: 15
      }
    };
  },
  template: `
  <sm-web-map
    target="map222"
    style="width: 100%; height:700px" 
    mapId="1329428269" 
    serverUrl="https://iportal.supermap.io/iportal"
    :mapOptions="mapOptions"
    >
    <sm-compass :visualizePitch="true"/>
  </sm-web-map>
  `
});
changeComparePitch.story = {
  name: toI18n('gisComponent.compass.changeComparePitch')
};
