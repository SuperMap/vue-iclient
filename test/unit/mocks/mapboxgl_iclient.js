var supermap = require('./supermap_mapboxgl');
var mapboxgl = require('@mocks/mapboxgl').mapboxgl;

module.exports.SuperMap = require('./supermap');
var WebMap = require('./mapboxgl_iclient_webmap');

class SourceListModelV2 {
  constructor(options = {}) {
    this.map = options.map;
    this.layers = options.layers || [];
    this.appendLayers = options.appendLayers || false;
    this.excludeSourceNames = ['tdt-search-', 'tdt-route-', 'smmeasure', 'mapbox-gl-draw', /tracklayer-\d+-line/];
  }
  getLayers() {}

  getSourceList() {}

  getSelfLayers() {}
}
function createWebMapV2BaseExtending() {
  return class WebMapBase {};
}
class WebMapService {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
  }
  handleServerUrl(serverUrl) {
    this.serverUrl = serverUrl;
  }
  getMapInfo() {
    const mapId = this.serverUrl.split('/').pop();
    const data = {
      mapId,
      baseLayer: {
        layerType: 'TILE',
        name: 'China',
        url: 'http://fake.supermap.com.cn:8090/iserver/services/map-china400/rest/maps/China'
      },
      layers: [
        {
          layerType: 'UNIQUE',
          visible: true,
          themeSetting: {
            themeField: '2016起降架次（架次）',
            customSettings: {},
            colors: ['#D53E4F', '#FC8D59', '#FEE08B', '#FFFFBF', '#E6F598', '#99D594', '#3288BD']
          },
          name: '云贵川',
          featureType: 'POINT',
          style: {
            strokeWidth: 1,
            fillColor: '#3288bd',
            fillOpacity: 0.9,
            radius: 7,
            strokeColor: '#ffffff',
            type: 'BASIC_POINT',
            strokeOpacity: 1
          },
          projection: 'EPSG:4326',
          enableFields: ['机场'],
          dataSource: {
            type: 'PORTAL_DATA',
            serverId: '1920557079'
          }
        },
        {
          layerType: 'UNIQUE',
          visible: true,
          themeSetting: {
            themeField: '2016起降架次（架次）',
            customSettings: {},
            colors: ['#D53E4F', '#FC8D59', '#FEE08B', '#FFFFBF', '#E6F598', '#99D594', '#3288BD']
          },
          name: '云贵川市',
          featureType: 'POINT',
          style: {
            strokeWidth: 1,
            fillColor: '#3288bd',
            fillOpacity: 0.9,
            radius: 7,
            strokeColor: '#ffffff',
            type: 'BASIC_POINT',
            strokeOpacity: 1
          },
          projection: 'EPSG:4326',
          enableFields: ['机场'],
          dataSource: {
            type: 'PORTAL_DATA',
            serverId: '1920557079'
          }
        },
        {
          layerType: 'UNIQUE',
          visible: true,
          themeSetting: {
            themeField: '2016起降架次（架次）',
            customSettings: {},
            colors: ['#D53E4F', '#FC8D59', '#FEE08B', '#FFFFBF', '#E6F598', '#99D594', '#3288BD']
          },
          name: '云贵川区县',
          featureType: 'POINT',
          style: {
            strokeWidth: 1,
            fillColor: '#3288bd',
            fillOpacity: 0.9,
            radius: 7,
            strokeColor: '#ffffff',
            type: 'BASIC_POINT',
            strokeOpacity: 1
          },
          projection: 'EPSG:4326',
          enableFields: ['机场'],
          dataSource: {
            type: 'PORTAL_DATA',
            serverId: '1920557079'
          }
        }
      ]
    };
    return Promise.resolve(data);
  }
}

mapboxgl.supermap = {
  ...supermap,
  WebMapService,
  WebMap,
  SourceListModelV2,
  createWebMapV2BaseExtending
};
