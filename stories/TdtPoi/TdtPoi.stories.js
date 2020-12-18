import {
  toI18n
} from '../../.storybook/lang';
import smcomponents from '../../src/mapboxgl';

export default {
  title: 'Gis Component/tdtPoi'
};

export const tdtPoi = () => ({
  data() {
    return {
      addressMatch: [
        new smcomponents.commontypes.AddressMatchParameter({
          url: 'http://support.supermap.com.cn:8090/iserver/services/addressmatch-Address/restjsr/v1/address'
        })
      ],
      restMapSearch: [
        new smcomponents.commontypes.RestMapParameter({
          url: 'http://support.supermap.com.cn:8090/iserver/services/map-world/rest/maps/World',
          layerName: 'Capitals@World.1'
        })
      ],
      restDataSearch: [
        new smcomponents.commontypes.RestDataParameter({
          url: 'http://support.supermap.com.cn:8090/iserver/services/data-world/rest/data',
          dataName: ['World:Countries']
        })
      ],
      iportalData: [
        new smcomponents.commontypes.iPortalDataParameter({
          url: 'http://192.168.12.28:8092/web/datas/659519047'
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
      position="top-left"
      :layer-names="layerSourceNames"
      :address-match="addressMatch"
      :rest-map="restMapSearch"
      :rest-data="restDataSearch"
      :iportal-data="iportalData"
      :online-local-search="onlineLocalSearch"
      :alwaysCenter="false"
      :data="searchData"
      collapsed
      />
    </sm-web-map>
    `
});
tdtPoi.story = {
  name: toI18n('gisComponent.tdtPoi')
};
