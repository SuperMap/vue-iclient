import WebMapViewModel from '../WebMapViewModel.ts';
import flushPromises from 'flush-promises';
import iportal_serviceProxy from '../../../../test/unit/mocks/data/iportal_serviceProxy.json';
import layerData from '../../../../test/unit/mocks/data/layerData.json';
import layerData_geojson from '../../../../test/unit/mocks/data/layerData_geojson.json';
import uniqueLayer_polygon from '../../../../test/unit/mocks/data/WebMap/uniqueLayer_polygon.json';
import vectorLayer_point from '../../../../test/unit/mocks/data/WebMap/vectorLayer_point.json';
import vectorLayer_line from '../../../../test/unit/mocks/data/WebMap/vectorLayer_line.json';
import vectorLayer_polygon from '../../../../test/unit/mocks/data//WebMap/vectorLayer_polygon.json';
import rangeLayer from '../../../../test/unit/mocks/data//WebMap/rangeLayer.json';
import heatLayer from '../../../../test/unit/mocks/data//WebMap/heatLayer.json';
import markerLayer from '../../../../test/unit/mocks/data//WebMap/markerLayer.json';
import migrationLayer from '../../../../test/unit/mocks/data//WebMap/migrationLayer.json';
import ranksymbolLayer from '../../../../test/unit/mocks/data//WebMap/ranksymbolLayer.json';
import baseLayers from 'vue-iclient/test/unit/mocks/data/WebMap/baseLayers.json';
import wmsLayer from 'vue-iclient/test/unit/mocks/data/WebMap/wmsLayer.json';
import wmtsLayer from 'vue-iclient/test/unit/mocks/data/WebMap/wmtsLayer.json';
import { wmsCapabilitiesText, wmtsCapabilitiesText, wmsCapabilitiesTextWith130 } from 'vue-iclient/test/unit/mocks/data/CapabilitiesText.js';
import restmapLayer from 'vue-iclient/test/unit/mocks/data/WebMap/restmapLayer.json';
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

  // _initGraticuleLayer
  it('add rangeLayer', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/1171594968/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': layerData
    };
    mockFetch(fetchResource);
    const id = rangeLayer;
    const callback = async function(data) {
      await flushPromises();
      viewModel.setZoom(2);
      viewModel.map.getZoom = function() {
        return 2;
      }
      viewModel.map.fire('zoomend');
      viewModel.setZoom(5);
      viewModel.map.getZoom = function() {
        return 5;
      }
      viewModel.map.fire('zoomend');
      expect(data).not.toBeUndefined();
      done();
    };
    const viewModel = new WebMapViewModel(id, commonOption);
    viewModel.on({ addlayerssucceeded: callback });
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

  it('add markerLayer', async done => {
    window.canvg = (a, b, c) => {
      c.renderCallback();
    };
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/123456/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': layerData_geojson
    };
    mockFetch(fetchResource);
    const id = markerLayer;
    const callback = jest.fn();
    const viewModel = new WebMapViewModel(id, commonOption);
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    setTimeout(() => {
      expect(callback.mock.called).toBeTruthy;
      done();
    }, 100);
  });

  it('markerLayer url is error', async done => {
    window.canvg = (a, b, c) => {
      c.renderCallback();
    };
    const newLayerData_geojson = {
      ...layerData_geojson,
      content:
        '{"type":"FeatureCollection","crs":{"type":"name","properties":{"name":"urn:ogc:def:crs:OGC:1.3:CRS84"}},"features":[{"type":"Feature","properties":{"dataViz_title":"","dataViz_description":"","dataViz_imgUrl":"","dataViz_url":"","dataViz_videoUrl":""},"dv_v5_markerStyle":{"fillColor":"#FFF","fillOpacity":"0.6","strokeColor":"#fff","strokeOpacity":"0,6","strokeWidth":"400","src":"apps/dataviz/static/imgs/markers/mark_red.svg","scale":1,"anchor":[0.5,0.5],"imgWidth":48,"imgHeight":43},"dv_v5_markerInfo":{"dataViz_title":"","dataViz_description":"","dataViz_imgUrl":"","dataViz_url":"","dataViz_videoUrl":""},"geometry":{"type":"Point","coordinates":[103.59008789062496,30.31598771855792]}}]}'
    };
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/123456/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': newLayerData_geojson
    };
    mockFetch(fetchResource);
    const id = markerLayer;
    const callback = jest.fn();
    const viewModel = new WebMapViewModel(id, commonOption);
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    viewModel.map.fire('load');
    await flushPromises();
    setTimeout(() => {
      expect(callback.mock.called).toBeTruthy;
      done();
    }, 100);
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
          getSource: () => jest.fn(),
          setData: () => jest.fn()
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

  it('add DATAFLOW_POINT_TRACKLayer with style is SVG_POINT', async done => {
    window.canvg = (a, b, c) => {
      c.renderCallback();
    };
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
  it('resize map', async () => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_polygon,
      'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123': layerData
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

  it('setCrs', async () => {
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
  it('updateOverlayLayer mvt', async () => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_polygon,
      'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123': layerData
    };
    mockFetch(fetchResource);
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
      getLayer: () => ''
    };
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

  it('add baselayer which is baidu', async done => {
    const callback = async function(data) {
      await flushPromises();
      expect(data).not.toBeUndefined();
      done();
    };
    const viewModel = new WebMapViewModel(baseLayers['BAIDU']);
    viewModel.on({ notsupportbaidumap: callback });
  });

  it('add baselayer which is bing', async done => {
    const callback = async function(data) {
      await flushPromises();
      expect(data).not.toBeUndefined();
      done();
    };
    const viewModel = new WebMapViewModel(baseLayers['BING']);
    viewModel.on({ addlayerssucceeded: callback });
  });

  it('add wmsLayer with correct url and version is 1.0.0', async done => {
    const fetchResource = {
      'http://support.supermap.com.cn:8090/iserver/services/map-world/wms130/%E4%B8%96%E7%95%8C%E5%9C%B0%E5%9B%BE_Day?REQUEST=GetCapabilities&SERVICE=WMS': wmsCapabilitiesText
    };
    mockFetch(fetchResource);
    const callback = async function(data) {
      await flushPromises();
      expect(data).not.toBeUndefined();
      done();
    };
    const viewModel = new WebMapViewModel({...wmsLayer, layers: [{ ...wmsLayer.layers[0], url: 'http://support.supermap.com.cn:8090/iserver/services/map-world/wms130/%E4%B8%96%E7%95%8C%E5%9C%B0%E5%9B%BE_Day?MAP=%E4%B8%96%E7%95%8C%E5%9C%B0%E5%9B%BE_Day&'}]});
    viewModel.on({ addlayerssucceeded: callback });
  });

  it('add wmsLayer with correct url and version is 1.3.0', async done => {
    const fetchResource = {
      'http://support.supermap.com.cn:8090/iserver/services/map-world/wms130/%E4%B8%96%E7%95%8C%E5%9C%B0%E5%9B%BE_Day?REQUEST=GetCapabilities&SERVICE=WMS': wmsCapabilitiesTextWith130
    };
    mockFetch(fetchResource);
    const callback = async function(data) {
      await flushPromises();
      expect(data).not.toBeUndefined();
      done();
    };
    const viewModel = new WebMapViewModel({...wmsLayer, layers: [{ ...wmsLayer.layers[0], url: 'http://support.supermap.com.cn:8090/iserver/services/map-world/wms130/%E4%B8%96%E7%95%8C%E5%9C%B0%E5%9B%BE_Day?MAP=%E4%B8%96%E7%95%8C%E5%9C%B0%E5%9B%BE_Day&'}]});
    viewModel.on({ addlayerssucceeded: callback });
  });

  it('add wmtsLayer with correct url', async done => {
    const fetchResource = {
      'http://support.supermap.com.cn:8090/iserver/services/map-china400/wmts100?REQUEST=GetCapabilities&SERVICE=WMTS&VERSION=1.0.0': wmtsCapabilitiesText
    };
    mockFetch(fetchResource);
    const callback = async function(data) {
      await flushPromises();
      expect(data).not.toBeUndefined();
      expect(viewModel.getSourceListModel).not.toBeNull();
      done();
    };
    const viewModel = new WebMapViewModel(wmtsLayer, commonOption, { fadeDuration: 300 });
    viewModel.on({ addlayerssucceeded: callback });
  });

  it('add wmtsLayer with error url', async done => {
    const callback = async function(data) {
      await flushPromises();
      expect(data).not.toBeUndefined();
      done();
    };
    const viewModel = new WebMapViewModel({...wmtsLayer, layers: [{...wmtsLayer.layers[0], url: '/iserver/services/map-china400/wmts100'}]});
    viewModel.on({ getmapinfofailed: callback });
  });

  it('test layer autorefresh and visblescale', async done => {
    const callback = async function(data) {
      jest.advanceTimersByTime(3000);
      await flushPromises();
      expect(data).not.toBeUndefined();
      done();
    };
    const viewModel = new WebMapViewModel(restmapLayer);
    jest.useFakeTimers();
    viewModel.on({ addlayerssucceeded: callback });
    jest.useRealTimers();
  });

  it('different projection', async done => {
    const callback = async function(data) {
      await flushPromises();
      expect(data).not.toBeUndefined();
      done();
    };
    const map = {
      ...commonMap,
      getCRS: () => {
        return {
          epsgCode: 'EPSG:4326',
          getExtent: () => jest.fn()
        };
      }
    };
    const viewModel = new WebMapViewModel(restmapLayer, commonOption, {}, map);
    viewModel.on({ projectionIsNotMatch: callback });
  });
});
