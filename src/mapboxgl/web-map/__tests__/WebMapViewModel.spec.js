import WebMapViewModel from '../WebMapViewModel.ts';
import cloneDeep from 'lodash.clonedeep';
const mapboxgl = require('../../../../test/unit/mocks/mapboxgl');
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
    }
  },
  setCenter: () => jest.fn(),
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
  })

  xit('setCrs', () => {
    const crs = {
      epsgCode: '4326',
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
    newWebMapViewModelObj.echartsLayerResize = () => jest.fn();
    expect(newWebMapViewModelObj.setCrs(crs)).toBe(undefined);
  });

  it('setCenter', () => {
    const center = [120.143, 30.236];
    const newWebMapViewModelObj = cloneDeep(WebMapViewModelObj);
    expect(newWebMapViewModelObj.setCenter(center)).toBe(undefined);
  });
});
