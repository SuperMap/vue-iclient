import WebMapService from '../WebMapService.ts';
import cloneDeep from 'lodash.clonedeep';
const SuperMap = require('../../../../test/unit/mocks/supermap');
const mapId = 123;
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
const WebMapServiceObj = new WebMapService(mapId, options);
describe('WebMapBase.spec', () => {
  it('constructor mapId is object && serverUrl is ""', () => {
    const mapId = {};
    options.serverUrl = '';
    const WebMapServiceObj = new WebMapService(mapId, options);
    expect(WebMapServiceObj.serverUrl).toBe('https://www.supermapol.com');
  });

  it('getLayerFeatures type is hosted', () => {
    const type = 'hosted';
    const layer = {
      dataSource: { accessType: 'DIRECT', type: 'PORTAL_DATA', serverId: '676516522' },
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
      featureType: 'POINT',
      layerID: '民航数据',
      layerType: 'UNIQUE',
      name: '民航数据',
      projection: 'EPSG:4326',
      style: { strokeWidth: 1, offsetX: 0, fillColor: '#3288bd', offsetY: 0, fillOpacity: 0.9 },
      themeSetting: { themeField: '名次', customSettings: {}, colors: Array(7) },
      visible: true,
      xyField: { xField: 'longitude', yField: 'latitude' }
    };
    const baseProjection = 'EPSG:3857';
    const newWebMapServiceObj = cloneDeep(WebMapServiceObj);
    expect(newWebMapServiceObj.getLayerFeatures(type, layer, baseProjection)).not.toBeNull();
  });

  it('getLayerFeatures type is rest_data', () => {
    const type = 'rest_data';
    const layer = {
        dataSource: { accessType: 'DIRECT', type: 'PORTAL_DATA', serverId: '676516522' },
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
        featureType: 'POINT',
        layerID: '民航数据',
        layerType: 'UNIQUE',
        name: '民航数据',
        projection: 'EPSG:4326',
        style: { strokeWidth: 1, offsetX: 0, fillColor: '#3288bd', offsetY: 0, fillOpacity: 0.9 },
        themeSetting: { themeField: '名次', customSettings: {}, colors: Array(7) },
        visible: true,
        xyField: { xField: 'longitude', yField: 'latitude' }
      };
    const baseProjection = 'EPSG:3857';
    const newWebMapServiceObj = cloneDeep(WebMapServiceObj);
    expect(newWebMapServiceObj.getLayerFeatures(type, layer, baseProjection)).not.toBeNull();
  });

  it('getLayerFeatures type is rest_map', () => {
    const type = 'rest_map';
    const layer = {
      dataSource: { accessType: 'DIRECT', type: 'PORTAL_DATA', serverId: '676516522' },
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
      featureType: 'POINT',
      layerID: '民航数据',
      layerType: 'UNIQUE',
      name: '民航数据',
      projection: 'EPSG:4326',
      style: { strokeWidth: 1, offsetX: 0, fillColor: '#3288bd', offsetY: 0, fillOpacity: 0.9 },
      themeSetting: { themeField: '名次', customSettings: {}, colors: Array(7) },
      visible: true,
      xyField: { xField: 'longitude', yField: 'latitude' }
    };
    const baseProjection = 'EPSG:3857';
    const newWebMapServiceObj = cloneDeep(WebMapServiceObj);
    expect(newWebMapServiceObj.getLayerFeatures(type, layer, baseProjection)).not.toBeNull();
  });

  it('getLayerFeatures type is dataflow', () => {
    const type = 'dataflow';
    const layer = {
      dataSource: { accessType: 'DIRECT', type: 'PORTAL_DATA', serverId: '676516522' },
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
      featureType: 'POINT',
      layerID: '民航数据',
      layerType: 'UNIQUE',
      name: '民航数据',
      projection: 'EPSG:4326',
      style: { strokeWidth: 1, offsetX: 0, fillColor: '#3288bd', offsetY: 0, fillOpacity: 0.9 },
      themeSetting: { themeField: '名次', customSettings: {}, colors: Array(7) },
      visible: true,
      xyField: { xField: 'longitude', yField: 'latitude' }
    };
    const baseProjection = 'EPSG:3857';
    const newWebMapServiceObj = cloneDeep(WebMapServiceObj);
    expect(newWebMapServiceObj.getLayerFeatures(type, layer, baseProjection)).not.toBeNull();
  });

  it('getLayerFeatures type is user_data', () => {
    const type = 'user_data';
    const layer = {
      dataSource: { accessType: 'DIRECT', type: 'PORTAL_DATA', serverId: '676516522' },
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
      featureType: 'POINT',
      layerID: '民航数据',
      layerType: 'UNIQUE',
      name: '民航数据',
      projection: 'EPSG:4326',
      style: { strokeWidth: 1, offsetX: 0, fillColor: '#3288bd', offsetY: 0, fillOpacity: 0.9 },
      themeSetting: { themeField: '名次', customSettings: {}, colors: Array(7) },
      visible: true,
      xyField: { xField: 'longitude', yField: 'latitude' }
    };
    const baseProjection = 'EPSG:3857';
    const newWebMapServiceObj = cloneDeep(WebMapServiceObj);
    expect(newWebMapServiceObj.getLayerFeatures(type, layer, baseProjection)).not.toBeNull();
  });

  it('getWmsInfo', done => {
    const layerInfo = {
      layerID: 'China',
      layerType: 'WMS',
      layers: ['0'],
      name: 'China',
      url: 'http://test/wms111?',
      visible: true
    };
    const newWebMapServiceObj = cloneDeep(WebMapServiceObj);
    newWebMapServiceObj.getWmsInfo(layerInfo).then(() => {
      done();
    });
  });

  it('_getFeaturesFromHosted no serverId', () => {
    const layer = {
      dataSource: undefined,
      enableFields: [
        ('latitude',
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
        '2016起降架次（架次）')
      ],
      featureType: 'POINT',
      layerID: '民航数据',
      layerType: 'UNIQUE',
      name: '民航数据',
      projection: 'EPSG:4326',
      style: { strokeWidth: 1, offsetX: 0, fillColor: '#3288bd', offsetY: 0, fillOpacity: 0.9 },
      themeSetting: { themeField: '名次', customSettings: {}, colors: Array(7) },
      visible: true,
      xyField: { xField: 'longitude', yField: 'latitude' }
    };
    const baseProjection = 'EPSG:3857';
    const newWebMapServiceObj = cloneDeep(WebMapServiceObj);
    expect(newWebMapServiceObj._getFeaturesFromHosted(layer, baseProjection)).not.toBeNull();
  });

  it('_getFeaturesFromHosted with serverId', () => {
    const layer = {
      dataSource: undefined,
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
      serverId: '676516522',
      featureType: 'POINT',
      layerID: '民航数据',
      layerType: 'UNIQUE',
      name: '民航数据',
      projection: 'EPSG:4326',
      style: { strokeWidth: 1, offsetX: 0, fillColor: '#3288bd', offsetY: 0, fillOpacity: 0.9 },
      themeSetting: { themeField: '名次', customSettings: {}, colors: Array(7) },
      visible: true,
      xyField: { xField: 'longitude', yField: 'latitude' }
    };
    const baseProjection = 'EPSG:3857';
    const newWebMapServiceObj = cloneDeep(WebMapServiceObj);
    expect(newWebMapServiceObj._getFeaturesFromHosted(layer, baseProjection)).not.toBeNull();
  });
});
