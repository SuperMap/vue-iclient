import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: `${toI18n('gisComponent.title')}/${toI18n('gisComponent.fillExtrusion.title')}`,
  id: 'GISComponents/fillExtrusion'
};

export const fillExtrusion = () => ({
  mixins: [theme],
  data() {
    return {
      mapOptions: {
        pitch: 60
      }
    };
  },
  template: `
  <sm-web-map style="height:700px" mapId="1109795011" serverUrl="https://www.supermapol.com" :map-options="mapOptions">
    <sm-fill-extrusion />
  </sm-web-map>
  `
});
fillExtrusion.story = {
  name: toI18n('gisComponent.basic')
};
