import WebMapViewModel from '../WebMapViewModel.ts';
import flushPromises from 'flush-promises';
import iportal_serviceProxy from 'vue-iclient/test/unit/mocks/data/iportal_serviceProxy.json';
import layerData_CSV from 'vue-iclient/test/unit/mocks/data/layerData.json';
import layerData_geojson from 'vue-iclient/test/unit/mocks/data/layerData_geojson.json';
import uniqueLayer_polygon from 'vue-iclient/test/unit/mocks/data/WebMap/uniqueLayer_polygon.json';
import uniqueLayer_point from 'vue-iclient/test/unit/mocks/data/WebMap/uniqueLayer_multi_points.json';
import vectorLayer_point from 'vue-iclient/test/unit/mocks/data/WebMap/vectorLayer_point.json';
import vectorLayer_line from 'vue-iclient/test/unit/mocks/data/WebMap/vectorLayer_line.json';
import tileLayer from 'vue-iclient/test/unit/mocks/data/WebMap/tileLayer.json';
import mapJson from 'vue-iclient/test/unit/mocks/data/WebMap/map.json';
import styleJson from 'vue-iclient/test/unit/mocks/data/WebMap/styleJson.json';
import vectorLayer_polygon from 'vue-iclient/test/unit/mocks/data//WebMap/vectorLayer_polygon.json';
import rangeLayer from 'vue-iclient/test/unit/mocks/data//WebMap/rangeLayer.json';
import heatLayer from 'vue-iclient/test/unit/mocks/data//WebMap/heatLayer.json';
import markerLayer from 'vue-iclient/test/unit/mocks/data//WebMap/markerLayer.json';
import migrationLayer from 'vue-iclient/test/unit/mocks/data//WebMap/migrationLayer.json';
import ranksymbolLayer from 'vue-iclient/test/unit/mocks/data//WebMap/ranksymbolLayer.json';
import baseLayers from 'vue-iclient/test/unit/mocks/data/WebMap/baseLayers.json';
import wmsLayer from 'vue-iclient/test/unit/mocks/data/WebMap/wmsLayer.json';
import wmtsLayer from 'vue-iclient/test/unit/mocks/data/WebMap/wmtsLayer.json';
import raster4490 from 'vue-iclient/test/unit/mocks/data/WebMap/raster4490.json';
import {
  wmtsCapabilitiesText,
  wmsCapabilitiesTextWithoutVersion,
  wmsCapabilitiesTextWith130,
  wmsCapabilitiesText
} from 'vue-iclient/test/unit/mocks/data/CapabilitiesText.js';
import restmapLayer from 'vue-iclient/test/unit/mocks/data/WebMap/restmapLayer.json';
import dataflowLayer from 'vue-iclient/test/unit/mocks/data/WebMap/dataflowLayer.json';
import webmap3Datas from 'vue-iclient/test/unit/mocks/data/WebMap/webmap3.json';
import dataflowLayerData from 'vue-iclient/test/unit/mocks/data/dataflowLayerData.json';
import mockFetch from 'vue-iclient/test/unit/mocks/FetchRequest';
import { webmap_MAPBOXSTYLE_Tile } from 'vue-iclient/test/unit/mocks/services';

const CRS = require('vue-iclient/test/unit/mocks/crs');

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
let layerIdMapList = {};
let sourceIdMapList = {};
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
    let layers = [];
    if (layerIdMapList) {
      for (const key in layerIdMapList) {
        layers.push(layerIdMapList[key]);
      }
    }
    return {
      sources: sourceIdMapList,
      layers
    };
  },
  addSource: (sourceId, sourceInfo) => {
    sourceIdMapList[sourceId] = sourceInfo;
    if (sourceInfo.type === 'geojson') {
      sourceIdMapList[sourceId]._data = sourceInfo.data;
      sourceIdMapList[sourceId].setData = (function (sourceId) {
        return function (data) {
          sourceIdMapList[sourceId]._data = data;
        };
      })(sourceId);
    }
    if (sourceInfo.type === 'raster' && sourceInfo.rasterSource === 'iserver') {
      sourceIdMapList[sourceId].clearTiles = () => jest.fn();
      sourceIdMapList[sourceId].update = () => jest.fn();
    }
  },
  getSource: sourceId => {
    return sourceIdMapList[sourceId];
  },
  removeSource: sourceId => {
    delete sourceIdMapList[sourceId];
  },
  triggerRepaint: () => jest.fn(),
  style: {
    sourceCaches: sourceIdMapList
  },
  getLayer: layerId => {
    return layerIdMapList[layerId];
  },
  removeLayer: layerId => {
    delete layerIdMapList[layerId];
  },
  getCRS: () => {
    return {
      epsgCode: 'EPSG:3857',
      getExtent: () => jest.fn()
    };
  },
  getAppreciableLayers: () => {
    return Object.values(layerIdMapList);
  },
  addLayer: layerInfo => {
    layerIdMapList[layerInfo.id] = layerInfo;
    if (typeof layerInfo.source === 'object') {
      const source = Object.assign({}, layerInfo.source);
      layerIdMapList[layerInfo.id].source = layerInfo.id;
      commonMap.addSource(layerInfo.id, source);
    }
  },
  moveLayer: () => jest.fn(),
  overlayLayersManager: {},
  on: () => {},
  fire: () => {},
  setLayoutProperty: () => jest.fn(),
  setPaintProperty: jest.fn(),
  addStyle: () => jest.fn(),
  remove: () => jest.fn(),
  setRenderWorldCopies: () => jest.fn(),
  setStyle: () => jest.fn(),
  loadImage: function (src, callback) {
    callback(null, { width: 15 });
  },
  addImage: function () {},
  hasImage: function () {
    return false;
  }
};

window.canvg = {
  default: {
    from: (ctx, url, callback) => Promise.resolve({ stop: jest.fn(), start: jest.fn() })
  }
};
window.jsonsql.query = () => {
  return [{}];
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
    },
    style: {}
  };
};

document.getElementsByClassName = () => {
  return [
    {
      style: {
        left: 0,
        top: 0
      }
    }
  ];
};

describe('WebMapViewModel.spec', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setTimeout(30000);
  });
  afterEach(() => {
    sourceIdMapList = {};
    layerIdMapList = {};
    commonMap.style.sourceCaches = sourceIdMapList;
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('test baseLayer layers count maploaded', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': webmap_MAPBOXSTYLE_Tile,
      'https://fakeiportal.supermap.io/iserver/services/map-china400/restjsr/v1/vectortile/maps/China_4326/style.json':
        {
          version: 8,
          sources: {
            'raster-tiles': {
              type: 'raster',
              tiles: [
                'http://fakeiportal.supermap.io/iserver/services/map-china400/rest/maps/China/zxyTileImage.png?z={z}&x={x}&y={y}'
              ],
              tileSize: 256
            }
          },
          layers: [
            {
              id: 'simple-tiles',
              type: 'raster',
              source: 'raster-tiles',
              minzoom: 0,
              maxzoom: 22
            }
          ]
        }
    };
    mockFetch(fetchResource);
    const viewModel = new WebMapViewModel(
      commonId,
      { ...commonOption },
      {
        style: {
          version: 8,
          sources: {},
          layers: []
        },
        center: [117.0514, 40.0387],
        zoom: 7,
        bearing: 0,
        pitch: 0,
        rasterTileSize: 256,
        preserveDrawingBuffer: true,
        container: 'map',
        tileSize: 256
      }
    );
    let addStyleSpy;
    viewModel.on({
      mapinitialized: data => {
        addStyleSpy = jest.spyOn(data.map, 'addStyle');
      },
      addlayerssucceeded: data => {
        expect(addStyleSpy).toHaveBeenCalledTimes(1);
        expect(viewModel.getAppreciableLayers().length).toBe(webmap_MAPBOXSTYLE_Tile.layers.length + 1);
        done();
      }
    });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });
  it('add uniqueLayer with id is num', done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_polygon,
      'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123':
        layerData_CSV,
      'https://fakeiportal.supermap.io/iportal/web/datas/144371940/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123':
        layerData_geojson['LINE_GEOJSON']
    };
    mockFetch(fetchResource);
    const viewModel = new WebMapViewModel(commonId, { ...commonOption }, undefined, { ...commonMap });
    const callback = function (data) {
      expect(viewModel.getAppreciableLayers().length).toBe(uniqueLayer_polygon.layers.length + 1);
      viewModel.getAppreciableLayers().forEach(item => {
        expect(item.renderLayers.length).toBeGreaterThanOrEqual(1);
      })
      expect(viewModel.map.getStyle().layers.find((item)=>{return item.type === 'fill'}).paint['fill-opacity']).toBe(1);
      expect(viewModel.map.getStyle().layers.find((item)=>{return item.type === 'fill'}).paint['fill-color'][3]).toBe('rgba(213, 62, 79, 0.9)');
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
  });

  it('add uniqueLayer point', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/676516522/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        layerData_CSV,
      'https://fakeiportal.supermap.io/iportal/web/datas/13136933/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        layerData_geojson['POINT_GEOJSON']
    };
    mockFetch(fetchResource);
    const id = {
      ...uniqueLayer_point,
      level: '',
      visibleExtent: [0, 1, 2, 3]
    };
    const callback = function (data) {
      expect(viewModel.map).not.toBeUndefined();
      expect(viewModel.map.options.bounds).not.toBeUndefined();
      expect(viewModel.getAppreciableLayers().length).toBe(id.layers.length + 1);
      done();
    };
    const viewModel = new WebMapViewModel(id, { ...commonOption });
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  describe('test custom wkt', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.useRealTimers();
    });
    const commonFetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/676516522/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        layerData_CSV,
      'https://fakeiportal.supermap.io/iportal/web/datas/13136933/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        layerData_geojson['POINT_GEOJSON']
    };
    it('request wkt info with EPSFG Prefix and test visibleExtend', async done => {
      const get = jest.spyOn(CRS, 'get');
      get.mockImplementationOnce(() => {
        return '';
      });
      const epsgeCode = 'EPSG:1000';
      const fetchResource = {
        ...commonFetchResource,
        'https://iserver.supermap.io/iserver/services/map-china400/rest/maps/ChinaDark/prjCoordSys.wkt': epsgeCode,
        'https://iserver.supermap.io/iserver/services/map-china400/rest/maps/ChinaDark.json': mapJson
      };
      mockFetch(fetchResource);
      const mapOptions = {
        ...commonMapOptions,
        bounds: undefined,
        interactive: true,
        minZoom: 22,
        maxZoom: 0
      };
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      new WebMapViewModel(uniqueLayer_point, { ...commonOption }, mapOptions, { ...commonMap });
      await flushPromises();
      expect(errorSpy.mock.calls).toEqual([]);
      done();
    });
    it('request wkt info and visibleExtend without EPSFG Prefix ', async done => {
      const epsgeCode =
        'PROJCS["Google Maps Global Mercator",GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.01745329251994328,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4326"]],PROJECTION["Mercator_2SP"],PARAMETER["standard_parallel_1",0],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",0],PARAMETER["false_easting",0],PARAMETER["false_northing",0],AXIS["Northing", "NORTH"],AXIS["Easting", "EAST"],UNIT["Meter",1],EXTENSION["PROJ4","+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs"],AUTHORITY["EPSG","900913"]]';
      mockFetch(commonFetchResource);
      const id = { ...uniqueLayer_point, projection: epsgeCode };
      const callback = function (data) {
        expect(viewModel.getAppreciableLayers().length).toBe(id.layers.length + 1);
        done();
      };
      const viewModel = new WebMapViewModel(id, { ...commonOption });
      viewModel.on({ addlayerssucceeded: callback });
      await flushPromises();
      jest.advanceTimersByTime(0);
    });
  });

  describe('multi-coordinate', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.useRealTimers();
    });
    const projection =
      'PROJCS["CGCS2000 / 3-degree Gauss-Kruger CM 117E", \r\n  GEOGCS["China Geodetic Coordinate System 2000", \r\n    DATUM["China 2000", \r\n      SPHEROID["CGCS2000", 6378137.0, 298.257222101, AUTHORITY["EPSG","1024"]], \r\n      AUTHORITY["EPSG","1043"]], \r\n    PRIMEM["Greenwich", 0.0, AUTHORITY["EPSG","8901"]], \r\n    UNIT["degree", 0.017453292519943295], \r\n    AXIS["lat", NORTH], \r\n    AXIS["lon", EAST], \r\n    AUTHORITY["EPSG","4490"]], \r\n  PROJECTION["Transverse_Mercator", AUTHORITY["EPSG","9807"]], \r\n  PARAMETER["central_meridian", 117.0], \r\n  PARAMETER["latitude_of_origin", 0.0], \r\n  PARAMETER["scale_factor", 1.0], \r\n  PARAMETER["false_easting", 500000.0], \r\n  PARAMETER["false_northing", 0.0], \r\n  UNIT["m", 1.0], \r\n  AXIS["Northing", NORTH], \r\n  AXIS["Easting", EAST], \r\n  AUTHORITY["EPSG","4548"]]';
    const wkt =
      'PROJCS["China_2000_3_DEGREE_GK_Zone_39N",GEOGCS["GCS_China_2000",DATUM["D_China_2000",SPHEROID["CGCS2000",6378137.0,298.257222101,AUTHORITY["EPSG","7044"]]],PRIMEM["Greenwich",0.0,AUTHORITY["EPSG","8901"]],UNIT["DEGREE",0.017453292519943295],AUTHORITY["EPSG","4490"]],PROJECTION["Transverse_Mercator",AUTHORITY["EPSG","9807"]],PARAMETER["False_Easting",500000.0],PARAMETER["False_Northing",0.0],PARAMETER["Central_Meridian",117.0],PARAMETER["Latitude_Of_Origin",0.0],PARAMETER["Scale_Factor",1.0],UNIT["METER",1.0],AUTHORITY["EPSG","4548"]]';
    const commonResource = {
      'http://fake/iserver/services/map-4548/rest/maps/ChinaqxAlberts_4548%40fl/prjCoordSys.wkt': wkt,
      'http://fake/iserver/services/map-4548/rest/maps/ChinaqxAlberts_4548%40fl.json': mapJson
    };
    const baseLayer = {
      baseLayer: {
        dataSource: {
          type: 'EXTERNAL',
          url: 'http://fake/iserver/services/map-4548new/restjsr/v1/vectortile/maps/ChinaqxAlberts_4548%40fl-new'
        },
        visible: true,
        name: 'ChinaqxAlberts_4548@fl',
        layerType: 'MAPBOXSTYLE'
      }
    };
    it('layerType is MAPBOXSTYLE and webInfo projection is not wkt and indexbounds is exist', async done => {
      const fetchResource = {
        ...commonResource,
        'http://fake/iserver/services/map-4548new/restjsr/v1/vectortile/maps/ChinaqxAlberts_4548%40fl-new/style.json': {
          ...styleJson,
          metadata: {
            indexbounds: [345754.3017317925, 2500241.087997996, 3374092.172217019, 5528578.958483222]
          }
        }
      };
      mockFetch(fetchResource);
      const get = jest.spyOn(CRS, 'get');
      get.mockImplementationOnce(() => {
        return '';
      });
      const id = { ...tileLayer, ...baseLayer, projection: projection };
      const viewModel = new WebMapViewModel(id, { ...commonOption });
      const callback = function (data) {
        expect(viewModel.getAppreciableLayers().length).toBe(Object.keys(styleJson.sources).length);
        done();
      };
      viewModel.on({ addlayerssucceeded: callback });
      await flushPromises();
      jest.advanceTimersByTime(0);
    });

    it('layerType is MAPBOXSTYLE and webInfo projection is wkt and indexbounds is not exist', async done => {
      const fetchResource = {
        ...commonResource,
        'http://fake/iserver/services/map-4548new/restjsr/v1/vectortile/maps/ChinaqxAlberts_4548%40fl-new/style.json':
          styleJson
      };
      mockFetch(fetchResource);
      const get = jest.spyOn(CRS, 'get');
      get.mockImplementationOnce(() => {
        return '';
      });
      const id = { ...tileLayer, ...baseLayer, projection: projection };
      const viewModel = new WebMapViewModel(id, { ...commonOption });
      const callback = function (data) {
        expect(viewModel.getAppreciableLayers().length).toBe(Object.keys(styleJson.sources).length);
        done();
      };
      viewModel.on({ addlayerssucceeded: callback });
      await flushPromises();
      jest.advanceTimersByTime(0);
    });

    it('layerType is Tile and webInfo projection is wkt', async done => {
      mockFetch(commonResource);
      const id = { ...tileLayer, projection: wkt };
      const get = jest.spyOn(CRS, 'get');
      get.mockImplementationOnce(() => {
        return '';
      });
      const viewModel = new WebMapViewModel(id, { ...commonOption });
      await flushPromises();
      done();
      const callback = function (data) {
        expect(viewModel.getAppreciableLayers().length).toBe(id.layers.length + 1);
        done();
      };
      viewModel.on({ addlayerssucceeded: callback });
    });
  });

  it('layerType is VECTOR and multi style points', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/1920557079/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        layerData_CSV,
      'https://fakeiportal.supermap.io/iportal/web/datas/13136933/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        layerData_geojson['POINT_GEOJSON']
    };
    mockFetch(fetchResource);
    const id = vectorLayer_point;
    const callback = function (data) {
      expect(viewModel.getAppreciableLayers().length).toBe(id.layers.length + 1);
      done();
    };
    const viewModel = new WebMapViewModel(id, { ...commonOption }, undefined, { ...commonMap });
    viewModel.on({ addlayerssucceeded: callback });
  });

  it('test getSource is empty', done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/1920557079/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        layerData_CSV
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
    const callback = function (data) {
      expect(viewModel.getAppreciableLayers().length).toBe(roadId.layers.length + 1);
      done();
    };
    const viewModel = new WebMapViewModel(roadId, { ...commonOption }, mapOptions, map);
    viewModel.on({ addlayerssucceeded: callback });
  });

  it('add vectorLayer_line subway and set dash style', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/1920557079/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        layerData_CSV
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
    const callback = async function (data) {
      await flushPromises();
      expect(viewModel.getAppreciableLayers().length).toBe(subwayId.layers.length + 1);
      done();
    };
    const viewModel = new WebMapViewModel(subwayId, { ...commonOption }, undefined, { ...commonMap });
    viewModel.on({ addlayerssucceeded: callback });
  });

  it('add vectorLayer_polygon', async done => {
    const id = vectorLayer_polygon;
    const viewModel = new WebMapViewModel(id, { ...commonOption });
    const callback = function (data) {
      expect(viewModel.getAppreciableLayers().length).toBe(id.layers.length);
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  // _initGraticuleLayer
  it('add rangeLayer', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/1171594968/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        layerData_CSV
    };
    mockFetch(fetchResource);
    const id = rangeLayer;
    const callback = function (data) {
      viewModel.setZoom(2);
      viewModel.map.getZoom = function () {
        return 2;
      };
      viewModel.map.fire('zoomend');
      viewModel.setZoom(5);
      viewModel.map.getZoom = function () {
        return 5;
      };
      viewModel.map.fire('zoomend');
      expect(data).not.toBeUndefined();
      done();
    };
    const viewModel = new WebMapViewModel(id, { ...commonOption });
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('add rangeLayer last end === fieldValue', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/1171594968/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        layerData_CSV
    };
    mockFetch(fetchResource);
    const id = rangeLayer;
    const viewModel = new WebMapViewModel(id, { ...commonOption });
    const callback = () => {
      const mockFun = jest.spyOn(viewModel._handler, '_addOverlayToMap');
      viewModel._handler.getRangeStyleGroup = () => {
        return [
          {
            style: {
              strokeWidth: 1,
              fillColor: '#ffc6c4',
              fillOpacity: 0.9,
              lineDash: 'solid',
              strokeColor: '#ffffff',
              type: 'POLYGON',
              strokeOpacity: 1
            },
            color: '#ffc6c4',
            start: 20000000000.98,
            end: 333333350000000000
          },
          {
            style: {
              strokeWidth: 1,
              fillColor: '#f4a3a8',
              fillOpacity: 0.9,
              lineDash: 'solid',
              strokeColor: '#ffffff',
              type: 'POLYGON',
              strokeOpacity: 1
            },
            color: '#f4a3a8',
            start: 333333350000000000,
            end: 666666680000000000
          },
          {
            style: {
              strokeWidth: 1,
              fillColor: '#e38191',
              fillOpacity: 0.9,
              lineDash: 'solid',
              strokeColor: '#ffffff',
              type: 'POLYGON',
              strokeOpacity: 1
            },
            color: '#e38191',
            start: 666666680000000000,
            end: 1000000010000000000
          },
          {
            style: {
              strokeWidth: 1,
              fillColor: '#cc607d',
              fillOpacity: 0.9,
              lineDash: 'solid',
              strokeColor: '#ffffff',
              type: 'POLYGON',
              strokeOpacity: 1
            },
            color: '#cc607d',
            start: 1000000010000000000,
            end: 1333333340000000000
          },
          {
            style: {
              strokeWidth: 1,
              fillColor: '#ad466c',
              fillOpacity: 0.9,
              lineDash: 'solid',
              strokeColor: '#ffffff',
              type: 'POLYGON',
              strokeOpacity: 1
            },
            color: '#ad466c',
            start: 1333333340000000000,
            end: 1666666670000000000
          },
          {
            style: {
              strokeWidth: 1,
              fillColor: '#8b3058',
              fillOpacity: 0.9,
              lineDash: 'solid',
              strokeColor: '#ffffff',
              type: 'POLYGON',
              strokeOpacity: 1
            },
            color: '#8b3058',
            start: 1666666670000000000,
            end: 2000000000000000000
          }
        ];
      };
      const layerInfo = {
        layerType: 'RANGE',
        visible: 'visible',
        themeSetting: {
          themeField: 'TAX',
          customSettings: {},
          segmentMethod: 'offset',
          segmentCount: 6,
          colors: ['#ffc6c4', '#f4a3a8', '#e38191', '#cc607d', '#ad466c', '#8b3058', '#672044']
        },
        name: 'DataSource:DEMARCACION_TERRITORIAL_Tax',
        featureType: 'POLYGON',
        style: {
          strokeWidth: 1,
          fillColor: '#8b3058',
          fillOpacity: 0.9,
          lineDash: 'solid',
          strokeColor: '#ffffff',
          type: 'POLYGON',
          strokeOpacity: 1
        },
        projection: 'EPSG:4326',
        enableFields: ['TAX'],
        dataSource: {
          type: 'REST_DATA',
          url: 'http://test:8090/iserver/services/data-JSON_test/rest/data',
          dataSourceName: 'DataSource:DEMARCACION_TERRITORIAL_Tax'
        },
        layerID: 'DataSource:DEMARCACION_TERRITORIAL_Tax'
      };
      const features = [
        {
          type: 'Feature',
          properties: {
            TAX: '2.0E18',
            index: '0'
          },
          geometry: {
            type: 'MultiPolygon'
          },
          id: 1
        },
        {
          type: 'Feature',
          properties: {
            TAX: '2.00000000000098E12',
            index: '1'
          },
          geometry: {
            type: 'MultiPolygon'
          },
          id: 2
        },
        {
          type: 'Feature',
          properties: {
            TAX: '2.000000000098E10',
            index: '2'
          },
          geometry: {
            type: 'MultiPolygon'
          },
          id: 3
        },
        {
          type: 'Feature',
          properties: {
            TAX: '2.000000000098E10',
            index: '3'
          },
          geometry: {
            type: 'MultiPolygon'
          },
          id: 4
        },
        {
          type: 'Feature',
          properties: {
            TAX: '2.000000000098E10',
            index: '4'
          },
          geometry: {
            type: 'MultiPolygon'
          },
          id: 5
        },
        {
          type: 'Feature',
          properties: {
            TAX: '2.000000000098E10',
            index: '5'
          },
          geometry: {
            type: 'MultiPolygon'
          },
          id: 6
        },
        {
          type: 'Feature',
          properties: {
            TAX: '2.000000000098E10',
            index: '6'
          },
          geometry: {
            type: 'MultiPolygon'
          },
          id: 7
        },
        {
          type: 'Feature',
          properties: {
            TAX: '2.000000000098E10',
            index: '7'
          },
          geometry: {
            type: 'MultiPolygon'
          },
          id: 8
        },
        {
          type: 'Feature',
          properties: {
            TAX: '2.000000000098E10',
            index: '8'
          },
          geometry: {
            type: 'MultiPolygon'
          },
          id: 9
        },
        {
          type: 'Feature',
          properties: {
            TAX: '2.000000000098E10',
            index: '9'
          },
          geometry: {
            type: 'MultiPolygon'
          },
          id: 10
        },
        {
          type: 'Feature',
          properties: {
            TAX: '2.000000000098E10',
            index: '10'
          },
          geometry: {
            type: 'MultiPolygon'
          },
          id: 11
        },
        {
          type: 'Feature',
          properties: {
            TAX: '2.000000000098E10',
            index: '11'
          },
          geometry: {
            type: 'MultiPolygon'
          },
          id: 12
        },
        {
          type: 'Feature',
          properties: {
            TAX: '2.000000000098E10',
            index: '12'
          },
          geometry: {
            type: 'MultiPolygon'
          },
          id: 13
        },
        {
          type: 'Feature',
          properties: {
            TAX: '2.000000000098E10',
            index: '13'
          },
          geometry: {
            type: 'MultiPolygon'
          },
          id: 14
        },
        {
          type: 'Feature',
          properties: {
            TAX: '2.000000000098E10',
            index: '14'
          },
          geometry: {
            type: 'MultiPolygon'
          },
          id: 15
        },
        {
          type: 'Feature',
          properties: {
            TAX: '2.000000000098E10',
            index: '15'
          },
          geometry: {
            type: 'MultiPolygon'
          },
          id: 16
        }
      ];
      viewModel._handler._createRangeLayer(layerInfo, features);
      expect(mockFun.mock.calls[0][3].style['fill-color'].length).toEqual(35);
      done();
    }
    viewModel.on({ mapinitialized: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('add heatLayer', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/1920557079/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        layerData_CSV
    };
    mockFetch(fetchResource);
    const id = heatLayer;
    const viewModel = new WebMapViewModel(id, { ...commonOption });
    const callback = function (data) {
      expect(viewModel.getAppreciableLayers().length).toBe(id.layers.length + 1);
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('add markerLayer correctly', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/123456/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        layerData_geojson['MARKER_GEOJSON']
    };
    mockFetch(fetchResource);
    const id = markerLayer;
    const viewModel = new WebMapViewModel(id, { ...commonOption });
    const callback = function (data) {
      expect(viewModel.getAppreciableLayers().length).toBeGreaterThan(id.layers.length + 1);
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('add markerLayer layerOrder correctly', done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/123456/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        layerData_geojson['MARKER_GEOJSON']
    };
    mockFetch(fetchResource);
    const id = markerLayer;
    const viewModel = new WebMapViewModel(id, { ...commonOption }, { ...commonMapOptions }, { ...commonMap });
    const callback = function (data) {
      expect(viewModel.getAppreciableLayers().length).toBe(id.layers.length + 1);
      const layers = data.map.getStyle().layers;
      expect(layers[layers.length - 2].id).toBe('民航数-TEXT-7');
      expect(layers[layers.length - 1].type).toBe('circle');
      expect(layers[layers.length - 1].paint['circle-color']).toBe('#de2b41');
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
  });

  it('markerLayer url is error', async done => {
    const newLayerData_geojson = {
      ...layerData_geojson['MARKER_GEOJSON'],
      content:
        '{"type":"FeatureCollection","crs":{"type":"name","properties":{"name":"urn:ogc:def:crs:OGC:1.3:CRS84"}},"features":[{"type":"Feature","properties":{"dataViz_title":"","dataViz_description":"","dataViz_imgUrl":"","dataViz_url":"","dataViz_videoUrl":""},"dv_v5_markerStyle":{"fillColor":"#FFF","fillOpacity":"0.6","strokeColor":"#fff","strokeOpacity":"0,6","strokeWidth":"400","src":"apps/dataviz/static/imgs/markers/mark_red.svg","scale":1,"anchor":[0.5,0.5],"imgWidth":48,"imgHeight":43},"dv_v5_markerInfo":{"dataViz_title":"","dataViz_description":"","dataViz_imgUrl":"","dataViz_url":"","dataViz_videoUrl":""},"geometry":{"type":"Point","coordinates":[103.59008789062496,30.31598771855792]}}]}'
    };
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/123456/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        newLayerData_geojson
    };
    mockFetch(fetchResource);
    const id = markerLayer;
    const viewModel = new WebMapViewModel(id, { ...commonOption });
    const callback = function (data) {
      expect(viewModel.getAppreciableLayers().length).toBe(id.layers.length + 1);
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('add migrationLayer', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/516597759/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        layerData_CSV
    };
    mockFetch(fetchResource);
    const id = migrationLayer;
    const viewModel = new WebMapViewModel(id, { ...commonOption });
    const callback = function (data) {
      expect(viewModel.getAppreciableLayers().length).toBeGreaterThanOrEqual(data.layers.length);
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('add ranksymbolLayer', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/676516522/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        layerData_CSV
    };
    mockFetch(fetchResource);
    const id = ranksymbolLayer;
    const viewModel = new WebMapViewModel(id, { ...commonOption });
    const callback = function (data) {
      expect(viewModel.getAppreciableLayers().length).toBe(id.layers.length + 1);
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('add dataflow and update', done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/676516522/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        layerData_CSV,
      'https://fakeiserver.supermap.io/iserver/services/dataflowTest/dataflow.json?token=FjOwvGbO9L1MOpV22Bx12_UNy5uVuEXoxoRQe_UyKJtvKQ0fyCZoeGMlq5IVDbLDvhxzu3w8_DawMHFC9kOeGA..':
        dataflowLayerData.dataflow,
      'https://fakeiserver.supermap.io/iserver/services/dataflowTest/dataflow/broadcast?token=FjOwvGbO9L1MOpV22Bx12_UNy5uVuEXoxoRQe_UyKJtvKQ0fyCZoeGMlq5IVDbLDvhxzu3w8_DawMHFC9kOeGA..':
        dataflowLayerData.broadcast,
      'https://fakeiserver.supermap.io/iserver/services/dataflowTest/dataflow/subscribe?token=FjOwvGbO9L1MOpV22Bx12_UNy5uVuEXoxoRQe_UyKJtvKQ0fyCZoeGMlq5IVDbLDvhxzu3w8_DawMHFC9kOeGA..':
        dataflowLayerData.subscribe
    };
    mockFetch(fetchResource);
    const viewModel = new WebMapViewModel(dataflowLayer, { ...commonOption }, undefined, { ...commonMap });
    const callback = function (data) {
      expect(viewModel.getAppreciableLayers().length).toBeGreaterThanOrEqual(data.layers.length);
      viewModel.updateOverlayLayer({ ...dataflowLayer.layers[0], id: dataflowLayer.layers[0].name } );
      expect(() => {
        viewModel.updateOverlayLayer({ ...dataflowLayer.layers[0], id: dataflowLayer.layers[0].name } );
      }).not.toThrow();
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
  });

  // public Func
  describe('resize', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.useRealTimers();
    });
    it('resize normal', async done => {
      const fetchResource = {
        'https://fakeiportal.supermap.io/iportal/web/datas/516597759/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
          layerData_CSV
      };
      mockFetch(fetchResource);
      const id = migrationLayer;
      const viewModel = new WebMapViewModel(id, { ...commonOption });
      viewModel.on({
        mapinitialized: () => {
          const spy = jest.spyOn(viewModel._handler, 'echartsLayerResize');
          viewModel.resize();
          expect(spy).toBeCalled();
          done();
        }
      });
      await flushPromises();
      jest.advanceTimersByTime(0);
      done();
    });

    it('resize keepbounds', done => {
      const fetchResource = {
        'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
        'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_polygon,
        'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123':
          layerData_CSV,
        'https://fakeiportal.supermap.io/iportal/web/datas/144371940/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123':
          layerData_geojson['LINE_GEOJSON']
      };
      mockFetch(fetchResource);
      const viewModel = new WebMapViewModel(commonId, { ...commonOption }, { ...commonMapOptions }, { ...commonMap });
      viewModel.on({
        addlayerssucceeded: () => {
          const spy = jest.spyOn(viewModel.map, 'setZoom');
          viewModel.resize(true);
          expect(spy).toBeCalled();
          done();
        }
      });
    });
  });

  describe('setCrs', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.useRealTimers();
    });
    beforeEach(() => {
      const fetchResource = {
        'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
        'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_polygon,
        'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123':
          layerData_CSV,
        'https://fakeiportal.supermap.io/iportal/web/datas/144371940/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123':
          layerData_geojson['LINE_GEOJSON']
      };
      mockFetch(fetchResource);
    });

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
    it('take epsgcode', async done => {
      const crsWithEpsgcode = {
        ...crs,
        epsgCode: 'EPSG:4326'
      };
      const viewModel = new WebMapViewModel(commonId, { ...commonOption }, { ...commonMapOptions }, { ...commonMap });
      viewModel.on({
        mapinitialized: () => {
          const spy = jest.spyOn(viewModel.map, 'setCRS');
          expect(viewModel.mapOptions.crs).toBeUndefined();
          viewModel.setCrs(crsWithEpsgcode);
          expect(viewModel.mapOptions.crs).not.toBeUndefined();
          expect(spy).toBeCalled();
          done();
        }
      });
      await flushPromises();
      jest.advanceTimersByTime(0);
      done();
    });

    it('do not take epsgcode', async done => {
      const viewModel = new WebMapViewModel(commonId, { ...commonOption }, { ...commonMapOptions }, { ...commonMap });
      const spy = jest.spyOn(viewModel.map, 'setCRS');
      await flushPromises();
      expect(viewModel.mapOptions.crs).toBeUndefined();
      viewModel.setCrs(crs);
      expect(viewModel.mapOptions.crs).toEqual(crs);
      expect(spy).toBeCalled();
      done();
    });
  });

  describe('setCenter', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.advanceTimersByTime(0);
    });
    afterEach(() => {
      jest.useRealTimers();
    });
    beforeEach(() => {
      const fetchResource = {
        'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
        'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_polygon,
        'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123':
          layerData_CSV,
        'https://fakeiportal.supermap.io/iportal/web/datas/144371940/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123':
          layerData_geojson['LINE_GEOJSON']
      };
      mockFetch(fetchResource);
    });
    it('set invalid data', async done => {
      const center = [];
      const viewModel = new WebMapViewModel(commonId, { ...commonOption }, { ...commonMapOptions }, { ...commonMap });
      await flushPromises();
      jest.advanceTimersByTime(0);
      const spy = jest.spyOn(viewModel.map, 'getCenter');
      expect(spy).not.toBeCalled();
      viewModel.setCenter(center);
      expect(spy).not.toBeCalled();
      done();
    });

    it('set valid data', async done => {
      const center = [1, 1];
      const viewModel = new WebMapViewModel(commonId, { ...commonOption }, { ...commonMapOptions }, { ...commonMap });
      await flushPromises();
      jest.advanceTimersByTime(0);
      const spy = jest.spyOn(viewModel.map, 'setCenter');
      expect(spy).not.toBeCalled();
      viewModel.setCenter(center);
      expect(spy).toBeCalled();
      done();
    });
  });

  it('setRenderWorldCopies', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_polygon,
      'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123':
        layerData_CSV,
      'https://fakeiportal.supermap.io/iportal/web/datas/144371940/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123':
        layerData_geojson['LINE_GEOJSON']
    };
    mockFetch(fetchResource);
    const renderWorldCopies = true;
    const viewModel = new WebMapViewModel(commonId, { ...commonOption }, { ...commonMapOptions }, { ...commonMap });
    await flushPromises();
    jest.advanceTimersByTime(0);
    const spy = jest.spyOn(viewModel.map, 'setRenderWorldCopies');
    expect(spy).not.toBeCalled();
    viewModel.setRenderWorldCopies(renderWorldCopies);
    expect(spy).toBeCalled();
    done();
  });

  it('setBearing', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_polygon,
      'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123':
        layerData_CSV,
      'https://fakeiportal.supermap.io/iportal/web/datas/144371940/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123':
        layerData_geojson['LINE_GEOJSON']
    };
    mockFetch(fetchResource);
    const bearing = 0;
    const viewModel = new WebMapViewModel(commonId, { ...commonOption }, { ...commonMapOptions }, { ...commonMap });
    await flushPromises();
    jest.advanceTimersByTime(0);
    const spy = jest.spyOn(viewModel.map, 'setBearing');
    expect(viewModel.mapOptions.bearing).toBeUndefined();
    viewModel.setBearing();
    expect(viewModel.mapOptions.bearing).toBeUndefined();
    expect(spy).not.toBeCalled();
    viewModel.setBearing(bearing);
    expect(viewModel.mapOptions.bearing).not.toBeUndefined();
    expect(spy).toBeCalled();
    done();
  });

  it('setPitch', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_polygon,
      'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123':
        layerData_CSV,
      'https://fakeiportal.supermap.io/iportal/web/datas/144371940/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123':
        layerData_geojson['LINE_GEOJSON']
    };
    mockFetch(fetchResource);
    const pitch = 0;
    const viewModel = new WebMapViewModel(commonId, { ...commonOption }, { ...commonMapOptions }, { ...commonMap });
    await flushPromises();
    jest.advanceTimersByTime(0);
    const spy = jest.spyOn(viewModel.map, 'setPitch');
    expect(viewModel.mapOptions.pitch).toBeUndefined();
    viewModel.setPitch();
    expect(spy).not.toBeCalled();
    viewModel.setPitch(pitch);
    expect(viewModel.mapOptions.pitch).not.toBeUndefined();
    expect(spy).toBeCalled();
    done();
  });

  it('setStyle', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_polygon,
      'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123':
        layerData_CSV,
      'https://fakeiportal.supermap.io/iportal/web/datas/144371940/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123':
        layerData_geojson['LINE_GEOJSON']
    };
    mockFetch(fetchResource);
    const style = {
      layers: ['test'],
      color: '#fff'
    };
    const viewModel = new WebMapViewModel(commonId, { ...commonOption }, { ...commonMapOptions }, { ...commonMap });
    await flushPromises();
    jest.advanceTimersByTime(0);
    const spy = jest.spyOn(viewModel, '_initWebMap');
    viewModel.on({
      addlayerssucceeded: e => {
        expect(e.map).not.toBeNull();
        done();
      }
    });
    viewModel.setMapId('');
    viewModel.setStyle(style);
    await flushPromises();
    jest.advanceTimersByTime(0);
    expect(spy).toBeCalled();
    expect(viewModel.mapOptions.style).toEqual(style);
  });

  it('setRasterTileSize', done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_polygon,
      'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123':
        layerData_CSV,
      'https://fakeiportal.supermap.io/iportal/web/datas/144371940/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123':
        layerData_geojson['LINE_GEOJSON']
    };
    mockFetch(fetchResource);
    const viewModel = new WebMapViewModel(commonId, { ...commonOption }, { ...commonMapOptions }, { ...commonMap });
    viewModel.on({
      addlayerssucceeded: () => {
        const spy = jest.spyOn(viewModel._handler, '_updateRasterSource');
        viewModel.setRasterTileSize(-1);
        expect(spy).not.toBeCalled();
        viewModel.setRasterTileSize(2);
        expect(spy).toBeCalled();
        done();
      }
    });
  });

  it('setLayersVisible', done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_polygon,
      'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123':
        layerData_CSV,
      'https://fakeiportal.supermap.io/iportal/web/datas/144371940/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123':
        layerData_geojson['LINE_GEOJSON']
    };
    mockFetch(fetchResource);
    const viewModel = new WebMapViewModel(commonId, { ...commonOption }, { ...commonMapOptions }, { ...commonMap });
    const callback = function (data) {
      const appreciableLayers = viewModel.getAppreciableLayers();
      const renderLayersLen = appreciableLayers.reduce((sum, item) => {
        return sum + item.renderLayers.length;
      }, 0);
      expect(appreciableLayers.length).toBe(uniqueLayer_polygon.layers.length + 1);
      expect(viewModel.cacheLayerIds.length).toBe(renderLayersLen);
      const isShow = false;
      const changeShow = true;
      const ignoreIds = ['China'];
      const spy1 = jest.spyOn(viewModel.map, 'setLayoutProperty');
      viewModel.setLayersVisible(isShow, ignoreIds);
      expect(spy1.mock.calls.length).toBe(renderLayersLen - 1);
      spy1.mockClear();
      const spy2 = jest.spyOn(viewModel.map, 'setLayoutProperty');
      viewModel.setLayersVisible(changeShow);
      expect(spy2.mock.calls.length).toBe(renderLayersLen);
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
  });

  it('cleanLayers', done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_polygon,
      'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123':
        layerData_CSV,
      'https://fakeiportal.supermap.io/iportal/web/datas/144371940/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123':
        layerData_geojson['LINE_GEOJSON']
    };
    mockFetch(fetchResource);
    const viewModel = new WebMapViewModel(commonId, { ...commonOption }, { ...commonMapOptions }, { ...commonMap });
    const callback = function (data) {
      expect(viewModel.getAppreciableLayers().length).toBe(uniqueLayer_polygon.layers.length + 1);
      expect(viewModel._cacheCleanLayers.length).not.toBe(0);
      viewModel.cleanLayers();
      expect(viewModel._cacheCleanLayers.length).toBe(0);
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
  });

  // 在 MD 调用
  it('updateOverlayLayer unique', done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_polygon,
      'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123':
        layerData_CSV,
      'https://fakeiportal.supermap.io/iportal/web/datas/144371940/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123':
        layerData_geojson['LINE_GEOJSON']
    };
    mockFetch(fetchResource);
    const viewModel = new WebMapViewModel(commonId, { ...commonOption }, { ...commonMapOptions }, { ...commonMap });
    const callback = function (data) {
      expect(viewModel.getAppreciableLayers().length).toBe(uniqueLayer_polygon.layers.length + 1);
      const layerInfo = { ...uniqueLayer_polygon.layers[0], id: uniqueLayer_polygon.layers[0].name };
      const features = [{
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [
            116.588918,
            40.07108,
          ],
        },
        properties: {
          latitude: "40.07108",
          longitude: "116.588918",
          altitude: "",
          geometry: "Point",
          "机场": "北京/首都",
          "X坐标": "116.588918",
          "Y坐标": "40.07108",
          "名次": "1",
          "2017旅客吞吐量（人次）": "95786296 ",
          "2016旅客吞吐量（人次）": "94393454 ",
          "同比增速%": "-1.5",
          "张家界": "94393454 ",
          index: "0",
        },
      }];
      const spy = jest.spyOn(viewModel._handler, '_initOverlayLayer');
      viewModel.updateOverlayLayer(layerInfo, features);
      expect(spy).toBeCalled();
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
  });

  it('add baselayer which is baidu', async done => {
    const callback = function (data) {
      expect(data).not.toBeUndefined();
      done();
    };
    const viewModel = new WebMapViewModel(baseLayers['BAIDU']);
    viewModel.on({ notsupportbaidumap: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('_getMapCenter 4490', async done => {
    const fetchResource = {
      'http://fake/fakeiportal/web/config/portal.json': iportal_serviceProxy,
      'http://fake/fakeiportal/web/maps/1791328696/map.json': raster4490
    };
    mockFetch(fetchResource);
    jest.useFakeTimers();
    const viewModel = new WebMapViewModel(
      '1791328696',
      {
        target: 'map',
        serverUrl: 'http://fake/fakeiportal',
        withCredentials: false
      },
      {
        style: {
          version: 8,
          sources: {},
          layers: []
        }
      }
    );
    viewModel.on({
      mapinitialized: () => {
        const center = viewModel.map.getCenter();
        expect(center.lat).toEqual(44);
        expect(center.lng).toEqual(129);
        done();
      }
    });
    await flushPromises();
    jest.advanceTimersByTime(120);
  });

  it('getFilterFeatures 2020年人口总数', async done => {
    jest.useFakeTimers();
    const fetchResource = {
      'http://fake/fakeiportal/web/config/portal.json': iportal_serviceProxy,
      'http://fake/fakeiportal/web/maps/test/map.json': raster4490
    };
    mockFetch(fetchResource);
    const viewModel = new WebMapViewModel(
      'test',
      {
        target: 'map',
        serverUrl: 'http://fake/fakeiportal',
        withCredentials: false
      },
      {
        style: {
          version: 8,
          sources: {},
          layers: []
        }
      }
    );

    viewModel.on({
      mapinitialized: () => {
        viewModel._handler._updateDataFlowFeature = jest.fn();
        viewModel._handler._handleDataflowFeatures(
          {
            filterCondition: '2020年人口总数>10',
            pointStyle: {
              "fillColor": "#ee4d5a",
              "strokeWidth": 1,
              "fillOpacity": 0.9,
              "radius": 8,
              "strokeColor": "#ffffff",
              "type": "BASIC_POINT",
              "strokeOpacity": 1
            },
            layerID: 'test-empty'
          },
          { data: JSON.stringify({ properties: { '2020年人口总数': 15 } }) }
        );
        const res = viewModel._handler.getFilterFeatures('2020年人口总数>10', [{ properties: { '2020年人口总数': 15 } }]);
        expect(res.length).toBe(1);
        const res1 = viewModel._handler.getFilterFeatures('气压传感器海拔高度（米）>2000', [
          { properties: { '气压传感器海拔高度（米）': 15 } }
        ]);
        expect(res1.length).toBe(1);
        done();
      }
    });
    await flushPromises();
    jest.advanceTimersByTime(120);
  });

  it('isvj-5215', async done => {
    const fetchResource = {
      'http://fake/fakeiportal/web/config/portal.json': iportal_serviceProxy,
      'http://fake/fakeiportal/web/maps/test/map.json': raster4490
    };
    mockFetch(fetchResource);
    const viewModel = new WebMapViewModel(
      'test',
      {
        target: 'map',
        serverUrl: 'http://fake/fakeiportal',
        withCredentials: false
      },
      {
        style: {
          version: 8,
          sources: {},
          layers: []
        }
      }
    );
    const parameters = {
      layerType: 'UNIQUE',
      visible: true,
      themeSetting: {
        themeField: 'UserID',
        customSettings: {
          0: {
            fillColor: '#D53E4F',
            strokeWidth: 1,
            offsetX: 0,
            offsetY: 0,
            fillOpacity: 0.9,
            type: 'BASIC_POINT',
            radius: 15,
            strokeColor: '#ffffff',
            strokeOpacity: 1
          },
          1: {
            fillColor: '#3288BD',
            strokeWidth: 1,
            offsetX: 0,
            offsetY: 0,
            fillOpacity: 0.9,
            type: 'BASIC_POINT',
            radius: 15,
            strokeColor: '#ffffff',
            strokeOpacity: 1
          },
          2: {
            fillColor: '#FC8D59',
            strokeWidth: 1,
            offsetX: 0,
            offsetY: 0,
            fillOpacity: 0.9,
            type: 'BASIC_POINT',
            radius: 15,
            strokeColor: '#ffffff',
            strokeOpacity: 1
          },
          3: {
            fillColor: '#99D594',
            strokeWidth: 1,
            offsetX: 0,
            offsetY: 0,
            fillOpacity: 0.9,
            type: 'BASIC_POINT',
            radius: 15,
            strokeColor: '#ffffff',
            strokeOpacity: 1
          },
          5: {
            fillColor: '#FEE08B',
            strokeWidth: 1,
            offsetX: 0,
            offsetY: 0,
            fillOpacity: 0.9,
            type: 'BASIC_POINT',
            radius: 15,
            strokeColor: '#ffffff',
            strokeOpacity: 1
          },
          8: {
            fillColor: '#E6F598',
            strokeWidth: 1,
            offsetX: 0,
            offsetY: 0,
            fillOpacity: 0.9,
            type: 'BASIC_POINT',
            radius: 15,
            strokeColor: '#ffffff',
            strokeOpacity: 1
          }
        },
        colors: ['#D53E4F', '#FC8D59', '#FEE08B', '#FFFFBF', '#E6F598', '#99D594', '#3288BD']
      },
      name: 'isvj-5215',
      featureType: 'POINT',
      labelStyle: {
        offsetX: 0,
        textBaseline: 'bottom',
        fontFamily: '黑体',
        offsetY: -19,
        outlineWidth: 0,
        textAlign: 'center',
        outlineColor: '#000000',
        fontSize: '14px',
        fill: '#333',
        backgroundFill: [255, 255, 255, 0.8],
        labelField: 'UserID'
      },
      style: {
        strokeWidth: 1,
        offsetX: 0,
        fillColor: '#E6F598',
        offsetY: 0,
        fillOpacity: 0.9,
        radius: 15,
        strokeColor: '#ffffff',
        type: 'BASIC_POINT',
        strokeOpacity: 1
      },
      projection: 'EPSG:4326',
      enableFields: ['UserID']
    };
    viewModel.on({
      mapinitialized: () => {
        viewModel._updateDataFlowFeature = jest.fn();
        const res = viewModel._handler.getUniqueStyleGroup(parameters, [
          { properties: { UserID: 30 } },
          { properties: { UserID: 0 } }
        ]);
        expect(res.length).toBe(2);
        done();
      }
    });
    await flushPromises();
    jest.advanceTimersByTime(120);
  });
  it('crs not support', async done => {
    const get = jest.spyOn(CRS, 'get');
    get.mockImplementation(() => {
      return '';
    });
    const viewModel = new WebMapViewModel(baseLayers['BAIDU']);
    const callback = ({ error }) => {
      expect(error.message).toBe('webmap.crsNotSupport');
      done();
    };
    viewModel.on({ getmapinfofailed: callback });
    await flushPromises();
  });

  it('add baselayer which is bing', async done => {
    jest.useFakeTimers();
    const callback = function (data) {
      expect(data).not.toBeUndefined();
      done();
    };
    const viewModel = new WebMapViewModel(baseLayers['BING']);
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('add baselayer which is goole_cn', async done => {
    jest.useFakeTimers();
    const callback = function (data) {
      expect(data).not.toBeUndefined();
      done();
    };
    const viewModel = new WebMapViewModel(baseLayers['GOOGLE']);
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('add wmsLayer with correct url and version is less than 1.3', async done => {
    const fetchResource = {
      'http://fake/iserver/services/map-world/wms130/%E4%B8%96%E7%95%8C%E5%9C%B0%E5%9B%BE_Day?REQUEST=GetCapabilities&SERVICE=WMS':
        wmsCapabilitiesText
    };
    mockFetch(fetchResource);
    const mapData = {
      ...wmsLayer,
      layers: [
        {
          ...wmsLayer.layers[0],
          url: 'http://fake/iserver/services/map-world/wms130/%E4%B8%96%E7%95%8C%E5%9C%B0%E5%9B%BE_Day'
        }
      ]
    };
    const viewModel = new WebMapViewModel(mapData);
    const callback = function (data) {
      expect(viewModel.getAppreciableLayers().length).toBe(mapData.layers.length + 1);
      expect(data).not.toBeUndefined();
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('add wmsLayer with correct url and version is 1.3.0', async done => {
    const fetchResource = {
      'http://fack/iserver/services/map-world/wms130/%E4%B8%96%E7%95%8C%E5%9C%B0%E5%9B%BE_Day?REQUEST=GetCapabilities&SERVICE=WMS':
        wmsCapabilitiesTextWith130
    };
    mockFetch(fetchResource);
    const callback = function (data) {
      expect(data).not.toBeUndefined();
      expect(data.map.getSource('世界地图_Day').tiles[0].indexOf('{bbox-wms-1.3.0}')).toBeGreaterThan(
        -1
      );
      done();
    };
    const viewModel = new WebMapViewModel({
      ...wmsLayer,
      projection: 'EPSG:4326',
      center: { x: 0, y: 0 },
      layers: [
        {
          ...wmsLayer.layers[0],
          url: 'http://fack/iserver/services/map-world/wms130/%E4%B8%96%E7%95%8C%E5%9C%B0%E5%9B%BE_Day?'
        }
      ]
    });
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('add wmtsLayer with correct url', async done => {
    const fetchResource = {
      'http://fack/iserver/services/map-china400/wmts100?REQUEST=GetCapabilities&SERVICE=WMTS&VERSION=1.0.0':
        wmtsCapabilitiesText
    };
    mockFetch(fetchResource);
    const viewModel = new WebMapViewModel(baseLayers['WMTS'], { ...commonOption });
    const callback = function (data) {
      expect(viewModel.getAppreciableLayers().length).toBe(baseLayers['WMTS'].layers.length + 1);
      expect(data).not.toBeUndefined();
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('add wmtsLayer with error url', async done => {
    const callback = function (data) {
      expect(data).not.toBeUndefined();
      done();
    };
    const viewModel = new WebMapViewModel({
      ...wmtsLayer,
      layers: [{ ...wmtsLayer.layers[0], url: '/iserver/services/map-china400/wmts100' }]
    });
    viewModel.on({ getmapinfofailed: callback });
    await flushPromises();
    jest.advanceTimersByTime(120);
  });

  describe('test layer autorefresh and visblescale', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.useRealTimers();
    });
    it('tile layer', async done => {
      const viewModel = new WebMapViewModel(
        restmapLayer,
        { ...commonOption, ignoreBaseProjection: true },
        { ...commonMapOptions },
        { ...commonMap }
      );
      await flushPromises();
      jest.advanceTimersByTime(1000);
      expect(viewModel._handler._layerTimerList.length).not.toBe(0);
      done();
    });
    it('other layer except tile layer', async done => {
      const viewModel = new WebMapViewModel(heatLayer, { ...commonOption }, { ...commonMapOptions }, { ...commonMap });
      await flushPromises();
      expect(viewModel._handler._layerTimerList.length).not.toBe(0);
      done();
    });
  });

  it('different projection', done => {
    const callback = function (data) {
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
    const viewModel = new WebMapViewModel(restmapLayer, { ...commonOption }, {}, map);
    viewModel.on({ projectionisnotmatch: callback });
  });

  describe('test transformRequest', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.useRealTimers();
    });
    const proxyStr = 'http://localhost:8080/iportal/apps/viewer/getUrlResource.png?url=';
    it('add online map', async done => {
      const viewModel = new WebMapViewModel(baseLayers['TILE'], {
        isSuperMapOnline: true,
        serverUrl: 'https://www.supermapol.com'
      });
      const {
        baseLayer: { url }
      } = baseLayers['TILE'];
      const mockTileUrl =
        `${url}/tileimage.png?scale=3.380327143205318e-9&x=1&y=0&width=256&height=256&transparent=true&redirect=false&cacheEnabled=true&origin=%7B%22x%22%3A-20037508.3427892%2C%22y%22%3A20037508.3427892%7D`.replace(
          'https://',
          'http://'
        );
      await flushPromises();
      jest.advanceTimersByTime(0);
      const transformed = viewModel.map.options.transformRequest(mockTileUrl, 'Tile');
      expect(transformed.url).toMatch('https://www.supermapol.com/apps/viewer/getUrlResource.png?url=');
      done();
    });
    it('add iportal map', async done => {
      const viewModel = new WebMapViewModel(baseLayers['BAIDU']);
      const mockTileUrl = '';
      await flushPromises();
      jest.advanceTimersByTime(0);
      const transformed = viewModel.map.options.transformRequest(mockTileUrl);
      expect(transformed.url).toBe(mockTileUrl);
      done();
    });

    describe('add internet map', () => {
      beforeEach(() => {
        jest.useFakeTimers();
        jest.advanceTimersByTime(0);
      });
      afterEach(() => {
        jest.useRealTimers();
      });
      const tiles = [
        'https://t0.tianditu.gov.cn/ter_w/wmts?tk=1d109683f4d84198e37a38c442d68311&service=WMTS&request=GetTile&version=1.0.0&style=default&tilematrixSet=w&format=tiles&width=256&height=256&layer=ter&tilematrix={z}&tilerow={y}&tilecol={x}',
        'https://t1.tianditu.gov.cn/ter_w/wmts?tk=1d109683f4d84198e37a38c442d68311&service=WMTS&request=GetTile&version=1.0.0&style=default&tilematrixSet=w&format=tiles&width=256&height=256&layer=ter&tilematrix={z}&tilerow={y}&tilecol={x}',
        'https://t2.tianditu.gov.cn/ter_w/wmts?tk=1d109683f4d84198e37a38c442d68311&service=WMTS&request=GetTile&version=1.0.0&style=default&tilematrixSet=w&format=tiles&width=256&height=256&layer=ter&tilematrix={z}&tilerow={y}&tilecol={x}',
        'https://t3.tianditu.gov.cn/ter_w/wmts?tk=1d109683f4d84198e37a38c442d68311&service=WMTS&request=GetTile&version=1.0.0&style=default&tilematrixSet=w&format=tiles&width=256&height=256&layer=ter&tilematrix={z}&tilerow={y}&tilecol={x}',
        'https://t4.tianditu.gov.cn/ter_w/wmts?tk=1d109683f4d84198e37a38c442d68311&service=WMTS&request=GetTile&version=1.0.0&style=default&tilematrixSet=w&format=tiles&width=256&height=256&layer=ter&tilematrix={z}&tilerow={y}&tilecol={x}',
        'https://t5.tianditu.gov.cn/ter_w/wmts?tk=1d109683f4d84198e37a38c442d68311&service=WMTS&request=GetTile&version=1.0.0&style=default&tilematrixSet=w&format=tiles&width=256&height=256&layer=ter&tilematrix={z}&tilerow={y}&tilecol={x}',
        'https://t6.tianditu.gov.cn/ter_w/wmts?tk=1d109683f4d84198e37a38c442d68311&service=WMTS&request=GetTile&version=1.0.0&style=default&tilematrixSet=w&format=tiles&width=256&height=256&layer=ter&tilematrix={z}&tilerow={y}&tilecol={x}',
        'https://t7.tianditu.gov.cn/ter_w/wmts?tk=1d109683f4d84198e37a38c442d68311&service=WMTS&request=GetTile&version=1.0.0&style=default&tilematrixSet=w&format=tiles&width=256&height=256&layer=ter&tilematrix={z}&tilerow={y}&tilecol={x}'
      ];
      const mapOptions = {
        style: {
          version: 8,
          sources: {
            baseLayer: {
              type: 'raster',
              tiles,
              tileSize: 256
            }
          },
          layers: [{ id: 'baseLayer', type: 'raster', source: 'baseLayer' }]
        },
        center: [107.7815, 39.9788],
        zoom: 5,
        renderWorldCopies: false,
        crs: {
          epsgCode: 'EPSG:3857'
        },
        minzoom: 0,
        maxzoom: 22
      };
      it('test fadeDuration', async done => {
        const viewModel = new WebMapViewModel('', { ...commonOption }, { ...mapOptions, fadeDuration: 300 });
        await flushPromises();
        expect(viewModel.map).not.toBeUndefined();
        done();
      });
      it('test transformRequest when proxy is string', async done => {
        const viewModel = new WebMapViewModel('', { ...commonOption, proxy: proxyStr }, { ...mapOptions });
        await flushPromises();
        const mockTileUrl = tiles[0].replace('{x}', 6).replace('{y}', 8).replace('{z}', 10);
        const transformed = viewModel._handler.mapOptions.transformRequest(mockTileUrl, 'Tile');
        expect(transformed.url).toMatch(proxyStr);
        done();
      });
      it('test transformRequest when proxy is false', async done => {
        const viewModel = new WebMapViewModel('', { ...commonOption }, { ...mapOptions });
        await flushPromises();
        const mockTileUrl = tiles[0].replace('{x}', 6).replace('{y}', 8).replace('{z}', 10);
        const transformed = viewModel._handler.mapOptions.transformRequest(mockTileUrl, 'Tile');
        expect(transformed.url).toBe(mockTileUrl);
        done();
      });
    });
  });
  it('layerFilter', async done => {
    const viewModel = new WebMapViewModel(vectorLayer_line, {}, undefined, null, function (layer) {
      return layer.name === '浙江省高等院校(3)';
    });
    const callback = function () {
      expect(viewModel.getAppreciableLayers().length).toBe(1);
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('check label layer repeat', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/676516522/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        layerData_CSV,
      'https://fakeiportal.supermap.io/iportal/web/datas/13136933/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        layerData_geojson['POINT_GEOJSON']
    };
    mockFetch(fetchResource);
    const id = {
      ...uniqueLayer_point,
      level: '',
      visibleExtent: [0, 1, 2, 3]
    };
    const callback = function () {
      expect(viewModel.getAppreciableLayers().length).toBe(id.layers.length + 1);
      expect(viewModel._handler).not.toBeUndefined();
      const spy = jest.spyOn(viewModel._handler, '_addLayer');
      viewModel._handler._addLabelLayer({ layerID: 'jiuzhaigou2' });
      expect(spy).not.toBeCalled();
      done();
    };
    const viewModel = new WebMapViewModel(id, { ...commonOption });
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('sourcelist overlayLayersManager and extra layers', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_polygon,
      'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123':
        layerData_CSV,
      'https://fakeiportal.supermap.io/iportal/web/datas/144371940/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123':
        layerData_geojson['LINE_GEOJSON']
    };
    mockFetch(fetchResource);
    const viewModel = new WebMapViewModel(commonId, { ...commonOption });
    const callback = function (data) {
      const appreciableLayers1 = viewModel.getAppreciableLayers();
      expect(appreciableLayers1.length).toBe(uniqueLayer_polygon.layers.length + 1);
      expect(appreciableLayers1.length).toBeGreaterThanOrEqual(data.layers.length);
      data.map.overlayLayersManager = {
        GraticuleLayer: {
          id: 'GraticuleLayer',
          overlay: true,
          sourceId: 'GraticuleLayer',
          visible: true
        },
        EchartLayer: {
          id: 'EchartLayer',
          visibility: 'visible',
          source: {
            type: 'geoJSON',
            data: null
          }
        },
        GraticuleLayer1: {
          id: 'GraticuleLayer',
          overlay: true,
          sourceId: 'GraticuleLayer'
        }
      };
      expect(data.map).toEqual(viewModel._handler.map);
      const appreciableLayers2 = viewModel.getAppreciableLayers();
      expect(appreciableLayers2.length).toBe(uniqueLayer_polygon.layers.length + 1 + 2);
      data.map.addLayer({
        paint: {},
        id: '北京市',
        source: {
          tiles: [
            'http://localhost:8190/iportal/services/../web/datas/435608982/structureddata/tiles/{z}/{x}/{y}.mvt?epsgCode=3857&returnedFieldNames=%5B%22smpid%22%2C%22parent%22%2C%22adcode%22%2C%22level%22%2C%22centroid%22%2C%22childrenNum%22%2C%22center%22%2C%22subFeatureIndex%22%2C%22name%22%2C%22acroutes%22%2C%22geometry%22%5D&geometryFieldName=geometry'
          ],
          bounds: [115.423411, 39.442758, 117.514583, 41.0608],
          type: 'vector'
        },
        'source-layer': '435608982$geometry',
        type: 'fill'
      })
      const appreciableLayers3 = viewModel.getAppreciableLayers();
      expect(appreciableLayers3.length).toBe(uniqueLayer_polygon.layers.length + 1 + 2 + 1);
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });
  it('layer order', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_polygon,
      'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123':
        layerData_CSV,
      'https://fakeiportal.supermap.io/iportal/web/datas/144371940/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123':
      layerData_geojson['LINE_GEOJSON']
    };
    const map = {
      ...commonMap,
      getStyle: () => {
        let layers = [];
        if (layerIdMapList) {
          for (const key in layerIdMapList) {
            layers.push(layerIdMapList[key]);
          }
        }
        // 模拟图层加载顺序
        const delayerLayerIds = ['市级行政区划_1_2', '市级行政区划_1_2-strokeLine'];
        delayerLayerIds.forEach(id => {
          const index = layers.findIndex(layer => layer.id === id);
          if (index !== -1) {
            const delayerLayer = layers.splice(index, 1)[0];
            layers.push(delayerLayer);
          }
        });
        return {
          sources: sourceIdMapList,
          layers
        };
      }
    };
    mockFetch(fetchResource);
    const viewModel = new WebMapViewModel(commonId, { ...commonOption }, {}, map);
    const callback = function (data) {
      const appreciableLayers = viewModel.getAppreciableLayers();
      expect(appreciableLayers[1].id).toBe('市级行政区划_1_2');
      expect(appreciableLayers[2].id).toBe('北京市轨道交通线路(2)');
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('webmap3.0', async done => {
    const fetchResource = {
      'https://localhost:8190/iportal/web/maps/249495311': webmap3Datas[1]
    };
    mockFetch(fetchResource);
    const viewModel = new WebMapViewModel(webmap3Datas[0]);
    const callback = function () {
      expect(viewModel.getAppreciableLayers().length).toBeLessThanOrEqual(webmap3Datas[0].layers.length + 1);
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });
});
