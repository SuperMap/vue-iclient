import {
  toI18n
} from '../../.storybook/lang';
import smcomponents from '../../src/mapboxgl';
import theme from '../setThemeMixin/setTheme';

export default {
  title: 'GIS Components/poi'
};

export const poi = () => ({
  mixins: [theme],
  data() {
    return {
      addressMatch: [
        new smcomponents.commontypes.AddressMatchParameter({
          url: 'https://iserver.supermap.io/iserver/services/addressmatch-Address/restjsr/v1/address'
        })
      ],
      restMapSearch: [
        new smcomponents.commontypes.RestMapParameter({
          url: 'https://iserver.supermap.io/iserver/services/map-world/rest/maps/World',
          layerName: 'Capitals@World.1'
        })
      ],
      restDataSearch: [
        new smcomponents.commontypes.RestDataParameter({
          url: 'https://iserver.supermap.io/iserver/services/data-world/rest/data',
          dataName: ['World:Countries']
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
