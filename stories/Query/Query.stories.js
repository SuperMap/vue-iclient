import {
  toI18n
} from '../../.storybook/lang';
import smcomponents from '../../src/mapboxgl';

export default {
  title: 'GIS Components/query'
};

export const query = () => ({
  data() {
    return {
      restMapQuery: [
        new smcomponents.commontypes.RestMapParameter({
          url: 'http://support.supermap.com.cn:8090/iserver/services/map-world/rest/maps/World',
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
