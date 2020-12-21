import {
  toI18n
} from '../../.storybook/lang';
import smcomponents from '../../src/mapboxgl';

export default {
  title: 'GIS Components/poi'
};

export const poi = () => ({
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
      }
    };
  },
  template: `
  <sm-web-map style="height:700px" mapId="801571284" serverUrl="https://iportal.supermap.io/iportal">
    <sm-search
    :layer-names="['UNIQUE-民航数-0']"
    :address-match="addressMatch"
    :rest-map="restMapSearch"
    :rest-data="restDataSearch"
    :iportal-data="iportalData"
    :online-local-search="onlineLocalSearch"
    :alwaysCenter="false"
    collapsed
    />
  </sm-web-map>
  `
});
poi.story = {
  name: toI18n('gisComponent.poi')
};
