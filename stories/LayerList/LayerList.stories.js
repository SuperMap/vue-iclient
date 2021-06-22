import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: `${toI18n('gisComponent.title')}/${toI18n('gisComponent.layerList.title')}`,
  id: 'GISComponents/layerList'
};
export const LayerList = () => ({
  mixins: [theme],
  data() {
    return {
      attributes: {
        enabled: true,
        style: {
          background: 'rgba(0, 0, 0, 0.8)'
        },
        props: {
          associateWithMap: {
            enabled: true,
            zoomToFeature: true,
            centerToFeature: true
          },
          fieldConfigs: [
            { value: 'latitude', visible: false },
            { value: 'longitude', visible: false },
            { value: 'altitude', visible: false },
            { value: 'geometry', visible: false },
            { value: 'index', visible: true },
            { value: '机场', visible: true },
            { value: 'X坐标', visible: true },
            { value: 'Y坐标', visible: true },
            { value: '名次', visible: true },
            { value: '2017旅客吞吐量（人次）', visible: false },
            { value: '2016旅客吞吐量（人次）', visible: false },
            { value: '同比增速%', visible: true },
            { value: '2017货邮吞吐量（吨）', visible: false },
            { value: '2016货邮吞吐量（吨）', visible: false },
            { value: '2017起降架次（架次）', visible: false },
            { value: '2016起降架次（架次）', visible: false }
          ]
        }
      }
    };
  },
  template: `
  <sm-web-map style="height:700px" serverUrl="https://iportal.supermap.io/iportal" mapId="801571284">
    <sm-layer-list :collapsed="false" :attributes="attributes"></sm-layer-list>
  </sm-web-map>
    `
});

LayerList.story = {
  name: toI18n('gisComponent.basic')
};

export const ExpandLayerList = () => ({
  template: `
  <sm-web-map target="map111" style="height:700px" serverUrl='https://iportal.supermap.io/iportal' mapId="1329428269">
    <sm-vector-tile-layer styleOptions="https://iserver.supermap.io/iserver/services/map-Population/rest/maps/PopulationDistribution/tileFeature/vectorstyles.json?type=MapBox_GL&styleonly=true"></sm-vector-tile-layer>
    <sm-layer-list :collapsed="false"></sm-layer-list>
  </sm-web-map>
    `
});

ExpandLayerList.story = {
  name: toI18n('gisComponent.layerList.expandLayerList')
};
