import WebMapViewModel from '../WebMapViewModel.ts';
import layerData from '../../../../test/unit/mocks/data/layerData.json';
import mockFetch from 'vue-iclient/test/unit/mocks/FetchRequest';
import iportal_serviceProxy from '../../../../test/unit/mocks/data/iportal_serviceProxy.json';
import vectorLayer_point from '../../../../test/unit/mocks/data/WebMap/vectorLayer_point.json';
import vectorLayer_line from '../../../../test/unit/mocks/data/WebMap/vectorLayer_line.json';
import flushPromises from 'flush-promises';
import ranksymbolLayer from '../../../../test/unit/mocks/data//WebMap/ranksymbolLayer.json';
import wmtsLayer from 'vue-iclient/test/unit/mocks/data/WebMap/wmtsLayer.json';
import wmsLayer from 'vue-iclient/test/unit/mocks/data/WebMap/wmsLayer.json';
import xyzLayer from 'vue-iclient/test/unit/mocks/data/WebMap/xyzLayer.json';
import markerLayer from 'vue-iclient/test/unit/mocks/data/WebMap/markerLayer';
import mapboxstyleLayer from 'vue-iclient/test/unit/mocks/data/WebMap/mapboxstyleLayer.json';
import tiandituLayer from 'vue-iclient/test/unit/mocks/data/WebMap/tiandituLayer.json';
import layerData_geojson from '../../../../test/unit/mocks/data/layerData_geojson.json';
import { wmtsCapabilitiesText } from 'vue-iclient/test/unit/mocks/data/CapabilitiesText.js';

const commonId = 123;
const commonOption = {
  accessKey: undefined,
  accessToken: undefined,
  excludePortalProxyUrl: undefined,
  iportalServiceProxyUrlPrefix: undefined,
  isSuperMapOnline: undefined,
  proxy: undefined,
  serverUrl: 'https://fakeiportal.supermap.io/iportal',
  target: 'map',
  tiandituKey: undefined,
  withCredentials: false
};
window.canvg = {
  default: {
    from: (ctx, url, callback) => Promise.resolve({ stop: jest.fn(), start: jest.fn() })
  }
};
const commonMap = {
  resize: () => jest.fn(),
  getZoom: () => jest.fn(),
  setZoom: () => jest.fn(),
  setCRS: () => jest.fn(),
  getCenter: () => {
    return {
      lng: 1,
      lat: 2
    };
  },
  setCenter: () => jest.fn(),
  getBearing: () => 2,
  setBearing: () => jest.fn(),
  getPitch: () => 2,
  setPitch: () => jest.fn(),
  getStyle: () => {
    return {
      sources: {
        style1: {
          type: 'raster',
          rasterSource: 'iserver'
        }
      }
    };
  },
  getSource: () => jest.fn(),
  removeSource: () => jest.fn(),
  triggerRepaint: () => jest.fn(),
  style: {
    sourceCaches: {
      style1: {
        clearTiles: () => jest.fn(),
        update: () => jest.fn()
      }
    }
  },
  getLayer: () => '',
  removeLayer: () => jest.fn(),
  getCRS: () => {
    return {
      epsgCode: 'EPSG:3857',
      getExtent: () => jest.fn()
    };
  },
  addLayer: () => jest.fn(),
  overlayLayersManager: {},
  on: () => {},
  fire: () => {},
  setLayoutProperty: () => jest.fn(),
  addStyle: () => jest.fn(),
  remove: () => jest.fn(),
  addSource: () => jest.fn(),
  setRenderWorldCopies: () => jest.fn(),
  setStyle: () => jest.fn(),
  loadImage: () => jest.fn()
};
const commonMapOptions = {
  container: 'map',
  style: {
    version: 8,
    sources: {
      'raster-tiles': {
        type: 'raster',
        tiles: ['https://test'],
        tileSize: 256
      }
    },
    layers: [
      {
        id: 'simple-tiles',
        type: 'raster',
        source: 'raster-tiles',
        minzoom: 5,
        maxzoom: 20
      }
    ]
  },
  center: [120.143, 30.236],
  zoom: 3,
  bounds: {
    getEast: () => 2,
    getWest: () => -1,
    getSouth: () => 2,
    getNorth: () => -1
  }
};

describe('WebMapViewModel.spec', () => {
  it('constructor options = undefined, id is Object', () => {
    const id = {
      baseLayer: {
        layerType: 'TILE',
        name: '中国暗色地图',
        url: 'https://test/iserver/services/map_China/rest/maps/China_Dark'
      },
      center: {
        x: 0,
        y: 0
      },
      description: '',
      extent: {
        leftBottom: {
          x: 0,
          y: 1
        },
        rightTop: {
          x: 1,
          y: 2
        }
      },
      layers: [],
      level: 3,
      maxScale: '1:144447.92746805',
      minScale: '1:591658710.909131',
      projection: 'EPSG:3857',
      rootUrl: 'http://test',
      title: '无标题',
      version: '2.3.0'
    };
    expect(() => {
      new WebMapViewModel(id);
    }).not.toThrow();
  });

  it('uniqueLayer', () => {
    const fetchResource = {
      'https://www.supermapol.com/web/datas/658963918/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        layerData
    };
    mockFetch(fetchResource);
    const datavizWebMap_Unique = {
      version: '6.0',
      title: 'Unique',
      description: '',
      projection: 'EPSG:3857',
      center: { x: 12949175.717869252, y: 4864340.473197712 },
      level: 12,
      extent: {
        leftBottom: { x: -20037508.3427892, y: -20037508.3427892 },
        rightTop: { x: 20037508.3427892, y: 20037508.3427892 }
      },
      baseLayer: { layerType: 'CLOUD', name: '高德地图' },
      layers: [
        {
          layerType: 'UNIQUE',
          name: '住宅_Lite(10)',
          visible: true,
          featureType: 'POINT',
          xyField: { xField: 'SmX', yField: 'SmY' },
          projection: 'EPSG:4326',
          style: {
            radius: 12,
            lineDash: 'solid',
            strokeWidth: 1,
            strokeColor: '#ffffff',
            strokeOpacity: 1,
            fillOpacity: 0.9,
            fillColor: '#3288bd'
          },
          themeSetting: {
            themeField: '区站号',
            colors: ['#D53E4F', '#FC8D59', '#FEE08B', '#FFFFBF', '#E6F598', '#99D594', '#3288BD'],
            customSettings: { 50136: '#D53E4F' }
          },
          dataSource: { type: 'PORTAL_DATA', serverId: 658963918 }
        },
        {
          layerType: 'TILE',
          visible: true,
          name: 'ChinaqxAlberts_4548@fl',
          url: 'http://fake/iserver/services/map-4548/rest/maps/ChinaqxAlberts_4548%40fl'
        }
      ],
      sourceType: 'DataViz',
      thumbnail: 'http://127.0.0.1:8090/iportal/static/dataviz/static/imgs/thumbnail_default.png'
    };
    expect(() => {
      new WebMapViewModel(datavizWebMap_Unique);
    }).not.toThrow();
  });

  it('rangeLayer', () => {
    const fetchResource = {
      'https://www.supermapol.com/web/datas/1236941499/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        layerData
    };
    mockFetch(fetchResource);
    var datavizWebMap_Range = {
      version: '6.0',
      title: 'RANGE_LABEL',
      description: '',
      projection: 'EPSG:3857',
      center: { x: 12957697.597143793, y: 4851476.112683487 },
      level: 10,
      extent: {
        leftBottom: { x: -20037508.3427892, y: -20037508.3427892 },
        rightTop: { x: 20037508.3427892, y: 20037508.3427892 }
      },
      baseLayer: { layerType: 'BING', name: 'BING地图' },
      layers: [
        {
          layerType: 'RANGE',
          name: '北京市轨道交通线路(2)',
          visible: true,
          featureType: 'LINE',
          xyField: { xField: null, yField: null },
          projection: 'EPSG:4326',
          style: {
            radius: 5,
            lineDash: 'solid',
            strokeWidth: 11,
            strokeColor: '#99D594',
            strokeOpacity: 1,
            fillOpacity: 0.9,
            fillColor: '#FFFFFF'
          },
          themeSetting: {
            segmentCount: 6,
            segmentMethod: 'square',
            colors: ['#D53E4F', '#FC8D59', '#FEE08B', '#FFFFBF', '#E6F598', '#99D594', '#3288BD'],
            customSettings: {},
            themeField: 'SmID'
          },
          labelStyle: { fill: '#333', fontFamily: '仿宋', labelField: '标准名称' },
          dataSource: { type: 'PORTAL_DATA', serverId: 1236941499 }
        }
      ],
      sourceType: 'DataViz',
      thumbnail: 'http://127.0.0.1:8090/iportal/static/dataviz/static/imgs/thumbnail_default.png'
    };
    expect(() => {
      new WebMapViewModel(datavizWebMap_Range);
    }).not.toThrow();
  });

  it('heatLayer', () => {
    const fetchResource = {
      'https://www.supermapol.com/web/datas/675746998/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        layerData
    };
    mockFetch(fetchResource);
    var datavizWebMap_Heat = {
      version: '6.0',
      title: 'Heat',
      description: '',
      projection: 'EPSG:3857',
      center: { x: 13428717.554131005, y: 3553719.2183414707 },
      level: 7,
      extent: {
        leftBottom: { x: -20037508.3427892, y: -20037508.3427892 },
        rightTop: { x: 20037508.3427892, y: 20037508.3427892 }
      },
      baseLayer: { layerType: 'BAIDU', name: 'BAIDU地图' },
      layers: [
        {
          layerType: 'HEAT',
          name: '浙江省高等院校(3)',
          visible: true,
          featureType: 'POINT',
          xyField: { xField: '经度', yField: '纬度' },
          projection: 'EPSG:4326',
          themeSetting: {
            colors: ['#9766bf', '#c9adad', '#b5addd', '#93a9dd', '#74a9e1'],
            weight: '纬度',
            radius: 10,
            customSettings: {
              0: {
                hsl: { h: 55.36363636363636, s: 0.9401709401709404, l: 0.5411764705882353, a: 1 },
                hex: '#f8e71c',
                rgb: { r: 248, g: 231, b: 28, a: 1 },
                hsv: { h: 55.36363636363636, s: 0.8870967741935485, v: 0.9725490196078431, a: 1 },
                oldHue: 240,
                source: 'hex'
              }
            }
          },
          dataSource: { type: 'PORTAL_DATA', serverId: 675746998 }
        }
      ],
      sourceType: 'DataViz',
      thumbnail: 'http://127.0.0.1:8090/iportal/static/dataviz/static/imgs/thumbnail_default.png'
    };
    expect(() => {
      new WebMapViewModel(datavizWebMap_Heat);
    }).not.toThrow();
  });

  it('add vectorLayer_point', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/1920557079/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        layerData,
      'https://fakeiportal.supermap.io/iportal/web/datas/13136933/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        layerData_geojson['POINT_GEOJSON']
    };
    mockFetch(fetchResource);
    const id = vectorLayer_point;
    const callback = jest.fn();
    const viewModel = new WebMapViewModel(id, commonOption);
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    expect(callback.mock.called).toBeTruthy;
    done();
  });

  it('add vectorLayer_point with SYMBOL_POINT', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/1920557079/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        layerData
    };
    mockFetch(fetchResource);
    const id = {
      ...vectorLayer_point,
      layers: [
        {
          ...vectorLayer_point.layers[0],
          style: {
            ...vectorLayer_point.layers[0].style,
            className: 'supermapol-icons-Shape-50',
            fontSize: '16px',
            name: 'Shape2-2',
            offsetX: 0,
            offsetY: 0,
            rotation: 0,
            type: 'SYMBOL_POINT',
            unicode: '&#xe691'
          }
        }
      ]
    };
    const callback = jest.fn();
    const viewModel = new WebMapViewModel(id, commonOption);
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    expect(callback.mock.called).toBeTruthy;
    done();
  });

  it('add vectorLayer_line road', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/1920557079/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        layerData
    };
    mockFetch(fetchResource);
    const style = vectorLayer_line.layers[0].style;
    const roadId = {
      ...vectorLayer_line,
      layers: [
        {
          ...vectorLayer_line.layers[0],
          style: [style, style]
        }
      ]
    };
    const mapOptions = undefined;
    const map = {
      ...commonMap,
      getSource: () => ''
    };
    const callback = jest.fn();
    const viewModel = new WebMapViewModel(roadId, { ...commonOption, map }, mapOptions);
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    expect(callback.mock.called).toBeTruthy;
    done();
  });

  it('add DATAFLOW_POINT_TRACKLayer', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/676516522/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        layerData
    };
    mockFetch(fetchResource);
    const id = {
      ...ranksymbolLayer,
      layers: [
        {
          ...ranksymbolLayer.layers[0],
          layerType: 'DATAFLOW_POINT_TRACK',
          wsUrl: '',
          filterCondition: '>5',
          projection: 'EPSG:3857',
          pointStyle: {
            type: 'SVG_POINT'
          },
          identifyField: 'id',
          maxPointCount: 100,
          directionField: 'description'
        }
      ]
    };
    const map = {
      ...commonMap,
      getSource: () => {
        return {
          _data: {
            features: [
              {
                properties: { id: 1 }
              }
            ]
          },
          getSource: () => jest.fn(),
          setData: () => jest.fn()
        };
      }
    };
    const mapOption = undefined;
    const callback = jest.fn();
    const viewModel = new WebMapViewModel(id, { ...commonOption, map }, mapOption);
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    expect(callback.mock.called).toBeTruthy;
    done();
  });

  it('add DATAFLOW_POINT_TRACKLayer with style is IMAGE_POINT', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/676516522/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        layerData
    };
    mockFetch(fetchResource);
    const id = {
      ...ranksymbolLayer,
      layers: [
        {
          ...ranksymbolLayer.layers[0],
          wsUrl: '',
          filterCondition: '>5',
          projection: 'EPSG:3857',
          style: {
            strokeWidth: 1,
            fillColor: '#24B391',
            offsetX: 0,
            offsetY: 0,
            fillOpacity: 0.9,
            radius: 6,
            strokeColor: '#ffffff',
            type: 'IMAGE_POINT',
            strokeOpacity: 1,
            imageInfo: {
              url: ''
            }
          }
        }
      ]
    };
    const map = {
      ...commonMap,
      getSource: () => {
        return {
          _data: {
            features: [
              {
                properties: { id: 1 }
              }
            ]
          },
          getSource: () => jest.fn(),
          setData: () => jest.fn()
        };
      }
    };
    const mapOption = undefined;
    const callback = jest.fn();
    const viewModel = new WebMapViewModel(id, { ...commonOption, map }, mapOption);
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    expect(callback.mock.called).toBeTruthy;
    done();
  });

  it('add DATAFLOW_POINT_TRACKLayer with style is SVG_POINT', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/676516522/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        layerData
    };
    mockFetch(fetchResource);
    const id = {
      ...ranksymbolLayer,
      layers: [
        {
          ...ranksymbolLayer.layers[0],
          wsUrl: '',
          filterCondition: '>5',
          projection: 'EPSG:3857',
          style: {
            strokeWidth: 1,
            fillColor: '#24B391',
            offsetX: 0,
            offsetY: 0,
            fillOpacity: 0.9,
            radius: 6,
            strokeColor: '#ffffff',
            type: 'SVG_POINT',
            strokeOpacity: 1,
            imageInfo: {
              url: ''
            }
          }
        }
      ]
    };
    const map = {
      ...commonMap,
      getSource: () => ''
    };
    const mapOption = undefined;
    const callback = jest.fn();
    const viewModel = new WebMapViewModel(id, { ...commonOption, map }, mapOption);
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    expect(callback.mock.called).toBeTruthy;
    done();
  });

  it('initial_wmtsLayer', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'http://support.supermap.com.cn:8090/iserver/services/map-china400/wmts100?REQUEST=GetCapabilities&SERVICE=WMTS&VERSION=1.0.0':
        wmtsCapabilitiesText
    };
    mockFetch(fetchResource);
    const callback = jest.fn();
    const viewModel = new WebMapViewModel(wmtsLayer, commonOption);
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    expect(callback.mock.called).toBeTruthy;
    done();
  });

  it('initial_wmsLayer', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/4845656956/map.json': wmsLayer
    };
    mockFetch(fetchResource);
    const callback = jest.fn();
    const viewModel = new WebMapViewModel(wmsLayer, commonOption);
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    expect(callback.mock.called).toBeTruthy;
    done();
  });

  it('initial_TiandituLayer', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/4845656956/map.json': tiandituLayer
    };
    mockFetch(fetchResource);
    const callback = jest.fn();
    const viewModel = new WebMapViewModel(tiandituLayer, commonOption);
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    expect(callback.mock.called).toBeTruthy;
    done();
  });

  it('initial_xyzLayer', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/7894565555/map.json': xyzLayer
    };
    mockFetch(fetchResource);
    const callback = jest.fn();
    const viewModel = new WebMapViewModel(xyzLayer, commonOption);
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    expect(callback.mock.called).toBeTruthy;
    done();
  });

  it('initial_rankSymbolLayer', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/4845656956/map.json': ranksymbolLayer,
      'https://fakeiportal.supermap.io/iportal/web/datas/676516522/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        layerData
    };
    mockFetch(fetchResource);
    const callback = jest.fn();
    const viewModel = new WebMapViewModel(ranksymbolLayer, commonOption);
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    expect(callback.mock.called).toBeTruthy;
    done();
  });

  it('initial_markerLayer', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/4845656956/map.json': markerLayer,
      'https://fakeiportal.supermap.io/iportal/web/datas/123456/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        layerData_geojson['MARKER_GEOJSON']
    };
    mockFetch(fetchResource);
    const callback = jest.fn();
    const viewModel = new WebMapViewModel(markerLayer, commonOption);
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    expect(callback.mock.called).toBeTruthy;
    done();
  });

  it('initial_migrationLayer', async done => {
    const fetchResource = {
      'https://www.supermapol.com/web/datas/675746998/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        layerData
    };
    mockFetch(fetchResource);
    const migrationLayer = {
      extent: {
        leftBottom: { x: -20037508.342789244, y: -20037508.342789136 },
        rightTop: { x: 20037508.342789244, y: 20037508.34278908 }
      },
      maxScale: '1:144447.92746804963',
      level: 4.206196893572176,
      center: { x: 11716042.750842523, y: 3847971.9356220393 },
      baseLayer: {
        layerType: 'TILE',
        name: '中国暗色地图',
        url: 'https://maptiles.supermapol.com/iserver/services/map_China/rest/maps/China_Dark'
      },
      layers: [
        {
          layerType: 'MIGRATION',
          labelSetting: { fontFamily: '黑体', color: '#62AD16', show: false },
          visible: true,
          name: '民航数据1(1)',
          featureType: 'POINT',
          from: { type: 'XY_FIELD' },
          projection: 'EPSG:4326',
          to: { type: 'XY_FIELD' },
          enableFields: [
            'latitude',
            'longitude',
            'altitude',
            'geometry',
            '机场',
            'X坐标',
            'Y坐标',
            '名次',
            '2017旅客吞吐量（人次）',
            '2016旅客吞吐量（人次）',
            '同比增速%',
            '2017货邮吞吐量（吨）',
            '2016货邮吞吐量（吨）',
            '2017起降架次（架次）',
            '2016起降架次（架次）'
          ],
          lineSetting: { curveness: 0.2, color: '#62AD16', width: 1, type: 'solid', opacity: 0.6 },
          dataSource: { accessType: 'DIRECT', type: 'PORTAL_DATA', serverId: '1184572358' },
          animationSetting: { symbol: 'pin', symbolSize: 15, show: false, constantSpeed: 40 }
        },
        {
          layerType: 'MIGRATION',
          labelSetting: { fontFamily: '黑体', color: '#62AD16', show: false },
          visible: true,
          name: '全国671个气象站观测数据(1)',
          featureType: 'POINT',
          from: { field: '站台', type: 'PLACE_FIELD' },
          projection: 'EPSG:4326',
          to: { field: '省份', type: 'PLACE_FIELD' },
          enableFields: [
            'SmID',
            'SmX',
            'SmY',
            'SmLibTileID',
            'SmUserID',
            'SmGeometrySize',
            '区站号',
            '站台',
            '省份',
            '海拔',
            '平均最低气温',
            '最热七天气温',
            '最高气温',
            '最低气温',
            '年均降雨',
            '年均降雨_Num',
            '最低气温_Num',
            '最高气温_Num',
            '最高七天气温_Num',
            '平均最低气温_Num',
            '海波_Num'
          ],
          lineSetting: { curveness: 0.2, color: '#62AD16', width: 1, type: 'solid', opacity: 0.6 },
          dataSource: { accessType: 'DIRECT', type: 'PORTAL_DATA', serverId: '850822108' },
          animationSetting: { symbol: 'pin', symbolSize: 15, show: false, constantSpeed: 40 }
        }
      ],
      description: '',
      projection: 'EPSG:3857',
      minScale: '1:591658710.9091312',
      title: '无标题',
      version: '2.3.0'
    };
    mockFetch(fetchResource);
    const callback = jest.fn();
    const viewModel = new WebMapViewModel(markerLayer, commonOption);
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    expect(callback.mock.called).toBeTruthy;
    done();
  });

  it('initial_mapboxstyleLayer', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy
    };
    mockFetch(fetchResource);
    const callback = jest.fn();
    const viewModel = new WebMapViewModel(mapboxstyleLayer, commonOption);
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    setTimeout(() => {
      expect(callback.mock.called).toBeTruthy;
      done();
    }, 100);
  });

  it('setCenter', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy
    };
    mockFetch(fetchResource);
    const callback = jest.fn();
    const viewModel = new WebMapViewModel(mapboxstyleLayer, commonOption);
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    viewModel.setCenter({ x: 11615300.701720804, y: 4436879.386230171 });
    setTimeout(() => {
      expect(callback.mock.called).toBeTruthy;
      expect(viewModel.mapOptions.center).toStrictEqual({ x: 11615300.701720804, y: 4436879.386230171 });
      done();
    }, 100);
  });

  it('clean', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/676516522/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        layerData
    };
    mockFetch(fetchResource);
    const id = {
      ...ranksymbolLayer,
      layers: [
        {
          ...ranksymbolLayer.layers[0],
          layerType: 'DATAFLOW_POINT_TRACK',
          wsUrl: '',
          filterCondition: '>5',
          projection: 'EPSG:3857',
          pointStyle: {
            type: 'SVG_POINT'
          },
          identifyField: 'id',
          maxPointCount: 100,
          directionField: 'description'
        }
      ]
    };
    const mapOption = undefined;
    const callback = jest.fn();
    const viewModel = new WebMapViewModel(id, commonOption);
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    viewModel.clean();
    setTimeout(() => {
      expect(callback.mock.called).toBeTruthy;
      expect(viewModel.center).toBe(null);
      done();
    }, 100);
  });

  it('updateDataFlowFeature', async done => {
    const id = {
      ...ranksymbolLayer,
      layers: [
        {
          ...ranksymbolLayer.layers[0],
          layerType: 'DATAFLOW_POINT_TRACK',
          wsUrl: '',
          filterCondition: '>5',
          projection: 'EPSG:3857',
          pointStyle: {
            type: 'SVG_POINT'
          },
          identifyField: 'id',
          maxPointCount: 100,
          directionField: 'description'
        }
      ]
    };
    const map = {
      ...commonMap,
      getSource: () => {
        return {
          _data: {
            features: [
              {
                properties: { id: 1 }
              }
            ]
          },
          getSource: () => jest.fn(),
          setData: () => jest.fn()
        };
      }
    };
    const mapOption = undefined;
    const callback = jest.fn();
    const viewModel = new WebMapViewModel(id, { ...commonOption, map }, mapOption);
    viewModel.webMapInfo = id;
    viewModel.on({ addlayerssucceeded: callback });
    const layerInfo = {
      layerType: 'DATAFLOW_POINT_TRACK',
      visible: true,
      themeSetting: {
        maxRadius: 12,
        themeField: '名次',
        customSettings: {},
        minRadius: 6,
        segmentMethod: 'offset',
        segmentCount: 6
      },
      name: '民航数据',
      featureType: 'POINT',
      labelStyle: {
        offsetX: 0,
        textBaseline: 'bottom',
        fontFamily: '黑体',
        offsetY: -10,
        outlineWidth: 0,
        textAlign: 'center',
        outlineColor: '#000000',
        fontSize: '14px',
        fill: '#333',
        backgroundFill: [255, 255, 255, 0.8],
        labelField: '机场'
      },
      lineStyle: {
        color: '#ffffff'
      },
      xyField: { xField: 'longitude', yField: 'latitude' },
      style: {
        strokeWidth: 1,
        fillColor: '#24B391',
        offsetX: 0,
        offsetY: 0,
        fillOpacity: 0.9,
        radius: 6,
        strokeColor: '#ffffff',
        type: 'BASIC_POINT',
        strokeOpacity: 1
      },
      projection: 'EPSG:3857',
      enableFields: [
        'latitude',
        'longitude',
        'altitude',
        'geometry',
        '机场',
        'X坐标',
        'Y坐标',
        '名次',
        '2017旅客吞吐量（人次）',
        '2016旅客吞吐量（人次）',
        '同比增速%',
        '2017货邮吞吐量（吨）',
        '2016货邮吞吐量（吨）',
        '2017起降架次（架次）',
        '2016起降架次（架次）'
      ],
      dataSource: { accessType: 'DIRECT', type: 'PORTAL_DATA', serverId: '676516522' },
      wsUrl: '',
      filterCondition: '>5',
      pointStyle: { type: 'SVG_POINT' },
      identifyField: 'id',
      maxPointCount: 100,
      directionField: 'description',
      layerID: '民航数据-0',
      index: 0
    };
    const feature = {
      type: 'Feature',
      properties: {
        dataViz_title: '中间文本\r\n我换行了',
        dataViz_description: '',
        dataViz_imgUrl: '',
        dataViz_url: '',
        dataViz_videoUrl: '',
        dataviz_featureID: 7,
        index: 7
      },
      dv_v5_markerStyle: {
        text: '中间文本\r\n我换行了',
        font: 'bold 13px Microsoft YaHei',
        placement: 'point',
        textAlign: 'justify',
        fillColor: '#ffffff',
        backgroundFill: '#8a5252',
        borderColor: 'rgba(255,255,255,0)',
        borderWidth: 4,
        padding: [8, 8, 8, 8],
        maxWidth: '29'
      },
      dv_v5_markerInfo: {
        dataViz_title: '中间文本\r\n我换行了',
        dataViz_description: '',
        dataViz_imgUrl: '',
        dataViz_url: '',
        dataViz_videoUrl: '',
        dataviz_featureID: 7
      },
      geometry: {
        type: 'Point',
        coordinates: [-45.07301602945205, 59.20101718365072]
      }
    };
    await flushPromises();
    viewModel._initOverlayLayer(layerInfo, [feature]);
    await flushPromises();
    viewModel._updateDataFlowFeature(layerInfo, { data: feature });
    expect(callback.mock.called).toBeTruthy;
    done();
  });
});
