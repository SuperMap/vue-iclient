import WebMapViewModel from '../WebMapViewModel.ts';
import cloneDeep from 'lodash.clonedeep';
window.getComputedStyle = () => {
  return {
    width: 100,
    height: 50
  };
};

const id = 123;
const options = {
  accessKey: undefined,
  accessToken: undefined,
  excludePortalProxyUrl: undefined,
  iportalServiceProxyUrlPrefix: undefined,
  isSuperMapOnline: undefined,
  proxy: undefined,
  serverUrl: '123',
  target: 'map',
  tiandituKey: undefined,
  withCredentials: false
};
const mapOptions = {
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
        minzoom: 0,
        maxzoom: 22
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
const WebMapViewModelObj = new WebMapViewModel(id, options, mapOptions);
WebMapViewModelObj.map = {
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
  getLayer: () => jest.fn(),
  removeLayer: () => jest.fn(),
  getCRS: () => {
    return {
      epsgCode: 'EPSG:4326',
      getExtent: () => jest.fn()
    };
  },
  addLayer: () => jest.fn(),
  overlayLayersManager: {},
  on: () => {}
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
    const WebMapViewModelObj = new WebMapViewModel(id);
    expect(WebMapViewModelObj.webMapInfo).toBe(id);
  });

  it('resize keepBounds = undefined', () => {
    const newWebMapViewModelObj = cloneDeep(WebMapViewModelObj);
    expect(newWebMapViewModelObj.resize()).toBe(undefined);
  });

  it('resize keepBounds = true', () => {
    const keepBounds = true;
    const newWebMapViewModelObj = cloneDeep(WebMapViewModelObj);
    newWebMapViewModelObj.echartsLayerResize = () => jest.fn();
    expect(newWebMapViewModelObj.resize(keepBounds)).toBe(undefined);
  });

  xit('setCrs', () => {
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
    const newWebMapViewModelObj = cloneDeep(WebMapViewModelObj);
    expect(newWebMapViewModelObj.setCrs(crs)).toBe(undefined);
  });

  it('setCenter', () => {
    const center = [1, 30.236];
    const newWebMapViewModelObj = cloneDeep(WebMapViewModelObj);
    expect(newWebMapViewModelObj.setCenter(center)).toBe(undefined);
  });

  it('setBearing', () => {
    const bearing = 0;
    const newWebMapViewModelObj = cloneDeep(WebMapViewModelObj);
    expect(newWebMapViewModelObj.setBearing(bearing)).toBe(undefined);
  });

  it('setBearing bearing is undefined', () => {
    const newWebMapViewModelObj = cloneDeep(WebMapViewModelObj);
    expect(newWebMapViewModelObj.setBearing()).toBe(undefined);
  });

  it('setBearing bearing is undefined', () => {
    const newWebMapViewModelObj = cloneDeep(WebMapViewModelObj);
    expect(newWebMapViewModelObj.setBearing()).toBe(undefined);
  });

  it('setPitch pitch is undefined', () => {
    const newWebMapViewModelObj = cloneDeep(WebMapViewModelObj);
    expect(newWebMapViewModelObj.setPitch()).toBe(undefined);
  });

  it('setRasterTileSize tileSize<0', () => {
    const tileSize = -1;
    const newWebMapViewModelObj = cloneDeep(WebMapViewModelObj);
    expect(newWebMapViewModelObj.setRasterTileSize(tileSize)).toBe(undefined);
  });

  it('setRasterTileSize', () => {
    const tileSize = 2;
    const newWebMapViewModelObj = cloneDeep(WebMapViewModelObj);
    expect(newWebMapViewModelObj.setRasterTileSize(tileSize)).toBe(undefined);
  });

  it('cleanLayers', () => {
    const newWebMapViewModelObj = cloneDeep(WebMapViewModelObj);
    newWebMapViewModelObj._cacheLayerId = ['ChinaDark', '民航数据'];
    newWebMapViewModelObj.cleanLayers();
    expect(newWebMapViewModelObj._cacheLayerId.length).toBe(0);
  });

  it('_loadLayers', () => {
    const mapInfo = {
      baseLayer: { layerType: 'TILE', visible: true, name: 'China', url: 'https://test/map-china400/rest/maps/China' },
      center: { x: 11240286, y: 4193987 },
      description: '',
      extent: {
        leftBottom: {
          x: -20037508,
          y: -20037508
        },
        rightTop: {
          x: 20037508,
          y: 20037508
        }
      },
      layers: [],
      level: 5,
      mapParams: { title: 'China', description: '' },
      maxScale: '1:144447',
      minScale: '1:591658710',
      projection: 'EPSG:3857',
      rootUrl: 'https://test/',
      title: 'China',
      version: '2.2.1'
    };
    const _taskID = {};
    const newWebMapViewModelObj = cloneDeep(WebMapViewModelObj);
    expect(newWebMapViewModelObj._loadLayers(mapInfo, _taskID)).toBe(undefined);
  });

  it('_loadLayers', () => {
    const mapInfo = {
      baseLayer: { layerType: 'TILE', visible: true, name: 'China', url: 'https://test/map-china400/rest/maps/China' },
      center: { x: 11240286, y: 4193987 },
      description: '',
      extent: {
        leftBottom: {
          x: -20037508,
          y: -20037508
        },
        rightTop: {
          x: 20037508,
          y: 20037508
        }
      },
      layers: [],
      level: 5,
      mapParams: { title: 'China', description: '' },
      maxScale: '1:144447',
      minScale: '1:591658710',
      projection: 'EPSG:3857',
      rootUrl: 'https://test/',
      title: 'China',
      version: '2.2.1'
    };
    const _taskID = 'Tue Oct 26 2021 11:08:59 GMT+0800';
    const newWebMapViewModelObj = cloneDeep(WebMapViewModelObj);
    newWebMapViewModelObj.map = {
      ...WebMapViewModelObj.map,
      getCRS: () => {
        return {
          epsgCode: 'EPSG:4326' 
        }
      },
      getLayer: () => ''
    };
    newWebMapViewModelObj.baseProjection = 'EPSG:4326';
    newWebMapViewModelObj.ignoreBaseProjection = true;
    expect(newWebMapViewModelObj._loadLayers(mapInfo, _taskID)).toBe(undefined);
  });

  it('_getMapInfo', () => {
    const mapInfo = {
      baseLayer: { layerType: 'TILE', visible: true, name: 'China', url: 'https://test/map-china400/rest/maps/China' },
      center: { x: 11240286, y: 4193987 },
      description: '',
      extent: {
        leftBottom: {
          x: -20037508,
          y: -20037508
        },
        rightTop: {
          x: 20037508,
          y: 20037508
        }
      },
      layers: [],
      level: 5,
      mapParams: { title: 'China', description: '' },
      maxScale: '1:144447',
      minScale: '1:591658710',
      projection: 'EPSG:3857',
      rootUrl: 'https://test/',
      title: 'China',
      version: '2.2.1'
    };
    const _taskID = 'Tue Oct 26 2021 11:08:59 GMT+0800';
    const newWebMapViewModelObj = cloneDeep(WebMapViewModelObj);
    expect(newWebMapViewModelObj._getMapInfo(mapInfo, _taskID)).toBe(undefined);
  });

  it('_handleLayerInfo', () => {
    const mapInfo = {
      baseLayer: { layerType: 'TILE', visible: true, name: 'China', url: 'https://test/map-china400/rest/maps/China' },
      center: { x: 11240286, y: 4193987 },
      description: '',
      extent: {
        leftBottom: {
          x: -20037508,
          y: -20037508
        },
        rightTop: {
          x: 20037508,
          y: 20037508
        }
      },
      grid: {
        graticule: {
          extent: [-20037508.3427892, -20037508.3427892, 20037508.3427892, 20037508.3427892],
          interval: [5],
          latLabelStyle: {
            fill: '#000000',
            fontFamily: 'Calibri,sans-serif',
            fontSize: '12px',
            outlineColor: 'rgba(255,255,255,0.85)',
            outlineWidth: 3,
            textBaseline: 'bottom'
          },
          lineDash: [0.5, 4],
          lonLabelStyle: {
            fill: '#000000',
            fontFamily: 'Calibri,sans-serif',
            fontSize: '12px',
            outlineColor: 'rgba(255,255,255,0.85)',
            outlineWidth: 3,
            textBaseline: 'bottom'
          },
          strokeColor: '#1464A1',
          strokeWidth: 2
        }
      },
      layers: [],
      level: 5,
      mapParams: { title: 'China', description: '' },
      maxScale: '1:144447',
      minScale: '1:591658710',
      projection: 'EPSG:3857',
      rootUrl: 'https://test/',
      title: 'China',
      version: '2.2.1'
    };
    const _taskID = 'Tue Oct 26 2021 11:08:59 GMT+0800';
    const newWebMapViewModelObj = cloneDeep(WebMapViewModelObj);
    newWebMapViewModelObj.map = {
      ...WebMapViewModelObj.map,
      getLayer: () => ''
    };
    newWebMapViewModelObj.baseProjection = 'EPSG:4326';
    expect(newWebMapViewModelObj._handleLayerInfo(mapInfo, _taskID)).toBe(undefined);
  });

  xit('_createMap', () => {
    const mapInfo = {
      baseLayer: { layerType: 'TILE', visible: true, name: 'China', url: 'https://test/map-china400/rest/maps/China' },
      center: { x: 11240286, y: 4193987 },
      description: '',
      extent: {
        leftBottom: {
          x: -20037508,
          y: -20037508
        },
        rightTop: {
          x: 20037508,
          y: 20037508
        }
      },
      grid: {
        graticule: {
          extent: [-20037508.3427892, -20037508.3427892, 20037508.3427892, 20037508.3427892],
          interval: [5],
          latLabelStyle: {
            fill: '#000000',
            fontFamily: 'Calibri,sans-serif',
            fontSize: '12px',
            outlineColor: 'rgba(255,255,255,0.85)',
            outlineWidth: 3,
            textBaseline: 'bottom'
          },
          lineDash: [0.5, 4],
          lonLabelStyle: {
            fill: '#000000',
            fontFamily: 'Calibri,sans-serif',
            fontSize: '12px',
            outlineColor: 'rgba(255,255,255,0.85)',
            outlineWidth: 3,
            textBaseline: 'bottom'
          },
          strokeColor: '#1464A1',
          strokeWidth: 2
        }
      },
      layers: [],
      level: 5,
      mapParams: { title: 'China', description: '' },
      maxScale: '1:144447',
      minScale: '1:591658710',
      projection: 'EPSG:3857',
      rootUrl: 'https://test/',
      title: 'China',
      version: '2.2.1'
    };
    const _taskID = 'Tue Oct 26 2021 11:08:59 GMT+0800';
    const newWebMapViewModelObj = cloneDeep(WebMapViewModelObj);
    newWebMapViewModelObj.map = {
      ...WebMapViewModelObj.map,
      getLayer: () => ''
    };
    newWebMapViewModelObj.baseProjection = 'EPSG:4326';
    expect(newWebMapViewModelObj._handleLayerInfo(mapInfo, _taskID)).toBe(undefined);
  });

  it('_initBaseLayer layerType is BING', () => {
    const mapInfo = {
      layerType: 'BING',
      center: { x: 11240286, y: 4193987 },
      description: '',
      extent: {
        leftBottom: {
          x: -20037508,
          y: -20037508
        },
        rightTop: {
          x: 20037508,
          y: 20037508
        }
      },
      grid: {
        graticule: {
          extent: [-20037508.3427892, -20037508.3427892, 20037508.3427892, 20037508.3427892],
          interval: [5],
          latLabelStyle: {
            fill: '#000000',
            fontFamily: 'Calibri,sans-serif',
            fontSize: '12px',
            outlineColor: 'rgba(255,255,255,0.85)',
            outlineWidth: 3,
            textBaseline: 'bottom'
          },
          lineDash: [0.5, 4],
          lonLabelStyle: {
            fill: '#000000',
            fontFamily: 'Calibri,sans-serif',
            fontSize: '12px',
            outlineColor: 'rgba(255,255,255,0.85)',
            outlineWidth: 3,
            textBaseline: 'bottom'
          },
          strokeColor: '#1464A1',
          strokeWidth: 2
        }
      },
      layers: [],
      level: 5,
      mapParams: { title: 'China', description: '' },
      maxScale: '1:144447',
      minScale: '1:591658710',
      projection: 'EPSG:3857',
      rootUrl: 'https://test/',
      title: 'China',
      version: '2.2.1'
    };
    const newWebMapViewModelObj = cloneDeep(WebMapViewModelObj);
    newWebMapViewModelObj.map = {
      ...WebMapViewModelObj.map,
      getLayer: () => ''
    };
    newWebMapViewModelObj.baseProjection = 'EPSG:4326';
    expect(newWebMapViewModelObj._initBaseLayer(mapInfo)).toBe(undefined);
  });

  it('_initBaseLayer layerType is CLOUD', () => {
    const mapInfo = {
      baseLayer: { layerType: 'CLOUD', visible: true, name: 'China', url: 'https://test/map-china400/rest/maps/China' },
      center: { x: 11240286, y: 4193987 },
      description: '',
      extent: {
        leftBottom: {
          x: -20037508,
          y: -20037508
        },
        rightTop: {
          x: 20037508,
          y: 20037508
        }
      },
      grid: {
        graticule: {
          extent: [-20037508.3427892, -20037508.3427892, 20037508.3427892, 20037508.3427892],
          interval: [5],
          latLabelStyle: {
            fill: '#000000',
            fontFamily: 'Calibri,sans-serif',
            fontSize: '12px',
            outlineColor: 'rgba(255,255,255,0.85)',
            outlineWidth: 3,
            textBaseline: 'bottom'
          },
          lineDash: [0.5, 4],
          lonLabelStyle: {
            fill: '#000000',
            fontFamily: 'Calibri,sans-serif',
            fontSize: '12px',
            outlineColor: 'rgba(255,255,255,0.85)',
            outlineWidth: 3,
            textBaseline: 'bottom'
          },
          strokeColor: '#1464A1',
          strokeWidth: 2
        }
      },
      layers: [],
      level: 5,
      mapParams: { title: 'China', description: '' },
      maxScale: '1:144447',
      minScale: '1:591658710',
      projection: 'EPSG:3857',
      rootUrl: 'https://test/',
      title: 'China',
      version: '2.2.1'
    };
    const newWebMapViewModelObj = cloneDeep(WebMapViewModelObj);
    newWebMapViewModelObj.map = {
      ...WebMapViewModelObj.map,
      getLayer: () => ''
    };
    newWebMapViewModelObj.baseProjection = 'EPSG:4326';
    expect(newWebMapViewModelObj._initBaseLayer(mapInfo)).toBe(undefined);
  });

  it('_initBaseLayer layerType is BAIDU', () => {
    const mapInfo = {
      baseLayer: { layerType: 'BAIDU', visible: true, name: 'China', url: 'https://test/map-china400/rest/maps/China' },
      center: { x: 11240286, y: 4193987 },
      description: '',
      extent: {
        leftBottom: {
          x: -20037508,
          y: -20037508
        },
        rightTop: {
          x: 20037508,
          y: 20037508
        }
      },
      grid: {
        graticule: {
          extent: [-20037508.3427892, -20037508.3427892, 20037508.3427892, 20037508.3427892],
          interval: [5],
          latLabelStyle: {
            fill: '#000000',
            fontFamily: 'Calibri,sans-serif',
            fontSize: '12px',
            outlineColor: 'rgba(255,255,255,0.85)',
            outlineWidth: 3,
            textBaseline: 'bottom'
          },
          lineDash: [0.5, 4],
          lonLabelStyle: {
            fill: '#000000',
            fontFamily: 'Calibri,sans-serif',
            fontSize: '12px',
            outlineColor: 'rgba(255,255,255,0.85)',
            outlineWidth: 3,
            textBaseline: 'bottom'
          },
          strokeColor: '#1464A1',
          strokeWidth: 2
        }
      },
      layers: [],
      level: 5,
      mapParams: { title: 'China', description: '' },
      maxScale: '1:144447',
      minScale: '1:591658710',
      projection: 'EPSG:3857',
      rootUrl: 'https://test/',
      title: 'China',
      version: '2.2.1'
    };
    const newWebMapViewModelObj = cloneDeep(WebMapViewModelObj);
    newWebMapViewModelObj.map = {
      ...WebMapViewModelObj.map,
      getLayer: () => ''
    };
    newWebMapViewModelObj.baseProjection = 'EPSG:4326';
    expect(newWebMapViewModelObj._initBaseLayer(mapInfo)).toBe(undefined);
  });

  xit('_initOverlayLayers', () => {
    const layers = [{
      layerID: 'China_4326',
      dataSource: { accessType: 'DIRECT', type: 'SAMPLE_DATA', url: 'http://support.supermap.com.cn:8090/iserver/services/map-china400/rest/maps/China_4326' },
      layerType: 'MARKER',
      name: 'China_4326',
      visible: true
    }, {
      dataSource: {accessType: 'DIRECT', administrativeInfo: {}, type: 'PORTAL_DATA', serverId: '190598158'},
      enableFields: ['区站号', '站台', '省份', 'X', 'Y', '海拔', '平均最低气温', '最热七天气温', '最高气温', '最低气温', '年均降雨'],
      featureType: 'POLYGON',
      layerID: '671个气象站观测数据',
      layerType: 'VECTOR',
      name: '671个气象站观测数据',
      projection: 'EPSG:4326',
      visibleScale: {
        maxScale: '1:144447.92746805',
        minScale: '1:591658710.909131',
      },
      style: {},
      visible: true
    }, {
      layerID: 'China_4326',
      layerType: 'MAPBOXSTYLE',
      name: 'China_4326',
      url: 'http://support.supermap.com.cn:8090/iserver/services/map-china400/rest/maps/China_4326',
      visible: true
    }];
    const _taskID = 'Tue Oct 26 2021 11:08:59 GMT+0800';
    const newWebMapViewModelObj = cloneDeep(WebMapViewModelObj);
    expect(newWebMapViewModelObj._initOverlayLayers(layers, _taskID)).toBe(undefined);
  });
});
