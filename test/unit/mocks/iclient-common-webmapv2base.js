function createWebMapV2BaseExtending(SuperClass = Events, fireField = 'triggerEvent') {
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
      getBaseLayerType(layerInfo) {
        let layerType = layerInfo.layerType; // 底图和rest地图兼容
    
        if (
          layerType.indexOf('TIANDITU_VEC') > -1 ||
          layerType.indexOf('TIANDITU_IMG') > -1 ||
          layerType.indexOf('TIANDITU_TER') > -1
        ) {
          layerType = 'TIANDITU';
        }
    
        switch (layerType) {
          case 'TILE':
          case 'SUPERMAP_REST':
            return 'TILE';
          case 'CLOUD':
          case 'CLOUD_BLACK':
            return 'CLOUD';
          case 'OSM':
          case 'JAPAN_ORT':
          case 'JAPAN_RELIEF':
          case 'JAPAN_PALE':
          case 'JAPAN_STD':
          case 'GOOGLE_CN':
          case 'GOOGLE':
            return 'XYZ';
          default:
            return layerType;
        }
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
      getUniqueStyleGroup(){
        return [];
      }
      getRangeStyleGroup(){
        return [];
      }
      getFilterFeatures(undefined, features){
        return features;
      }
      setFeatureInfo(){
        return {}
      }
      createRankStyleSource(){
        return { parameter:{}, styleGroups:[]}
      }
      getLayerFeatures(layer) {
        setTimeout(() => {
          var features = [
              {
                type: 'Feature',
                properties: {
                  SMID: '1',
                  SMSDRIW: '116.38831',
                  SMSDRIN: '40.980675',
                  SMSDRIE: '116.60729',
                  SMSDRIS: '40.803284',
                  SMUSERID: '4',
                  SMAREA: '1.3188454380984211E8',
                  SMPERIMETER: '79616.58012922351',
                  SMGEOMETRYSIZE: '588',
                  LANDTYPE: '用材林',
                  AREA: '132.0',
                  AREA_1: '132',
                  stringID: null,
                  ID: 1
                },
                geometry: {
                  type: 'PolyLine',
                  coordinates: [
                        [116.452409755349, 40.92656164358],
                        [116.483357386004, 40.9069469918439],
                        [116.442423257771, 40.9417511118507]
                  ]
                },
                dv_v5_markerStyle:{},
                id: 1
              },
              {
                type: 'Feature',
                properties: {
                  SMID: '2',
                  SMSDRIW: '116.60084',
                  SMSDRIN: '41.040543',
                  SMSDRIE: '116.72102',
                  SMSDRIS: '40.853382',
                  SMUSERID: '4',
                  SMAREA: '9.680888002534656E7',
                  SMPERIMETER: '50298.305148811625',
                  SMGEOMETRYSIZE: '360',
                  LANDTYPE: '用材林',
                  AREA: '97.0',
                  AREA_1: '97',
                  stringID: null,
                  ID: 2
                },
                geometry: {
                  type: 'PolyLine',
                  coordinates: [
                        [116.656010024549, 41.036635850958],
                        [116.656010024549, 41.136635850958]
                  ]
                },
                dv_v5_markerStyle:{},
                id: 2
              },
        
              {
                type: 'Feature',
                properties: {
                  SMID: '101',
                  SMSDRIW: '117.33055',
                  SMSDRIN: '38.620922',
                  SMSDRIE: '117.53431',
                  SMSDRIS: '38.56734',
                  SMUSERID: '9',
                  SMAREA: '4.042988389975608E7',
                  SMPERIMETER: '39763.54581827346',
                  SMGEOMETRYSIZE: '264',
                  LANDTYPE: '水浇地',
                  AREA: '40.0',
                  AREA_1: '40',
                  stringID: null,
                  ID: 101
                },
                geometry: {
                  type: 'PolyLine',
                  coordinates: [
                        [117.525891381017, 38.6144829360722],
                        [117.525891381017, 38.7144829360722]
                  ]
                },
                dv_v5_markerStyle:{},
                id: 101
              }]
          this._initOverlayLayer(layer, features)
        }, 100);
        
      }
      echartsLayerResize() {}
      stopCanvg() {}
    };
  }
  
  module.exports.createWebMapV2BaseExtending = createWebMapV2BaseExtending;