import { Events } from 'vue-iclient/src/common/_types/event/Events';

var supermap = {
  cloudTileLayer: () => {
    return {};
  },
  uniqueThemeLayer: () => {
    return { addFeatures: () => {} };
  },
  rangeThemeLayer: () => {
    return { addFeatures: () => {} };
  },
  labelThemeLayer: () => {
    return { addFeatures: () => {} };
  },
  heatMapLayer: () => {
    return { addFeatures: () => {} };
  },
  baiduTileLayer: () => {
    return {};
  },
  tiledMapLayer: () => {
    return {};
  },
  dataFlowLayer: () => {
    return {
      on: () => {},
      off: () => {},
      addLayer: () => {},
      getLayerId: () => {}
    };
  },
  tiandituTileLayer: () => {
    return {};
  },
  themeFeature: class {},
  wmtsLayer: () => {},
  createWebMapV2BaseExtending(SuperClass = Events, fireField = 'triggerEvent') {
    return class WebMapBase extends SuperClass {
      constructor(id, options, mapOptions) {
        super();
        this.serverUrl = options.serverUrl || 'https://www.supermapol.com';
        this.credentialValue = options.credentialValue;
        this.credentialKey = options.credentialKey;
        this.tiandituKey = options.tiandituKey || '';
        this.googleMapsAPIKey = options.googleMapsAPIKey || '';
        this.bingMapsKey = options.bingMapsKey || '';
        this.googleMapsLanguage = options.googleMapsLanguage || 'zh-CN';
        this.withCredentials = options.withCredentials || false;
        this.proxy = options.proxy;
        this.target = options.target || 'map';
        this.excludePortalProxyUrl = options.excludePortalProxyUrl;
        this.isSuperMapOnline = options.isSuperMapOnline;
        this.ignoreBaseProjection = options.ignoreBaseProjection;
        this.echartslayer = [];
        this.canvgsV = [];
        this.mapOptions = mapOptions;
        this.eventTypes = ['mapcreatefailed'];
        this.mapId = id;
        this.webMapInfo = null;
      }
      _initWebMap() {
        throw new Error('_initWebMap is not implemented');
      }
      initWebMap() {
        this.webMapService = {
          getDatasourceType(layer) {
            let { dataSource, layerType } = layer;
            if (dataSource && dataSource.type === 'SAMPLE_DATA') {
              return dataSource.type;
            }
            let type;
            let isHosted = (dataSource && dataSource.serverId) || layerType === 'MARKER' || layerType === 'HOSTED_TILE';
            let isTile =
              layerType === 'SUPERMAP_REST' ||
              layerType === 'TILE' ||
              layerType === 'WMS' ||
              layerType === 'WMTS' ||
              layerType === 'MAPBOXSTYLE';
            if (isHosted) {
              type = 'hosted';
            } else if (isTile) {
              type = 'tile';
            } else if (dataSource && dataSource.type === 'REST_DATA') {
              type = 'rest_data';
            } else if (dataSource && dataSource.type === 'REST_MAP' && dataSource.url) {
              type = 'rest_map';
            } else if (layerType === 'DATAFLOW_POINT_TRACK' || layerType === 'DATAFLOW_HEAT') {
              type = 'dataflow';
            } else if (dataSource && dataSource.type === 'USER_DATA') {
              type = 'user_data';
            }
            return type;
          }
        };
        if (this.mapId && typeof this.mapId === 'object' && this.mapId.layers) {
          this._getMapInfo(this.mapId);
          return;
        }
        this._getMapInfo({
          projection: 'EPSG:3857',
          baseLayer: {
            layerType: ''
          },
          extent: {
            leftBottom: { x: 0, y: 0 },
            rightTop: { x: 10, y: 10 }
          }
        });
      }
      getBaseLayerType() {
        return 'TILE';
      }
      handleLayerFeatures(features) {
        return features;
      }

      getMapurls(mapurl = {}) {
        const mapUrls = {
          CLOUD: mapurl.CLOUD || 'http://t2.dituhui.com/FileService/image?map=quanguo&type=web&x={x}&y={y}&z={z}',
          CLOUD_BLACK: mapurl.CLOUD_BLACK || 'http://t3.dituhui.com/MapService/getGdp?x={x}&y={y}&z={z}',
          OSM: mapurl.OSM || 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          GOOGLE:
            'https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i{z}!2i{x}!3i{y}!4i256!2m3!1e0!2sm!3i540264686!3m12!2s{googleMapsLanguage}!3sUS!5e18!12m4!1e68!2m2!1sset!2sRoadmap!12m3!1e37!2m1!1ssmartmaps!4e0&key={googleMapsAPIKey}',
          GOOGLE_CN: 'https://mt{0-3}.google.com/vt/lyrs=m&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}',
          JAPAN_STD: 'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
          JAPAN_PALE: 'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png',
          JAPAN_RELIEF: 'https://cyberjapandata.gsi.go.jp/xyz/relief/{z}/{x}/{y}.png',
          JAPAN_ORT: 'https://cyberjapandata.gsi.go.jp/xyz/ort/{z}/{x}/{y}.jpg'
        };

        return mapUrls;
      }
      transformFeatures(features) {
        return features;
      }
      getCanvasFromSVG(url, test ,cb) {
        const canvas = document.createElement('canvas');
        canvas.id = `dataviz-canvas-`;
        canvas.style.display = 'none';
        return cb(canvas);
      }
      handleSvgColor() {}
      getLayerFeatures() {}
      echartsLayerResize() {}
      stopCanvg() {}
    };
  }
};

var L = require('@mocks/leaflet');
module.exports.SuperMap = require('./supermap');

L.supermap = supermap;
