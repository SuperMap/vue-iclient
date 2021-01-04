import {
  toI18n
} from '../../.storybook/lang';
import smcomponents from '../../src/mapboxgl';
import theme from '../setThemeMixin/setTheme';

export default {
  title: 'GIS Components/query'
};

export const query = () => ({
  mixins: [theme],
  data() {
    return {
      restMapQuery: [
        new smcomponents.commontypes.RestMapParameter({
          url: 'https://iserver.supermap.io/iserver/services/map-world/rest/maps/World',
          attributeFilter: 'SmID>0',
          layerName: 'Capitals@World.1'
        })
      ]
    };
  },
  template: `
  <sm-web-map style="height:700px" mapId="801571284" serverUrl="https://iportal.supermap.io/iportal">
    <sm-query
    :rest-map="restMapQuery"
    />
  </sm-web-map>
  `
});
query.story = {
  name: toI18n('gisComponent.query')
};
