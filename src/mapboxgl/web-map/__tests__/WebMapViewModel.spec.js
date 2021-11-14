import WebMapViewModel from '../WebMapViewModel.ts';
import flushPromises from 'flush-promises';
import iportal_serviceProxy from '../../../../test/unit/mocks/data/iportal_serviceProxy.json';
import layerData from '../../../../test/unit/mocks/data/layerData.json';
import uniqueLayer_polygon from '../../../../test/unit/mocks/data/WebMap/uniqueLayer_polygon.json';
import vectorLayer_point from '../../../../test/unit/mocks/data/WebMap/vectorLayer_point.json';
import vectorLayer_line from '../../../../test/unit/mocks/data/WebMap/vectorLayer_line.json';
import vectorLayer_polygon from '../../../../test/unit/mocks/data//WebMap/vectorLayer_polygon.json';
import rangeLayer from '../../../../test/unit/mocks/data//WebMap/rangeLayer.json';
import heatLayer from '../../../../test/unit/mocks/data//WebMap/heatLayer.json';
import markerLayer from '../../../../test/unit/mocks/data//WebMap/markerLayer.json';
import migrationLayer from '../../../../test/unit/mocks/data//WebMap/migrationLayer.json';
import ranksymbolLayer from '../../../../test/unit/mocks/data//WebMap/ranksymbolLayer.json';
import epsgCode_wkt from '../../../../test/unit/mocks/data/epsgCode_wkt.json';
import mockFetch from 'vue-iclient/test/unit/mocks/FetchRequest';

const SuperMap = require('../../../../test/unit/mocks/supermap');
const CRS = require('../../../../test/unit/mocks/crs');

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
document.getElementById = () => {
  return {
    classList: {
      add: () => jest.fn()
    }
  };
};

describe('WebMapViewModel.spec', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('add uniqueLayer with id is num', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_polygon,
      'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123': layerData
    };
    mockFetch(fetchResource);
    const id = 123;
    const callback = jest.fn();
    const viewModel = new WebMapViewModel(id, commonOption);
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    viewModel.map.fire('load');
    await flushPromises();
    expect(callback.mock.called).toBeTruthy;
    done();
  });

  it('add uniqueLayer with id is obj', async done => {
    const fetchResource = {
      'http://support.supermap.com.cn:8090/iserver/services/map-china400/rest/maps/China/prjCoordSys.wkt': epsgCode_wkt,
      'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': layerData
    };
    mockFetch(fetchResource);
    const id = {
      ...uniqueLayer_polygon,
      level: '',
      visibleExtent: [0, 1, 2, 3]
    };
    const mapOptions = {
      ...commonMapOptions,
      bounds: undefined,
      interactive: true,
      minZoom: 22,
      maxZoom: 0
    };
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const get = jest.spyOn(CRS, 'get');
    get.mockImplementation(() => {
      return '';
    });
    const callback = jest.fn();
    const viewModel = new WebMapViewModel(id, commonOption, mapOptions);
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    viewModel.map.fire('load');
    setTimeout(() => {
      expect(errorSpy.mock.calls).toHaveLength(1);
      const getEpsgCodeWKTJson = JSON.stringify(epsgCode_wkt);
      expect(errorSpy.mock.calls[0][0]).toMatch(`${getEpsgCodeWKTJson} not define`);
      expect(callback.mock.called).toBeTruthy;
      done();
    });
  });

  it('add vectorLayer_point with BASIC_POINT', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/1920557079/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': layerData
    };
    mockFetch(fetchResource);
    const id = vectorLayer_point;
    const callback = jest.fn();
    const viewModel = new WebMapViewModel(id, commonOption);
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    viewModel.map.fire('load');
    await flushPromises();
    expect(callback.mock.called).toBeTruthy;
    done();
  });

  it('add vectorLayer_point with SYMBOL_POINT', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/1920557079/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': layerData
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
    viewModel.map.fire('load');
    await flushPromises();
    expect(callback.mock.called).toBeTruthy;
    done();
  });

  it('add vectorLayer_line road', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/1920557079/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': layerData
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
    const viewModel = new WebMapViewModel(roadId, commonOption, mapOptions, map);
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    viewModel.map.fire('load');
    await flushPromises();
    expect(callback.mock.called).toBeTruthy;
    done();
  });

  it('add vectorLayer_line subway', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/1920557079/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': layerData
    };
    mockFetch(fetchResource);
    const style = vectorLayer_line.layers[0].style;
    const subwayId = {
      ...vectorLayer_line,
      layers: [
        {
          ...vectorLayer_line.layers[0],
          style: [
            style,
            {
              ...style,
              lineDash: 'dash'
            }
          ]
        }
      ]
    };
    const mapOptions = undefined;
    const map = {
      ...commonMap,
      getSource: () => {
        return {
          setData: jest.fn()
        };
      }
    };
    const callback = jest.fn();
    const viewModel = new WebMapViewModel(subwayId, commonOption, mapOptions, map);
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    viewModel.map.fire('load');
    await flushPromises();
    expect(callback.mock.called).toBeTruthy;
    done();
  });

  it('add vectorLayer_polygon', async done => {
    const id = vectorLayer_polygon;
    const callback = jest.fn();
    const viewModel = new WebMapViewModel(id, commonOption);
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    viewModel.map.fire('load');
    await flushPromises();
    expect(callback.mock.called).toBeTruthy;
    done();
  });

  it('add rangeLayer', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/1171594968/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': layerData
    };
    mockFetch(fetchResource);
    const id = rangeLayer;
    const callback = jest.fn();
    const viewModel = new WebMapViewModel(id, commonOption);
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    viewModel.map.fire('load');
    await flushPromises();
    expect(callback.mock.called).toBeTruthy;
    done();
  });

  // _initGraticuleLayer
  it('add rangeLayer', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/1171594968/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': layerData
    };
    mockFetch(fetchResource);
    const id = rangeLayer;
    const callback = jest.fn();
    const viewModel = new WebMapViewModel(id, commonOption);
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    viewModel.map.fire('load');
    await flushPromises();
    expect(callback.mock.called).toBeTruthy;
    done();
  });

  it('add heatLayer', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/1920557079/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': layerData
    };
    mockFetch(fetchResource);
    const id = heatLayer;
    const callback = jest.fn();
    const viewModel = new WebMapViewModel(id, commonOption);
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    viewModel.map.fire('load');
    await flushPromises();
    expect(callback.mock.called).toBeTruthy;
    done();
  });

  // 报错Cannot read property 'text' of undefined
  it('add markerLayer', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/123456/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': layerData
    };
    mockFetch(fetchResource);
    const id = markerLayer;
    const callback = jest.fn();
    const viewModel = new WebMapViewModel(id, commonOption);
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    viewModel.map.fire('load');
    await flushPromises();
    expect(callback.mock.called).toBeTruthy;
    done();
  });

  it('add migrationLayer', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/516597759/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': layerData
    };
    mockFetch(fetchResource);
    const id = migrationLayer;
    const callback = jest.fn();
    const viewModel = new WebMapViewModel(id, commonOption);
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    viewModel.map.fire('load');
    await flushPromises();
    expect(callback.mock.called).toBeTruthy;
    done();
  });

  it('add ranksymbolLayer', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/676516522/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': layerData
    };
    mockFetch(fetchResource);
    const id = ranksymbolLayer;
    const callback = jest.fn();
    const viewModel = new WebMapViewModel(id, commonOption);
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    viewModel.map.fire('load');
    await flushPromises();
    expect(callback.mock.called).toBeTruthy;
    done();
  });

  // 报错 Cannot read property 'id' of undefined
  it('add DATAFLOW_POINT_TRACKLayer', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/676516522/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': layerData
    };
    mockFetch(fetchResource);
    window.jsonsql.query = () => {
      return [{}];
    };
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
          getSource: () => jest.fn()
        };
      }
    };
    const mapOption = undefined;
    const callback = jest.fn();
    const viewModel = new WebMapViewModel(id, commonOption, mapOption, map);
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    viewModel.map.fire('load');
    await flushPromises();
    expect(callback.mock.called).toBeTruthy;
    done();
  });

  it('add DATAFLOW_POINT_TRACKLayer with style is IMAGE_POINT', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/676516522/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': layerData
    };
    mockFetch(fetchResource);
    window.jsonsql.query = () => {
      return [{}];
    };
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
            type: 'IMAGE_POINT',
            imageInfo: {
              url: 'http://test'
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
    const viewModel = new WebMapViewModel(id, commonOption, mapOption, map);
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    viewModel.map.fire('load');
    await flushPromises();
    expect(callback.mock.called).toBeTruthy;
    done();
  });

  // _createGraphicLayer 1018
  it('add DATAFLOW_POINT_TRACKLayer with style is SVG_POINT', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/676516522/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': layerData
    };
    mockFetch(fetchResource);
    window.jsonsql.query = () => {
      return [{}];
    };
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
            type: 'SVG_POINT',
            url: 'http://test'
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
    const viewModel = new WebMapViewModel(id, commonOption, mapOption, map);
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    viewModel.map.fire('load');
    await flushPromises();
    expect(callback.mock.called).toBeTruthy;
    done();
  });

  // public Func
  xit('resize', async () => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy
    };
    mockFetch(fetchResource);
    const viewModel = new WebMapViewModel(commonId, commonOption, commonMapOptions, commonMap);
    const spy = jest.spyOn(viewModel, 'echartsLayerResize');
    await flushPromises();
    viewModel.resize();
    expect(spy).toBeCalled();
  });

  it('resize', async () => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_polygon,
      'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123': layerData
    };
    mockFetch(fetchResource);
    const viewModel = new WebMapViewModel(commonId, commonOption, commonMapOptions, commonMap);
    const spy = jest.spyOn(viewModel.map, 'setZoom');
    await flushPromises();
    viewModel.resize(true);
    expect(spy).toBeCalled();
  });

  xit('setCrs', async () => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_polygon,
      'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123': layerData
    };
    mockFetch(fetchResource);
    const crs = {
      epsgCode: 'EPSG:4326',
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
      unit: 'm'
    };
    const viewModel = new WebMapViewModel(commonId, commonOption, commonMapOptions, commonMap);
    const spy = jest.spyOn(viewModel.map, 'setCRS');
    await flushPromises();
    expect(viewModel.mapOptions.crs).toBeUndefined();
    viewModel.setCrs(crs);
    expect(viewModel.mapOptions.crs).not.toBeUndefined();
    expect(spy).toBeCalled();
  });

  it('setCrs should get epsgCode', async () => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_polygon,
      'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123': layerData
    };
    mockFetch(fetchResource);
    const crs = {
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
      unit: 'm'
    };
    const viewModel = new WebMapViewModel(commonId, commonOption, commonMapOptions, commonMap);
    const spy = jest.spyOn(viewModel.map, 'setCRS');
    await flushPromises();
    expect(viewModel.mapOptions.crs).toBeUndefined();
    viewModel.setCrs(crs);
    expect(viewModel.mapOptions.crs).not.toBeUndefined();
    expect(spy).toBeCalled();
  });

  it('setCenter when center is [] return', async () => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_polygon,
      'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123': layerData
    };
    mockFetch(fetchResource);
    const center = [];
    const viewModel = new WebMapViewModel(commonId, commonOption, commonMapOptions, commonMap);
    const spy = jest.spyOn(viewModel.map, 'getCenter');
    await flushPromises();
    expect(spy).not.toBeCalled();
    viewModel.setCenter(center);
    expect(spy).not.toBeCalled();
  });

  it('setCenter update center', async () => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_polygon,
      'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123': layerData
    };
    mockFetch(fetchResource);
    const center = [1, 1];
    const viewModel = new WebMapViewModel(commonId, commonOption, commonMapOptions, commonMap);
    const spy = jest.spyOn(viewModel.map, 'setCenter');
    await flushPromises();
    expect(spy).not.toBeCalled();
    viewModel.setCenter(center);
    expect(spy).toBeCalled();
  });

  it('setRenderWorldCopies', async () => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_polygon,
      'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123': layerData
    };
    mockFetch(fetchResource);
    const renderWorldCopies = {};
    const viewModel = new WebMapViewModel(commonId, commonOption, commonMapOptions, commonMap);
    const spy = jest.spyOn(viewModel.map, 'setRenderWorldCopies');
    await flushPromises();
    expect(spy).not.toBeCalled();
    viewModel.setRenderWorldCopies(renderWorldCopies);
    expect(spy).toBeCalled();
  });

  it('setBearing', async () => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_polygon,
      'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123': layerData
    };
    mockFetch(fetchResource);
    const bearing = 0;
    const viewModel = new WebMapViewModel(commonId, commonOption, commonMapOptions, commonMap);
    const spy = jest.spyOn(viewModel.map, 'setBearing');
    await flushPromises();
    expect(viewModel.mapOptions.bearing).toBeUndefined();
    viewModel.setBearing();
    expect(viewModel.mapOptions.bearing).toBeUndefined();
    expect(spy).not.toBeCalled();
    viewModel.setBearing(bearing);
    expect(viewModel.mapOptions.bearing).not.toBeUndefined();
    expect(spy).toBeCalled();
  });

  it('setPitch', async () => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_polygon,
      'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123': layerData
    };
    mockFetch(fetchResource);
    const pitch = 0;
    const viewModel = new WebMapViewModel(commonId, commonOption, commonMapOptions, commonMap);
    const spy = jest.spyOn(viewModel.map, 'setPitch');
    await flushPromises();
    expect(viewModel.mapOptions.pitch).toBeUndefined();
    viewModel.setPitch();
    expect(spy).not.toBeCalled();
    viewModel.setPitch(pitch);
    expect(viewModel.mapOptions.pitch).not.toBeUndefined();
    expect(spy).toBeCalled();
  });

  it('setStyle', async () => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_polygon,
      'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123': layerData
    };
    mockFetch(fetchResource);
    const style = {
      color: '#fff'
    };
    const viewModel = new WebMapViewModel(commonId, commonOption, commonMapOptions, commonMap);
    const spy = jest.spyOn(viewModel.map, 'setStyle');
    await flushPromises();
    expect(spy).not.toBeCalled();
    viewModel.setStyle(style);
    expect(viewModel.mapOptions.style).toBe(style);
    expect(spy).toBeCalled();
  });

  it('setRasterTileSize', async () => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_polygon,
      'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123': layerData
    };
    mockFetch(fetchResource);
    const tileSize = -1;
    const newTileSize = 2;
    const viewModel = new WebMapViewModel(commonId, commonOption, commonMapOptions, commonMap);
    const spy = jest.spyOn(viewModel, '_updateRasterSource');
    await flushPromises();
    viewModel.setRasterTileSize(tileSize);
    expect(spy).not.toBeCalled();
    viewModel.setRasterTileSize(newTileSize);
    expect(spy).toBeCalled();
  });

  it('setLayersVisible', async () => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_polygon,
      'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123': layerData
    };
    mockFetch(fetchResource);
    const viewModel = new WebMapViewModel(commonId, commonOption, commonMapOptions, commonMap);
    viewModel._cacheLayerId = ['ChinaDark', '民航数据'];
    await flushPromises();
    const spy = jest.spyOn(viewModel.map, 'setLayoutProperty');
    const isShow = false;
    const changeShow = true;
    const ignoreIds = ['ChinaDark'];
    viewModel.setLayersVisible(isShow, ignoreIds);
    viewModel.setLayersVisible(changeShow);
    expect(spy).toBeCalled();
  });

  // 在 layerManager
  it('cleanLayers', async () => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_polygon,
      'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123': layerData
    };
    mockFetch(fetchResource);
    const viewModel = new WebMapViewModel(commonId, commonOption, commonMapOptions, commonMap);
    await flushPromises();
    viewModel._cacheLayerId = ['ChinaDark', '民航数据'];
    viewModel.map.getLayer = () => jest.fn();
    expect(viewModel._cacheLayerId.length).toBe(2);
    viewModel.cleanLayers();
    expect(viewModel._cacheLayerId.length).toBe(0);
  });

  // 在 MD 调用
  const layerInfo = {
    layerID: 'style1',
    layerType: 'restMap',
    visible: false,
    featureType: 'POINT',
    style: {
      radius: 6,
      fillColor: '#ff0000',
      fillOpacity: 0.9,
      strokeColor: '#ffffff',
      strokeWidth: 1,
      strokeOpacity: 1,
      lineDash: 'solid',
      symbolType: 'svg',
      type: 'POLYGON'
    },
    labelStyle: {},
    projection: 'EPSG:3857'
  };
  const features = [
    {
      geometry: { type: 'Point', coordinates: [0, 1] },
      properties: {
        title: '老虎海',
        subtitle: '树正沟景点-老虎海',
        imgUrl: './laohuhai.png',
        description: '老虎海海拔2298米',
        index: 1
      },
      type: 'Feature',
      bounds: {
        left: 10,
        top: 10,
        bottom: 10,
        right: 10
      },
      coordUnit: 'm',
      visibleScales: 18,
      url: 'http://test'
    }
  ];

  // 有报错 堆栈溢出
  it('updateOverlayLayer mvt', async () => {
    // const fetchResource = {
    //   'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
    //   'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_polygon,
    //   'https://fakeiportal.supermap.io/iportal/': layerData
    // };
    // mockFetch(fetchResource);
    const FetchRequest = jest.spyOn(SuperMap.FetchRequest, 'get');
    FetchRequest.mockImplementation(url => {
      return new Promise((resolve, reject) => {
        if (url == 'https://fakeiportal.supermap.io/iportal/web/config/portal.json') {
          resolve(new Response(JSON.stringify(iportal_serviceProxy)));
        }
        if (
          url ==
          'http://test/tileFeature.mvt?&returnAttributes=true&width=512&height=512&x={x}&y={y}&scale={scale}&origin={x:undefined,y:undefined}'
        ) {
          resolve(new Response(JSON.stringify(layerData)));
        } else {
          reject('未匹配到');
        }
      });
    });
    const map = {
      ...commonMap,
      getSource: () => {
        return {
          _data: {
            features: {
              info: {
                url: 'http://test'
              },
              featureType: 'POLYGON'
            }
          }
        };
      },
      getLayer: () => {
        return {
          a: 1
        };
      }
    };
    const viewModel = new WebMapViewModel(commonId, commonOption, commonMapOptions, map);
    await flushPromises();
    const mvtLayerInfo = {
      ...layerInfo,
      layerType: 'mvt',
      featureType: 'POLYGON'
    };
    const mvtFeatures = [];
    const spy = jest.spyOn(viewModel, '_addLayerSucceeded');
    viewModel.updateOverlayLayer(mvtLayerInfo, mvtFeatures);
    expect(spy).toBeCalled();
  });
});
