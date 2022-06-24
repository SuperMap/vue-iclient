import WebMapService from '../WebMapService.ts';
import flushPromises from 'flush-promises';
import iportal_serviceProxy from '../../../../test/unit/mocks/data/iportal_serviceProxy.json';
import layerData from '../../../../test/unit/mocks/data/layerData.json';
import uniqueLayer_polygon from '../../../../test/unit/mocks/data/WebMap/uniqueLayer_polygon.json';
import epsgCode_wkt from '../../../../test/unit/mocks/data/epsgCode_wkt.json';
import { wmsCapabilitiesText, wmtsCapabilitiesText } from 'vue-iclient/test/unit/mocks/data/CapabilitiesText.js';
import mockFetch from 'vue-iclient/test/unit/mocks/FetchRequest';

const SuperMap = require('../../../../test/unit/mocks/supermap');

const mapId = 123;
const options = {
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

describe('WebMapService.spec', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  // public Fun
  it('setMapId if typeof MapId is num', () => {
    const service = new WebMapService(mapId);
    service.setMapId(mapId);
    expect(service.mapId).toBe(mapId);
    expect(service.mapInfo).toBe(null);
  });

  it('setMapId if typeof MapId is object', () => {
    const mapId = uniqueLayer_polygon;
    const service = new WebMapService(mapId, options);
    service.setMapId(mapId);
    expect(service.mapId).toBe('');
    expect(service.mapInfo).toBe(mapId);
  });

  it('setServerUrl', () => {
    const serverUrl = 'https://fakeiportal.supermap.io';
    const service = new WebMapService(mapId, options);
    expect(service.serverUrl).toBe('https://fakeiportal.supermap.io/iportal');
    service.setServerUrl(serverUrl);
    expect(service.serverUrl).toBe(serverUrl);
  });

  it('setWithCredentials', () => {
    const withCredentials = true;
    const service = new WebMapService(mapId, options);
    expect(service.withCredentials).toBe(false);
    service.setWithCredentials(withCredentials);
    expect(service.withCredentials).toBe(true);
  });

  it('setProxy', () => {
    const proxy = 'https://fakeiportal.supermap.io/iportal';
    const service = new WebMapService(mapId, options);
    expect(service.proxy).toBe(undefined);
    service.setProxy(proxy);
    expect(service.proxy).toBe(proxy);
  });

  it('ServerUrl has "/" at the end', () => {
    const serverUrl = 'https://fakeiportal.supermap.io/iportal';
    const service = new WebMapService(mapId, options);
    service.handleServerUrl(serverUrl);
    expect(service.serverUrl).toBe('https://fakeiportal.supermap.io/iportal/');
  });

  it('get MapInfo by mapId', async done => {
    const newOptions = {
      ...options,
      serverUrl: 'https://fakeiportal.supermap.io/iportal/8095/portalproxy/' // 没有通过处理在末尾加 '/',在此处理
    };
    const newIportal_serviceProxy = {
      serviceProxy: {
        ...iportal_serviceProxy.serviceProxy,
        proxyServerRootUrl: undefined
      }
    };
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/8095/portalproxy/web/config/portal.json': newIportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/8095/portalproxy/web/maps/123/map.json': uniqueLayer_polygon
    };
    const newUniqueLayer_polygon = {
      ...uniqueLayer_polygon,
      mapParams: {
        title: uniqueLayer_polygon.title,
        description: uniqueLayer_polygon.description
      }
    };
    mockFetch(fetchResource);
    const service = new WebMapService(mapId, newOptions);
    await flushPromises();
    expect.assertions(1);
    return service.getMapInfo().then(mapInfo => {
      expect(mapInfo).toStrictEqual(newUniqueLayer_polygon);
      done();
    });
  });

  it('fail to get MapInfo by mapId', async done => {
    const options = {
      ...options,
      serverUrl: 'https://fakeiportal.supermap.io/iportal/' // 没有通过处理在末尾加 '/',在此处理
    };
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy
    };
    mockFetch(fetchResource);
    const service = new WebMapService(mapId, options);
    await flushPromises();
    expect.assertions(1);
    return service.getMapInfo().catch(error => {
      expect(error).toBe('未匹配到https://fakeiportal.supermap.io/iportal/web/maps/123/map.json');
      done();
    });
  });

  it('get the wrong iPortal service proxy', async () => {
    const options = {
      ...options,
      serverUrl: 'https://fakeiportal.supermap.io/iportal/'
    };
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': {}
    };
    mockFetch(fetchResource);
    const service = new WebMapService(mapId, options);
    await flushPromises();
    expect.assertions(1);
    await expect(service.getMapInfo()).rejects.toBe('serviceProxyFailed');
  });

  it('fail to get iPortal service proxy', async done => {
    const newOptions = {
      ...options,
      serverUrl: 'https://fakeiportal.supermap.io/iportal/' // 没有通过处理在末尾加 '/',在此处理
    };
    const fetchResource = {};
    mockFetch(fetchResource);
    const service = new WebMapService(mapId, newOptions);
    await flushPromises();
    expect.assertions(1);
    return service.getMapInfo().catch(error => {
      expect(error).toBe('未匹配到https://fakeiportal.supermap.io/iportal/web/config/portal.json');
      done();
    });
  });

  it('get Layer Features from GeoJson Data', async done => {
    const newOptions = {
      ...options,
      iportalServiceProxyUrlPrefix: 'https://fakeiportal.supermap.io/',
      proxy: 'https://fakeiportal.supermap.io/iportal',
      serverUrl: 'https://fakeiportal.supermap.io/iportal/' // 没有通过处理在末尾加 '/',在此处理
    };
    const JsonData = {
      content: JSON.stringify({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              icon: 'theatre1'
            },
            geometry: {
              type: 'Point',
              coordinates: [-77.038659, 38.931567]
            }
          }
        ]
      }),
      fileName: '北京市.geojson',
      lineNumber: null,
      type: 'GEOJSON'
    };
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/123/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123': JsonData
    };
    mockFetch(fetchResource);
    const type = 'hosted';
    const layer = {
      dataSource: {
        serverId: '123',
        accessType: 'DIRECT'
      }
    };
    const baseProjection = 'EPSG:3857';
    const service = new WebMapService(mapId, newOptions);
    return service.getLayerFeatures(type, layer, baseProjection).then(data => {
      expect(data.features.length).toBe(1);
      done();
    });
  });
  
  it('get Layer Features from CSV', async done => {
    const newOptions = {
      ...options,
      proxy: 'https://fakeiportal.supermap.io/iportal/',
      serverUrl: 'https://fakeiportal.supermap.io/iportal/' // 没有通过处理在末尾加 '/',在此处理
    };
    const administrative_data = `window.ProvinceData = {
      features: [{
      geometry: {
        coordinates: [[[[113.5872766800001, 22.16493972869857], [113.5980630750001, 22.13509586869991]]],[[[113.5511133950001, 22.21679186869615], [113.5623058550001, 22.1994578386969]]]],
        type: 'MultiPolygon'
      },
      properties: {Name: '张家界', UserID: 0, Province: '湖南},
      type: 'Feature'
      }],
      type: 'FeatureCollection'
    }`;
    window.MunicipalData = {
      features: [{
        geometry: {
          coordinates: [[[[113.5872766800001, 22.16493972869857], [113.5980630750001, 22.13509586869991]]],[[[113.5511133950001, 22.21679186869615], [113.5623058550001, 22.1994578386969]]]],
          type: 'MultiPolygon'
        },
        properties: {Name: '张家界', UserID: 0},
        type: 'Feature'
        }]
    };
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/123/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123': layerData,
      'https://fakeiportal.supermap.io/iportal/apps/dataviz/libs/administrative_data/MunicipalData.js': administrative_data
    };
    mockFetch(fetchResource);
    const type = 'hosted';
    const layer = {
      dataSource: {
        serverId: '123',
        administrativeInfo: {
          divisionType: 'City',
          divisionField: '张家界'
        }
      }
    };
    const baseProjection = 'EPSG:3857';
    const service = new WebMapService(mapId, newOptions);
    return service.getLayerFeatures(type, layer, baseProjection).then(data => {
      expect(data.features.length).toBe(1);
      done();
    });
  });

  it('get Layer Features from shp Data', async done => {
    const newOptions = {
      ...options,
      proxy: 'https://fakeiportal.supermap.io/iportal/',
      serverUrl: 'https://fakeiportal.supermap.io/iportal/' // 没有通过处理在末尾加 '/',在此处理
    };
    const ShpData = {
      content: JSON.stringify({
        layers: [{
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {
                icon: 'theatre1'
              },
              geometry: {
                type: 'Point',
                coordinates: [-77.038659, 38.931567]
              }
            }
          ]          
        }]
      }),
      fileName: '北京市.shp',
      lineNumber: null,
      type: 'SHP'
    };
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/123/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123': ShpData
    };
    mockFetch(fetchResource);
    const type = 'hosted';
    const layer = {
      dataSource: {
        serverId: '123',
        accessType: 'DIRECT'
      }
    };
    const baseProjection = 'EPSG:3857';
    const service = new WebMapService(mapId, newOptions);
    return service.getLayerFeatures(type, layer, baseProjection).then(data => {
      expect(data.features.length).toBe(1);
      done();
    });
  });

  it('get Layer Features from mvt', async done => {
    const newOptions = {
      ...options,
      proxy: 'https://fakeiportal.supermap.io/iportal/',
      serverUrl: 'https://fakeiportal.supermap.io/iportal/' // 没有通过处理在末尾加 '/',在此处理
    };
    const result = [
      {
        name: 'test',
        type: 'FeatureCollection',

      }
    ];
    const result1 = {
      fileId: 'test',
      datasetName: 'test',
      dataItemServices: [{
        serviceType: 'RESTDATA',
        address: 'https://fakeiportal.supermap.io/iportal/'
      }]
    }
    const datasource = {
      code: 200,
      datasourceNames: ['captial']
    };
    const datasetsInfo = {
      datasetInfo: {
        prjCoordSys: {
          epsgCode: '3857'
        },
        bounds: [0,1,0,1]
      }
    };
    const result2 = {
      error: {
        code: 400
      }
    };
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/123/datasets.json?parentResType=MAP&parentResId=123': result,
      'https://fakeiportal.supermap.io/iportal/web/datas/123.json?parentResType=MAP&parentResId=123': result1,
      'https://fakeiportal.supermap.io/iportal//data/datasources.json?parentResType=MAP&parentResId=123': datasource,
      'https://fakeiportal.supermap.io/iportal//data/datasources/captial/datasets/test?parentResType=MAP&parentResId=123': datasetsInfo,
      'https://fakeiportal.supermap.io/iportal//data/datasources/captial/datasets/test?parentResType=MAP&parentResId=123/tilefeature.mvt': result2,
    };
    mockFetch(fetchResource);
    const type = 'hosted';
    const layer = {
      serverId: '123',
      layerType: 'HOSTED_TILE'
    };
    const baseProjection = 'EPSG:3857';
    const service = new WebMapService(mapId, newOptions);
    return service.getLayerFeatures(type, layer, baseProjection).then(data => {
      expect(data.type).toBe('mvt');
      done();
    });
  });

  it('get Layer Features if LayerInfo from rest_data success', async done => {
    const type = 'rest_data';
    const layer = {
      dataSource: {
        url: 'https://fakeiportal.supermap.io/iportal/processCompleted'
      },
      enableFields: ['latitude']
    };
    const baseProjection = 'EPSG:3857';
    const result = {
      features: [
        {
          geometry: { coordinates: [101.84004968, 26.0859968692659], type: 'Point' },
          properties: { NAME: '四川省', SMID: '1', index: '0', lat: 26.0859968692659, lon: 101.84004968 },
          type: 'Feature'
        }
      ],
      type: 'feature'
    };
    const service = new WebMapService(mapId, options);
    expect.assertions(1);
    return service.getLayerFeatures(type, layer, baseProjection).then(data => {
      expect(data).toStrictEqual(result);
      done();
    });
  });

  it('get layer features if layerInfo from rest_data fail', done => {
    const type = 'rest_data';
    const layer = {
      dataSource: {
        url: 'https://fakeiportal.supermap.io/iportal/processFailed'
      },
      enableFields: ['latitude']
    };
    const baseProjection = 'EPSG:4326';
    const service = new WebMapService(mapId, options);
    expect.assertions(1);
    expect(service.getLayerFeatures(type, layer, baseProjection)).rejects.toBe('get features faild');
    done();
  });

  it('get Layer Features if LayerInfo from rest_map success', async done => {
    const type = 'rest_map';
    const layer = {
      dataSource: {
        url: 'https://fakeiportal.supermap.io/iportal/processCompleted'
      },
      enableFields: ['latitude']
    };
    const baseProjection = 'EPSG:3857';
    const result = {
      features: [
        {
          geometry: { coordinates: [101.84004968, 26.0859968692659], type: 'Point' },
          properties: { NAME: '四川省', SMID: '1', index: '0', lat: 26.0859968692659, lon: 101.84004968 },
          type: 'Feature'
        }
      ],
      type: 'feature'
    };
    const service = new WebMapService(mapId, options);
    expect.assertions(1);
    return service.getLayerFeatures(type, layer, baseProjection).then(data => {
      expect(data).toStrictEqual(result);
      done();
    });
  });

  it('get layer features if layerInfo from rest_map fail', async () => {
    const type = 'rest_map';
    const layer = {
      dataSource: {
        url: 'https://fakeiportal.supermap.io/iportal/processFailed'
      },
      enableFields: ['latitude']
    };
    const baseProjection = 'EPSG:4326';
    const service = new WebMapService(mapId, options);
    expect.assertions(1);
    await expect(service.getLayerFeatures(type, layer, baseProjection)).rejects.toBe('get features faild');
  });

  it('get layer features if LayerInfo from dataflow success', async done => {
    const retrun = {
      featureMetaData: {
        featureType: 'Point',
        fieldInfos: [
          {
            name: 'text',
            type: 'TEXT'
          },
          {
            name: 'long',
            type: 'LONG'
          },
          {
            name: 'numberw',
            type: 'Number'
          }
        ]
      },
      urls: [
        {
          url: 'https://fakeiportal.supermap.io/iserver/services/dataflow'
        }
      ]
    };
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/processCompleted.json?token=123&parentResType=MAP&parentResId=123': retrun
    };
    mockFetch(fetchResource);
    const type = 'dataflow';
    const layer = {
      dataSource: {
        dataTypes: {}
      },
      url: 'https://fakeiportal.supermap.io/iportal/processCompleted',
      credential: {
        token: '123'
      }
    };
    const baseProjection = 'EPSG:1000';
    const result = { type: 'dataflow' };
    const service = new WebMapService(mapId, options);
    expect.assertions(1);
    return service.getLayerFeatures(type, layer, baseProjection).then(data => {
      expect(data).toStrictEqual(result);
      done();
    });
  });

  it('get layer features if LayerInfo from dataflow fail', async () => {
    const fetchResource = {};
    mockFetch(fetchResource);
    const type = 'dataflow';
    const layer = {
      dataSource: {
        dataTypes: {}
      },
      url: 'https://fakeiportal.supermap.io/iportal/processFailed',
      credential: {
        token: '123'
      }
    };
    const baseProjection = 'EPSG:1000';
    const service = new WebMapService(mapId, options);
    await flushPromises();
    expect.assertions(1);
    await expect(service.getLayerFeatures(type, layer, baseProjection)).rejects.toBe(undefined);
  });

  it('get layer features if LayerInfo from user_data success', async done => {
    const returnData = {
      features: [
        {
          geometry: { coordinates: [101.84004968, 26.0859968692659], type: 'Point' },
          properties: { NAME: '四川省', SMID: '1', index: '0', lat: 26.0859968692659, lon: 101.84004968 },
          type: 'Feature'
        }
      ],
      type: 'FeatureCollection'
    };
    const result = { type: 'feature', features: returnData.features };
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal?parentResType=MAP&parentResId=123': returnData
    };
    mockFetch(fetchResource);
    const type = 'user_data';
    const layer = {
      dataSource: {
        url: 'https://fakeiportal.supermap.io/iportal'
      },
      enableFields: ['latitude']
    };
    const baseProjection = 'EPSG:3857';
    const service = new WebMapService(mapId, options);
    return service.getLayerFeatures(type, layer, baseProjection).then(data => {
      expect(data).toStrictEqual(result);
      done();
    });
  });

  it('success to get epsgCode info', async done => {
    const epsgcodeInfo = {
      wkt: epsgCode_wkt
    };
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/epsgcodes/EPSG:4326.json': epsgcodeInfo
    };
    mockFetch(fetchResource);
    const epsgCode = 'EPSG:4326';
    const iPortalUrl = 'https://fakeiportal.supermap.io/iportal';
    const service = new WebMapService(mapId, options);
    await flushPromises();
    expect.assertions(1);
    return service.getEpsgCodeInfo(epsgCode, iPortalUrl).then(data => {
      expect(data).toStrictEqual(epsgCode_wkt);
      done();
    });
  });

  it('getWmsInfo', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal?REQUEST=GetCapabilities&SERVICE=WMS': wmsCapabilitiesText
    };
    mockFetch(fetchResource);
    const layerInfo = {
      layerID: 'China',
      layerType: 'WMS',
      layers: ['0'],
      name: 'China',
      url: 'https://fakeiportal.supermap.io/iportal?',
      visible: true
    };
    const service = new WebMapService(mapId, options);
    expect.assertions(1);
    return service.getWmsInfo(layerInfo).then(data => {
      expect(data).toStrictEqual({ version: '1.1.1' });
      done();
    });
  });

  it('getWmtsInfo', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal?REQUEST=GetCapabilities&SERVICE=WMTS&VERSION=1.0.0&parentResType=MAP&parentResId=123': wmtsCapabilitiesText
    };
    mockFetch(fetchResource);
    const layerInfo = {
      layer: 'ChinaDark',
      layerID: 'China',
      layerType: 'WMS',
      layers: ['0'],
      name: 'China',
      url: 'https://fakeiportal.supermap.io/iportal?',
      visible: true
    };
    const mapCRS = {};
    const service = new WebMapService(mapId, options);
    expect.assertions(1);
    const data = await service.getWmtsInfo(layerInfo, mapCRS);
    expect(data.kvpResourceUrl).toBe('http://fakeiserver.supermap.io/iserver/services/map-china400/wmts-china?');
    done();
  });

  it('get datasource on rest_data type', () => {
    const layer = {
      dataSource: { accessType: 'DIRECT', type: 'REST_DATA' }
    };
    const service = new WebMapService(mapId, options);
    expect(service.getDatasourceType(layer)).toBe('rest_data');
  });

  it('get datasource on rest_map type', () => {
    const layer = {
      dataSource: { accessType: 'DIRECT', type: 'REST_MAP', url: '123' }
    };
    const service = new WebMapService(mapId, options);
    expect(service.getDatasourceType(layer)).toBe('rest_map');
  });

  it('get datasource on dataflow type', () => {
    const layer = {
      layerType: 'DATAFLOW_HEAT'
    };
    const service = new WebMapService(mapId, options);
    expect(service.getDatasourceType(layer)).toBe('dataflow');
  });

  it('get datasource on user_data type', () => {
    const layer = {
      dataSource: { type: 'USER_DATA' }
    };
    const service = new WebMapService(mapId, options);
    expect(service.getDatasourceType(layer)).toBe('user_data');
  });
});
