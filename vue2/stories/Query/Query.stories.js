import {
  toI18n
} from '../../.storybook/lang';
import RestMapParameter from '@supermapgis/vue-iclient-mapboxgl/lib/_types/RestMapParameter.js'; // 需要引用具体的路径
import theme from '../setThemeMixin/setTheme';

export default {
  title: `${toI18n('gisComponent.title')}/${toI18n('gisComponent.query.title')}`,
  id: 'GISComponents/query'
};

export const query = () => ({
  mixins: [theme],
  data() {
    return {
      restMapQuery: [
        new RestMapParameter({
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
  name: toI18n('gisComponent.basic')
};
