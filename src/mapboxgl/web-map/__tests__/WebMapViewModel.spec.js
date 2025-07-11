import WebMapViewModel from '../WebMapViewModel.ts';
import flushPromises from 'flush-promises';
import uniqueLayer_polygon from 'vue-iclient/test/unit/mocks/data/WebMap/uniqueLayer_polygon.json';
import uniqueLayer_point from 'vue-iclient/test/unit/mocks/data/WebMap/uniqueLayer_multi_points.json';
import vectorLayer_line from 'vue-iclient/test/unit/mocks/data/WebMap/vectorLayer_line.json';
import markerLayer from 'vue-iclient/test/unit/mocks/data//WebMap/markerLayer.json';
import migrationLayer from 'vue-iclient/test/unit/mocks/data//WebMap/migrationLayer.json';
import baseLayers from 'vue-iclient/test/unit/mocks/data/WebMap/baseLayers.json';
import wmtsLayer from 'vue-iclient/test/unit/mocks/data/WebMap/wmtsLayer.json';
import restmapLayer from 'vue-iclient/test/unit/mocks/data/WebMap/restmapLayer.json';
import webmap3Datas from 'vue-iclient/test/unit/mocks/data/WebMap/webmap3.json';
import mapEvent from 'vue-iclient/src/mapboxgl/_types/map-event';
import mapboxgl from '@libs/mapboxgl/mapbox-gl-enhance.js';
import mockFetch from 'vue-iclient/test/unit/mocks/FetchRequest';

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
  getZoom: () => {
    return 2;
  },
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
  on: () => { },
  off: () => { },
  fire: () => { },
  setLayoutProperty: () => jest.fn(),
  setPaintProperty: jest.fn(),
  addStyle: () => jest.fn(),
  remove: () => jest.fn(),
  setRenderWorldCopies: () => jest.fn(),
  setStyle: () => jest.fn(),
  loadImage: function (src, callback) {
    callback(null, { width: 15 });
  },
  addImage: function () { },
  hasImage: function () {
    return false;
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
    jest.spyOn(mapEvent.$options, 'getWebMap').mockImplementation(() => {
      return {
        getAppreciableLayers: () => {
          return Object.values(layerIdMapList);
        }
      };
    });
  });
  afterEach(() => {
    sourceIdMapList = {};
    layerIdMapList = {};
    commonMap.style.sourceCaches = sourceIdMapList;
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('add uniqueLayer point', async done => {
    const id = {
      ...uniqueLayer_point,
      level: '',
      visibleExtent: [0, 1, 2, 3]
    };
    const callback = function (data) {
      expect(data.map).not.toBeUndefined();
      done();
    };
    const viewModel = new WebMapViewModel(id, { ...commonOption });
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
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
      const id = migrationLayer;
      const viewModel = new WebMapViewModel(id, { ...commonOption });
      viewModel.on({
        mapinitialized: () => {
          const spy = jest.spyOn(viewModel._handler, 'resize');
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
      const viewModel = new WebMapViewModel(commonId, { ...commonOption, map: commonMap }, { ...commonMapOptions });
      viewModel.on({
        addlayerssucceeded: () => {
          const spy = jest.spyOn(viewModel._handler, 'resize');
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
      const viewModel = new WebMapViewModel(commonId, { ...commonOption, map: commonMap }, { ...commonMapOptions });
      viewModel.on({
        mapinitialized: () => {
          const spy = jest.spyOn(viewModel._handler, 'setCRS');
          viewModel.setCrs(crsWithEpsgcode);
          expect(spy).toBeCalled();
          expect(spy.mock.calls[0][0]).toEqual(crsWithEpsgcode);
          done();
        }
      });
      await flushPromises();
      jest.advanceTimersByTime(0);
      done();
    });

    it('do not take epsgcode', async done => {
      const viewModel = new WebMapViewModel(commonId, { ...commonOption, map: commonMap }, { ...commonMapOptions });
      await flushPromises();
      const spy = jest.spyOn(viewModel._handler, 'setCRS');
      viewModel.setCrs(crs);
      expect(spy).toBeCalled();
      expect(spy.mock.calls[0][0]).toEqual(crs);
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

    it('set valid data', async done => {
      const center = [1, 1];
      const viewModel = new WebMapViewModel(commonId, { ...commonOption, map: commonMap }, { ...commonMapOptions });
      await flushPromises();
      jest.advanceTimersByTime(0);
      const spy = jest.spyOn(viewModel._handler, 'setCenter');
      expect(spy).not.toBeCalled();
      viewModel.setCenter(center);
      expect(spy).toBeCalled();
      expect(spy.mock.calls[0][0]).toEqual(center);
      done();
    });
  });

  it('setRenderWorldCopies', async done => {
    const renderWorldCopies = true;
    const viewModel = new WebMapViewModel(commonId, { ...commonOption, map: commonMap }, { ...commonMapOptions });
    await flushPromises();
    jest.advanceTimersByTime(0);
    const spy = jest.spyOn(viewModel._handler, 'setRenderWorldCopies');
    expect(spy).not.toBeCalled();
    viewModel.setRenderWorldCopies(renderWorldCopies);
    expect(spy).toBeCalled();
    expect(spy.mock.calls[0][0]).toEqual(renderWorldCopies);
    done();
  });

  it('setBearing', async done => {
    const bearing = 0;
    const viewModel = new WebMapViewModel(commonId, { ...commonOption, map: commonMap }, { ...commonMapOptions });
    await flushPromises();
    jest.advanceTimersByTime(0);
    const spy = jest.spyOn(viewModel._handler, 'setBearing');
    viewModel.setBearing(bearing);
    expect(spy).toBeCalled();
    expect(spy.mock.calls[0][0]).toBe(bearing);
    done();
  });

  it('setPitch', async done => {
    const pitch = 0;
    const viewModel = new WebMapViewModel(commonId, { ...commonOption, map: commonMap }, { ...commonMapOptions });
    await flushPromises();
    jest.advanceTimersByTime(0);
    const spy = jest.spyOn(viewModel._handler, 'setPitch');
    viewModel.setPitch(pitch);
    expect(spy).toBeCalled();
    expect(spy.mock.calls[0][0]).toBe(pitch);
    done();
  });

  it('setStyle', async done => {
    const style = {
      layers: [{ id: 'test' }],
      color: '#fff'
    };
    const viewModel = new WebMapViewModel(commonId, { ...commonOption }, { ...commonMapOptions }, { ...commonMap });
    viewModel.on({
      addlayerssucceeded: e => {
        expect(e.map).not.toBeNull();
      }
    });
    await flushPromises();
    jest.advanceTimersByTime(0);
    viewModel.setMapId('');
    const spy1 = jest.spyOn(viewModel._handler, 'setStyle');
    viewModel.setStyle(style);
    await flushPromises();
    jest.advanceTimersByTime(0);
    expect(spy1).toBeCalled();
    expect(spy1.mock.calls[0][0]).toEqual(style);
    done();
  });

  it('setWithCredentials', async done => {
    const viewModel = new WebMapViewModel(commonId, { ...commonOption, map: commonMap }, { ...commonMapOptions });
    viewModel.on({
      addlayerssucceeded: () => {
        const spy = jest.spyOn(viewModel._handler, 'setWithCredentials');
        expect(viewModel.options.withCredentials).toBe(false);
        viewModel.setWithCredentials(true);
        expect(spy).toBeCalled();
        expect(viewModel.options.withCredentials).toBe(true);
        done();
      }
    });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('setProxy', async done => {
    const viewModel = new WebMapViewModel(commonId, { ...commonOption, map: commonMap }, { ...commonMapOptions });
    viewModel.on({
      addlayerssucceeded: () => {
        const spy = jest.spyOn(viewModel._handler, 'setProxy');
        viewModel.setProxy('http://fakeproxy');
        expect(spy).toBeCalled();
        done();
      }
    });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('setRasterTileSize', async done => {
    const viewModel = new WebMapViewModel(commonId, { ...commonOption, map: commonMap }, { ...commonMapOptions });
    viewModel.on({
      addlayerssucceeded: () => {
        const spy = jest.spyOn(viewModel._handler, 'setRasterTileSize');
        viewModel.setRasterTileSize(2);
        expect(spy).toBeCalled();
        done();
      }
    });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('setLayersVisible', async done => {
    const viewModel = new WebMapViewModel(commonId, { ...commonOption, map: commonMap }, { ...commonMapOptions });
    let map;
    const callback = async function (data) {
      const ignoreIds = ['China'];
      const spy = jest.spyOn(viewModel.map, 'getLayer');
      spy.mockReturnValue({ type: 'test' });
      const spy1 = jest.spyOn(viewModel.map, 'setLayoutProperty');
      viewModel.setLayersVisible(false, ignoreIds);
      expect(spy1.mock.calls.length).toBe(1);
      spy1.mockClear();
      const spy2 = jest.spyOn(viewModel.map, 'setLayoutProperty');
      viewModel.setLayersVisible(true);
      expect(spy2.mock.calls.length).toBe(1);
      spy1.mockClear();
      spy2.mockClear();
      map = data.map;
    };
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
    const viewModel2 = new WebMapViewModel(
      commonId,
      { ...commonOption, checkSameLayer: true },
      { ...commonMapOptions },
      map
    );
    viewModel2.on({
      addlayerssucceeded: () => {
        const spy = jest.spyOn(viewModel2.map, 'getLayer');
        spy.mockReturnValue({ type: 'test' });
        const ignoreIds = ['China'];
        const spy1 = jest.spyOn(viewModel2.map, 'setLayoutProperty');
        viewModel2.setLayersVisible(false, ignoreIds);
        expect(spy1.mock.calls.length).toBe(1);
        spy1.mockClear();
        const spy2 = jest.spyOn(viewModel2.map, 'setLayoutProperty');
        viewModel2.setLayersVisible(true);
        expect(spy2.mock.calls.length).toBe(1);
        done();
      }
    });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('cleanLayers', async done => {
    const viewModel = new WebMapViewModel(commonId, { ...commonOption, map: commonMap }, { ...commonMapOptions });
    const callback = function () {
      expect(viewModel._cacheCleanLayers.length).not.toBe(0);
      const cleanLayers = jest.spyOn(viewModel._handler, 'cleanLayers');
      viewModel.cleanLayers();
      expect(cleanLayers).toBeCalled();
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  // 在 MD 调用
  it('updateOverlayLayer unique', async done => {
    const viewModel = new WebMapViewModel(commonId, { ...commonOption, map: commonMap }, { ...commonMapOptions });
    const callback = function (data) {
      const layerInfo = { ...uniqueLayer_polygon.layers[0], id: uniqueLayer_polygon.layers[0].name };
      const features = [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [116.588918, 40.07108]
          },
          properties: {
            latitude: '40.07108',
            longitude: '116.588918',
            altitude: '',
            geometry: 'Point',
            机场: '北京/首都',
            X坐标: '116.588918',
            Y坐标: '40.07108',
            名次: '1',
            '2017旅客吞吐量（人次）': '95786296 ',
            '2016旅客吞吐量（人次）': '94393454 ',
            '同比增速%': '-1.5',
            张家界: '94393454 ',
            index: '0'
          }
        }
      ];
      const spy = jest.spyOn(viewModel._handler, 'updateOverlayLayer');
      viewModel.updateOverlayLayer(layerInfo, features);
      expect(spy).toBeCalled();
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('add baselayer which is baidu', async done => {
    const callback = function (data) {
      expect(data).not.toBeUndefined();
      done();
    };
    const viewModel = new WebMapViewModel(baseLayers['BAIDU']);
    viewModel.on({ baidumapnotsupport: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
    viewModel._handler.fire('baidumapnotsupport', {});
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
    viewModel.on({ mapcreatefailed: callback });
    await flushPromises();
    viewModel._handler.fire('mapcreatefailed', { error: { message: 'webmap.crsNotSupport' } });
  });

  it('add baselayer which is bing', async done => {
    jest.useFakeTimers();
    const callback = function (data) {
      expect(data).not.toBeUndefined();
      done();
    };
    const viewModel = new WebMapViewModel(baseLayers['BING'], {
      bingMapsKey: 'AhOVlIlR89XkNyDsXBAb7TjabrEokPoqhjk4ncLm9cQkJ5ae_JyhgV1wMcWnVrko'
    });
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

  it('add wmtsLayer with error url', async done => {
    const callback = function (data) {
      expect(data).not.toBeUndefined();
      done();
    };
    const viewModel = new WebMapViewModel({
      ...wmtsLayer,
      layers: [{ ...wmtsLayer.layers[0], url: '/iserver/services/map-china400/wmts100' }]
    });
    viewModel.on({ mapcreatefailed: callback });

    await flushPromises();
    jest.advanceTimersByTime(120);
    viewModel._handler.fire('mapcreatefailed', {});
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
    viewModel.on({ projectionnotmatch: callback });
    viewModel._handler.fire('projectionnotmatch', {});
  });

  it('xyztilelayernotsupport', done => {
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
    viewModel.on({ xyztilelayernotsupport: callback });
    viewModel._handler.fire('xyztilelayernotsupport', {error: 'xyztilelayernotsupport'});
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

  it('xyztilelayernotsupport', async done => {
    const viewModel = new WebMapViewModel(vectorLayer_line, {}, undefined, null, function (layer) {
      return layer.name === '浙江省高等院校(3)';
    });
    const callback = function (e) {
      expect(e).not.toBeUndefined();
      done();
    };
    viewModel.on({ xyztilelayernotsupport: callback });
    viewModel._handler.fire('xyztilelayernotsupport', {});
    await flushPromises();
  });

  it('webmap3.0', async done => {
    const viewModel = new WebMapViewModel(webmap3Datas[0]);
    const callback = function () {
      const layers = viewModel.getAppreciableLayers();
      expect(layers.length).toBeLessThanOrEqual(webmap3Datas[0].layers.length + 1);
      expect(viewModel.cacheLayerIds.length).toBe(layers.length);
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('exclude source and layer', async done => {
    const viewModel = new WebMapViewModel(commonId, { ...commonOption });
    const callback = function (data) {
      const appreciableLayers1 = viewModel.getAppreciableLayers();
      expect(appreciableLayers1.length).toBeGreaterThanOrEqual(data.layers.length);

      data.map.addLayer({
        paint: {},
        id: '北京市-identify-SM-highlighted',
        source: {
          tiles: [
            'http://localhost:8190/iportal/services/../web/datas/435608982/structureddata/tiles/{z}/{x}/{y}.mvt?epsgCode=3857&returnedFieldNames=%5B%22smpid%22%2C%22parent%22%2C%22adcode%22%2C%22level%22%2C%22centroid%22%2C%22childrenNum%22%2C%22center%22%2C%22subFeatureIndex%22%2C%22name%22%2C%22acroutes%22%2C%22geometry%22%5D&geometryFieldName=geometry'
          ],
          bounds: [115.423411, 39.442758, 117.514583, 41.0608],
          type: 'vector'
        },
        type: 'fill'
      });
      data.map.addSource('mapbox-gl-draw-hot', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });
      data.map.addLayer({
        metadata: {},
        paint: {
          'circle-color': '#f75564'
        },
        id: 'draw-vertex-active.hot',
        source: 'mapbox-gl-draw-hot',
        type: 'circle'
      });
      const appreciableLayers2 = viewModel.getAppreciableLayers();
      expect(appreciableLayers2.length).toBe(1);
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('switch map and reset center zoom', async done => {
    const id = markerLayer;
    const viewModel = new WebMapViewModel(id, { ...commonOption, map: commonMap }, { ...commonMapOptions });
    const callback = function (data) {
      let zoom = viewModel.mapOptions.zoom;
      let center = viewModel.mapOptions.center;
      expect(zoom).toBe(commonMapOptions.zoom);
      expect(center).toEqual(commonMapOptions.center);
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('copy layer', async done => {
    const id = markerLayer;
    const viewModel = new WebMapViewModel(id, { ...commonOption, map: commonMap }, { ...commonMapOptions });
    const callback = function () {
      expect(() => {
        viewModel.copyLayer('layer1');
      }).not.toThrow();
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('changeItemVisible', async done => {
    const viewModel = new WebMapViewModel(commonId, { ...commonOption, map: commonMap }, { ...commonMapOptions });
    const callback = function (data) {
      const layerList = viewModel.getLayerList();
      expect(layerList.length).toBe(1);
      const spy = jest.spyOn(data.map, 'setLayoutProperty');
      viewModel.changeItemVisible('fakeid', true);
      expect(spy).toHaveBeenCalledTimes(0);
      viewModel.on({
        'layerupdatechanged': () => {
          expect(spy).toHaveBeenCalledTimes(1);
          done();
        }
      });
      viewModel.changeItemVisible(layerList[0].id, true);
    };
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('getLayerDatas', async (done) => {
    const dataResult = {
      features: [
        {
          geometry: {
            coordinates: [
              [116.38050072430798, 39.94888011518407],
              [116.38050072430798, 39.94888011518407]
            ],
            type: 'LineString'
          },
          id: '1',
          type: 'Feature',
          properties: {
            SmID: 1,
            标准名称: '地铁二号线',
            smpid: 1
          }
        }
      ],
      type: 'FeatureCollection'
    };
    const dataUrl = 'https://fakeiportal.supermap.io/iportal/web/datas/1832028287/structureddata/ogc-features/collections/all/items.json?limit=5000';
    const fetchResource = {
      [dataUrl]: dataResult
    };
    mockFetch(fetchResource);
    const viewModel = new WebMapViewModel(commonId, { ...commonOption, map: commonMap }, { ...commonMapOptions });
    const callback = async function (data) {
      console.log(123);
      const geojsonData = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              coordinates: [
                [
                  [48.30078125000128, 28.226970038917116],
                  [48.30078125000128, -9.015302333421928],
                  [48.30078125000128, 28.226970038917116]
                ]
              ],
              type: 'Polygon'
            }
          }
        ]
      };
      jest.spyOn(data.map, 'getSource').mockReturnValueOnce({ type: 'geojson', getData: jest.fn().mockReturnValueOnce(geojsonData) });
      let result = await viewModel.getLayerDatas({ renderSource: { type: 'geojson' }});
      expect(result).toEqual(geojsonData.features);
      result = await viewModel.getLayerDatas({ renderSource: { type: 'vector' }, dataSource: {} });
      expect(result).toEqual([]);
      result = await viewModel.getLayerDatas({ renderSource: { type: 'vector' }, dataSource: { serverId: 1832028287 } });
      expect(result).toEqual(dataResult.features);
      jest.restoreAllMocks();
      try {
        result = await viewModel.getLayerDatas({ renderSource: { type: 'vector' }, dataSource: { serverId: 1832028287 } });
      } catch (error) {
        expect(error.error.message).toContain(`request to ${dataUrl} failed`);
      }
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  
  it('mapbeforeremove', async done => {
    const viewModel = new WebMapViewModel(commonId, { ...commonOption, map: commonMap }, { ...commonMapOptions });
    viewModel.on({
      addlayerssucceeded: ({ map }) => {
        expect(map).not.toBeUndefined();
        expect(viewModel._handler).not.toBeUndefined();
        viewModel._handler.fire('mapbeforeremove');
      }
    });
    viewModel.on({
      mapbeforeremove: (params) => {
        expect(params.type).toBe('mapbeforeremove');
        done();
      }
    });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('zoomToBounds', async done => {
    const viewModel = new WebMapViewModel(commonId, { ...commonOption, map: commonMap }, { ...commonMapOptions });
    const callback = async function (data) {
      const layerList = viewModel.getLayerList();
      expect(layerList.length).toBe(1);
      const spy = jest.spyOn(data.map, 'fitBounds');
      jest.spyOn(data.map, 'getSource').mockImplementation(() => {
        return {
          bounds: new mapboxgl.LngLatBounds([115.423411, 39.442758], [117.514583, 41.0608])
        };
      });
      viewModel.zoomToBounds('fakeid');
      expect(spy).toHaveBeenCalledTimes(0);
      viewModel.zoomToBounds(layerList[0].id);
      expect(spy).toHaveBeenCalledTimes(1);
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('zoomToBounds migrationLayer', async done => {
    const viewModel = new WebMapViewModel(commonId, { ...commonOption, map: commonMap }, { ...commonMapOptions });
    const callback = function (data) {
      jest.spyOn(viewModel._handler, 'getLayerCatalog').mockImplementation(() => {
        return [{
          id: 'radar1',
          title: 'radar1',
          type: 'MIGRATION',
          renderSource: [],
          renderLayers: ['radar1'],
        }];
      });
      viewModel._handler._handler = {
        getEchartsLayerById: jest.fn()
      };
      jest.spyOn(viewModel._handler._handler, 'getEchartsLayerById').mockImplementation(() => {
        return {
          features: [{
            "type": "Feature",
            "properties": {},
            "geometry": {
              "coordinates": [
                [
                  [
                    48.30078125000128,
                    28.226970038917116
                  ],
                  [
                    48.30078125000128,
                    -9.015302333421928
                  ],
                  [
                    92.42187500000131,
                    -9.015302333421928
                  ],
                  [
                    92.42187500000131,
                    28.226970038917116
                  ],
                  [
                    48.30078125000128,
                    28.226970038917116
                  ]
                ]
              ],
              "type": "Polygon"
            }
          }]
        }
      });
      const spy = jest.spyOn(data.map, 'fitBounds');
      jest.spyOn(viewModel, '_getMaxBounds').mockReturnValueOnce(new mapboxgl.LngLatBounds([116.423411, 39.442758], [120, 50]));
      viewModel.zoomToBounds('radar1');
      expect(spy).toHaveBeenCalledWith(new mapboxgl.LngLatBounds([116.423411, 39.442758], [120, 50]));
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('should handle source without bounds but with markers', async (done) => {
    const viewModel = new WebMapViewModel(commonId, { ...commonOption, map: commonMap }, { ...commonMapOptions });
    const callback = function (data) {
      const marker = { lngLat: { lng: 116.423411, lat: 39.442758 } };
      const marker1 = { lngLat: { lng: 120, lat: 50 } };
      jest.spyOn(viewModel._handler, 'getLayerCatalog').mockImplementation(() => {
        return [{
          id: 'radar1',
          title: 'radar1',
          type: 'circle',
          renderSource: [],
          renderLayers: ['radar1'],
          'CLASS_INSTANCE': { markers: [marker, marker1] }
        }];
      })
      jest.spyOn(data.map, 'getSource').mockReturnValueOnce(null);
      const spy = jest.spyOn(data.map, 'fitBounds');
      jest.spyOn(viewModel, '_getMaxBounds').mockReturnValueOnce(new mapboxgl.LngLatBounds([116.423411, 39.442758], [120, 50]));
      viewModel.zoomToBounds('radar1');
      expect(spy).toHaveBeenCalledWith(new mapboxgl.LngLatBounds([116.423411, 39.442758], [120, 50]));
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('should handle source with geojson data', async (done) => {
    const viewModel = new WebMapViewModel(commonId, { ...commonOption, map: commonMap }, { ...commonMapOptions });
    const callback = function (data) {
      jest.spyOn(viewModel._handler, 'getLayerCatalog').mockImplementation(() => {
        return [{
          id: 'radar1',
          title: 'radar1',
          type: 'circle',
          renderSource: [],
          renderLayers: ['radar1'],
        }];
      })
      const geojsonData = {
        type: 'FeatureCollection', features: [{
          "type": "Feature",
          "properties": {},
          "geometry": {
            "coordinates": [
              [
                [
                  48.30078125000128,
                  28.226970038917116
                ],
                [
                  48.30078125000128,
                  -9.015302333421928
                ],
                [
                  92.42187500000131,
                  -9.015302333421928
                ],
                [
                  92.42187500000131,
                  28.226970038917116
                ],
                [
                  48.30078125000128,
                  28.226970038917116
                ]
              ]
            ],
            "type": "Polygon"
          }
        }]
      };
      jest.spyOn(data.map, 'getSource').mockReturnValueOnce({ type: 'geojson', getData: jest.fn().mockReturnValueOnce(geojsonData) });
      const spy = jest.spyOn(data.map, 'fitBounds');
      jest.spyOn(viewModel, '_getMaxBounds').mockReturnValueOnce(new mapboxgl.LngLatBounds([116.423411, 39.442758], [120, 50]));
      viewModel.zoomToBounds('radar1');
      expect(spy).toHaveBeenCalledWith(new mapboxgl.LngLatBounds([116.423411, 39.442758], [120, 50]));
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('should handle layer with opacity property', async (done) => {
    const viewModel = new WebMapViewModel(commonId, { ...commonOption, map: commonMap }, { ...commonMapOptions });
    const callback = function (data) {
      const spy1 = jest.spyOn(data.map, 'getLayer').mockImplementation(() => {
        return {
          type: 'circle'
        };
      });
      const spy2 = jest.spyOn(data.map, 'setPaintProperty');
      jest.spyOn(viewModel._handler, 'getLayerCatalog').mockImplementation(() => {
        return [{
          id: 'radar1',
          title: 'radar1',
          type: 'circle',
          renderLayers: ['radar1'],
        }];
      })
      viewModel.changeItemOpacity('radar1', 0.5);
      expect(spy1).toHaveBeenCalledWith('radar1');
      expect(spy2).toHaveBeenCalledWith('radar1', 'circle-opacity', 0.5);
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('should handle CLASS_INSTANCE with markers', async (done) => {
    const viewModel = new WebMapViewModel(commonId, { ...commonOption, map: commonMap }, { ...commonMapOptions });
    const callback = function (data) {
      jest.spyOn(viewModel._handler, 'getLayerCatalog').mockImplementation(() => {
        return [{
          id: 'radar1',
          title: 'radar1',
          type: 'circle',
          renderLayers: ['radar1'],
          'CLASS_INSTANCE': {
            markers: [
              { markerOption: { element: { style: { opacity: 0 }} } },
            ],
          }
        }];
      })
      const spy1 = jest.spyOn(data.map, 'setPaintProperty');
      viewModel.changeItemOpacity('radar1', 0.5);
      expect(spy1).not.toHaveBeenCalled();
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('should handle L7Layer', async (done) => {
    const viewModel = new WebMapViewModel(commonId, { ...commonOption, map: commonMap }, { ...commonMapOptions });
    const callback = function (data) {
      jest.spyOn(viewModel._handler, 'getLayerCatalog').mockImplementation(() => {
        return [{
          id: 'radar2',
          title: 'radar1',
          type: 'circle',
          renderLayers: ['radar1'],
          'CLASS_NAME': 'L7Layer',
        }];
      })
      viewModel.map.getLayer = jest.fn().mockReturnValueOnce({ type: 'circle', reRender: jest.fn() });

      viewModel.changeItemOpacity('radar2', 0.5);
      expect(viewModel.map.getLayer).toHaveBeenCalledWith('radar2');
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('should return undefined when layer not found', async (done) => {
    const viewModel = new WebMapViewModel(commonId, { ...commonOption, map: commonMap }, { ...commonMapOptions });
    const callback = function (data) {
      const id = 'non-existent-id';
      const opacity = viewModel.getLayerOpacityById(id);
      expect(opacity).toBeUndefined();
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('should return opacity from CLASS_INSTANCE marker element', async (done) => {
    const viewModel = new WebMapViewModel(commonId, { ...commonOption, map: commonMap }, { ...commonMapOptions });
    const callback = function (data) {
      jest.spyOn(viewModel._handler, 'getLayerCatalog').mockImplementation(() => {
        return [{
          id: 'radar1',
          title: 'radar1',
          type: 'radar',
          'CLASS_INSTANCE': {
            markers: [
              { markerOption: { element: { style: { opacity: '0.5' } } } }
            ]
          }
        }];
      });
      const id = 'radar1';
      const opacity = viewModel.getLayerOpacityById(id);
      expect(opacity).toEqual(0.5);
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('should return opacity from L7Layer', async (done) => {
    const viewModel = new WebMapViewModel(commonId, { ...commonOption, map: commonMap }, { ...commonMapOptions });
    const callback = function (data) {
      jest.spyOn(viewModel._handler, 'getLayerCatalog').mockImplementation(() => {
        return [{
          l7layer: { getLayerConfig: () => ({ opacity: 0.7 }) },
          id: 'radar1',
          title: 'radar1',
          type: 'radar',
          CLASS_NAME: 'L7Layer',
          'CLASS_INSTANCE': {
            markers: [
              { markerOption: { element: { style: { opacity: '0.5' } } } }
            ]
          }
        }];
      })
      const id = 'radar1';
      const opacity = viewModel.getLayerOpacityById(id);
      expect(opacity).toEqual(0.5);
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('should return opacity from map paint property', async (done) => {
    const viewModel = new WebMapViewModel(commonId, { ...commonOption, map: commonMap }, { ...commonMapOptions });
    const callback = function (data) {
      jest.spyOn(viewModel._handler, 'getLayerCatalog').mockImplementation(() => {
        return [{
          id: 'fillLayer1',
          title: 'fillLayer1',
          type: 'fill',
          renderLayers: ['fillLayer1'],
        }];
      });
      const id = 'fillLayer1';
      jest.spyOn(data.map, 'getLayer').mockReturnValueOnce({ type: 'fill' });
      jest.spyOn(data.map, 'getPaintProperty').mockReturnValueOnce(0.8);
      const opacity = viewModel.getLayerOpacityById(id);
      expect(opacity).toEqual(0.8);
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });

  it('should return 1 when opacity is undefined', async (done) => {
    const viewModel = new WebMapViewModel(commonId, { ...commonOption, map: commonMap }, { ...commonMapOptions });
    const callback = function (data) {
      jest.spyOn(viewModel._handler, 'getLayerCatalog').mockImplementation(() => {
        return [{
          id: 'layer1',
          title: 'layer1',
          type: 'circle',
          renderLayers: ['layer1'],
        }];
      });
      const id = 'layer1';
      jest.spyOn(data.map, 'getLayer').mockReturnValueOnce({ type: 'circle' });
      jest.spyOn(data.map, 'getPaintProperty').mockReturnValueOnce(undefined);
      const opacity = viewModel.getLayerOpacityById(id);
      expect(opacity).toEqual(1);
      done();
    };
    viewModel.on({ addlayerssucceeded: callback });
    await flushPromises();
    jest.advanceTimersByTime(0);
  });
});



