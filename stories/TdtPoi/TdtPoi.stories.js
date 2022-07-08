import {
  toI18n
} from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';
import AddressMatchParameter from '@supermap/vue-iclient-mapboxgl/lib/_types/AddressMatchParameter.js'; // 需要引用具体的路径
import RestMapParameter from '@supermap/vue-iclient-mapboxgl/lib/_types/RestMapParameter.js'; // 需要引用具体的路径
import RestDataParameter from '@supermap/vue-iclient-mapboxgl/lib/_types/RestDataParameter.js'; // 需要引用具体的路径

export default {
  title: `${toI18n('gisComponent.title')}/${toI18n('gisComponent.tdtPoi.title')}`,
  id: 'GISComponents/tdtPoi'
};

export const tdtPoi = () => ({
  mixins: [theme],
  data() {
    return {
      addressMatch: [
        new AddressMatchParameter({
          url: 'https://iserver.supermap.io/iserver/services/addressmatch-Address/restjsr/v1/address'
        })
      ],
      restMapSearch: [
        new RestMapParameter({
          url: 'https://iserver.supermap.io/iserver/services/map-world/rest/maps/World',
          layerName: 'Capitals@World.1'
        })
      ],
      restDataSearch: [
        new RestDataParameter({
          url: 'https://iserver.supermap.io/iserver/services/data-world/rest/data',
          dataName: ['World:Countries']
        })
      ],

      onlineLocalSearch: {
        enable: true,
        city: '北京市'
      },
      searchData: {
        searchUrl: 'https://api.tianditu.gov.cn/search',
        tk: '1d109683f4d84198e37a38c442d68311'
      }
    };
  },
  template: `
    <sm-web-map style="height:700px" mapId="801571284" serverUrl="https://iportal.supermap.io/iportal">
      <sm-tdt-search
      :address-match="addressMatch"
      :rest-map="restMapSearch"
      :rest-data="restDataSearch"
      :online-local-search="onlineLocalSearch"
      :alwaysCenter="false"
      :data="searchData"
      collapsed
      />
    </sm-web-map>
    `
});
tdtPoi.story = {
  name: toI18n('gisComponent.basic')
};
