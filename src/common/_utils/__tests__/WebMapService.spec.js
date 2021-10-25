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

  it('_getFeaturesFromRestData baseProjection is EPSG:-1000', () => {
    const layer = {
      dataSource: { accessType: 'DIRECT', type: 'PORTAL_DATA', serverId: '676516522', url: '123' },
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
    const baseProjection = 'EPSG:-1000';
    const newWebMapServiceObj = cloneDeep(WebMapServiceObj);
    newWebMapServiceObj._getFeaturesFromRestData(layer, baseProjection).then(() => {
      done();
    });
  });

  it('getEpsgCodeInfo', () => {
    const epsgCode = 'map';
    const iPortalUrl = '719613442';
    const newWebMapServiceObj = cloneDeep(WebMapServiceObj);
    expect(newWebMapServiceObj.getEpsgCodeInfo(epsgCode, iPortalUrl)).not.toBeNull();
  });

  it('getDatasourceType type = SAMPLE_DATA', () => {
    const layer = {
      layerID: 'China_4326',
      dataSource: { accessType: 'DIRECT', type: 'SAMPLE_DATA' },
      layerType: 'MARKER',
      name: 'China_4326',
      url: 'http://support.supermap.com.cn:8090/iserver/services/map-china400/rest/maps/China_4326',
      visible: true
    };
    const newWebMapServiceObj = cloneDeep(WebMapServiceObj);
    expect(newWebMapServiceObj.getDatasourceType(layer)).toBe('SAMPLE_DATA');
  });

  it('getEpsgCodeInfo', () => {
    const epsgCode = 'map';
    const iPortalUrl = '719613442';
    const newWebMapServiceObj = cloneDeep(WebMapServiceObj);
    expect(newWebMapServiceObj.getEpsgCodeInfo(epsgCode, iPortalUrl)).not.toBeNull();
  });

  it('getDatasourceType type = tile', () => {
    const layer = {
      layerID: 'China_4326',
      layerType: 'MAPBOXSTYLE',
      name: 'China_4326',
      url: 'http://support.supermap.com.cn:8090/iserver/services/map-china400/rest/maps/China_4326',
      visible: true
    };
    const newWebMapServiceObj = cloneDeep(WebMapServiceObj);
    expect(newWebMapServiceObj.getDatasourceType(layer)).toBe('tile');
  });

  it('getDatasourceType type = hosted', () => {
    const layer = {
      layerID: 'China_4326',
      dataSource: { accessType: 'DIRECT', type: 'HOSTED_TILE' },
      layerType: 'HOSTED_TILE',
      name: 'China_4326',
      url: 'http://support.supermap.com.cn:8090/iserver/services/map-china400/rest/maps/China_4326',
      visible: true
    };
    const newWebMapServiceObj = cloneDeep(WebMapServiceObj);
    expect(newWebMapServiceObj.getDatasourceType(layer)).toBe('hosted');
  });

  it('getDatasourceType type = rest_data', () => {
    const layer = {
      layerID: 'China_4326',
      dataSource: { accessType: 'DIRECT', type: 'REST_DATA' },
      name: 'China_4326',
      url: 'http://support.supermap.com.cn:8090/iserver/services/map-china400/rest/maps/China_4326',
      visible: true
    };
    const newWebMapServiceObj = cloneDeep(WebMapServiceObj);
    expect(newWebMapServiceObj.getDatasourceType(layer)).toBe('rest_data');
  });

  it('getDatasourceType type = rest_map', () => {
    const layer = {
      layerID: 'China_4326',
      dataSource: { accessType: 'DIRECT', type: 'REST_MAP', url: '123' },
      name: 'China_4326',
      url: 'http://support.supermap.com.cn:8090/iserver/services/map-china400/rest/maps/China_4326',
      visible: true
    };
    const newWebMapServiceObj = cloneDeep(WebMapServiceObj);
    expect(newWebMapServiceObj.getDatasourceType(layer)).toBe('rest_map');
  });

  it('getDatasourceType type = dataflow', () => {
    const layer = {
      layerID: 'China_4326',
      name: 'China_4326',
      layerType: 'DATAFLOW_HEAT',
      url: 'http://support.supermap.com.cn:8090/iserver/services/map-china400/rest/maps/China_4326',
      visible: true
    };
    const newWebMapServiceObj = cloneDeep(WebMapServiceObj);
    expect(newWebMapServiceObj.getDatasourceType(layer)).toBe('dataflow');
  });

  it('getDatasourceType type = user_data', () => {
    const layer = {
      layerID: 'China_4326',
      name: 'China_4326',
      dataSource: { accessType: 'DIRECT', type: 'USER_DATA' },
      url: 'http://support.supermap.com.cn:8090/iserver/services/map-china400/rest/maps/China_4326',
      visible: true
    };
    const newWebMapServiceObj = cloneDeep(WebMapServiceObj);
    expect(newWebMapServiceObj.getDatasourceType(layer)).toBe('user_data');
  });

  it('parseGeoJsonData2Feature', () => {
    const metaData = {
      allDatas: {
        features: [
          {
            geometry: { type: 'Point', coordinates: [0, 1] },
            properties: {
              title: '老虎海',
              subtitle: '树正沟景点-老虎海',
              imgUrl: './laohuhai.png',
              description: '',
              index: 1
            },
            type: 'Feature'
          }
        ]
      },
      name: 'China_4326',
      dataSource: { accessType: 'DIRECT', type: 'USER_DATA' },
      url: 'http://support.supermap.com.cn:8090/iserver/services/map-china400/rest/maps/China_4326',
      visible: true
    };
    const result = [
      {
        geometry: { coordinates: [0, 1], type: 'Point' },
        properties: {
          description: '',
          imgUrl: './laohuhai.png',
          index: '0',
          lat: 1,
          lon: 0,
          subtitle: '树正沟景点-老虎海',
          title: '老虎海'
        },
        type: 'Feature'
      }
    ];
    const newWebMapServiceObj = cloneDeep(WebMapServiceObj);
    expect(newWebMapServiceObj.parseGeoJsonData2Feature(metaData)).toEqual(result);
  });

  it('_isMatchAdministrativeName featureName is 张家口市', () => {
    const featureName = '张家口市';
    const fieldName = '张家口市';
    const newWebMapServiceObj = cloneDeep(WebMapServiceObj);
    expect(newWebMapServiceObj._isMatchAdministrativeName(featureName, fieldName)).toBe(true);
  });

  it('_isMatchAdministrativeName featureName is 阿拉尔市', () => {
    const featureName = '阿拉尔市';
    const fieldName = '阿拉尔市';
    const newWebMapServiceObj = cloneDeep(WebMapServiceObj);
    expect(newWebMapServiceObj._isMatchAdministrativeName(featureName, fieldName)).toBe(true);
  });

  it('_isMatchAdministrativeName featureName is 北京市', () => {
    const featureName = '北京市';
    const newWebMapServiceObj = cloneDeep(WebMapServiceObj);
    expect(newWebMapServiceObj._isMatchAdministrativeName(featureName)).toBe(false);
  });

  it('_combineFeature', () => {
    const properties = {
      colTitles: [
        '区站号',
        '站台',
        '省份',
        'X',
        'Y',
        '海拔',
        '平均最低气温',
        '最热七天气温',
        '最高气温',
        '最低气温',
        '年均降雨'
      ],
      rows: [
        [
          '区站号',
          '站台',
          '省份',
          'X',
          'Y',
          '海拔',
          '平均最低气温',
          '最热七天气温',
          '最高气温',
          '最低气温',
          '年均降雨'
        ],
        ['50136', '漠河', '黑龙江', '122.37', '53.47', '296', '-47', '29', '33', '-53', '366.1']
      ]
    };
    const geoData = {
      features: [{
      geometry: {
        coordinates: [[[[113.5872766800001, 22.16493972869857], [113.5980630750001, 22.13509586869991]]],[[[113.5511133950001, 22.21679186869615], [113.5623058550001, 22.1994578386969]]]],
        type: 'Polygon'
      },
      properties: {Name: '黑龙江', UserID: 0},
      type: 'Feature'
      }],
      type: 'FeatureCollection'
    };
    const divisionField = '省份';
    const newWebMapServiceObj = cloneDeep(WebMapServiceObj);
    expect(newWebMapServiceObj._combineFeature(properties, geoData, divisionField).features[0].properties['省份']).toBe('黑龙江');
  });

  it('_excelData2Feature', () => {
    const dataContent = {
      colTitles: [
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
      rows: [
        [
          '40.07108',
          '116.588918',
          '',
          'Point',
          '北京/首都',
          '116.588918',
          '40.07108',
          '1',
          '95786296 ',
          '94393454 ',
          '-1.5',
          '2029584 ',
          '1943160 ',
          '597259 ',
          '606081 '
        ]
      ]
    };
    const newWebMapServiceObj = cloneDeep(WebMapServiceObj);
    expect(newWebMapServiceObj._excelData2Feature(dataContent)[0].geometry.type).toBe('Point');
    expect(newWebMapServiceObj._excelData2Feature(dataContent)[0].properties.altitude).toBe('40.07108');
  });

  it('_excelData2FeatureByDivision', () => {
    const content = {
      colTitles: [
        '区站号',
        '站台',
        '省份',
        'X',
        'Y',
        '海拔',
        '平均最低气温',
        '最热七天气温',
        '最高气温',
        '最低气温',
        '年均降雨'
      ],
      rows: [
        [
          '区站号',
          '站台',
          '省份',
          'X',
          'Y',
          '海拔',
          '平均最低气温',
          '最热七天气温',
          '最高气温',
          '最低气温',
          '年均降雨'
        ],
        ['50136', '漠河', '黑龙江', '122.37', '53.47', '296', '-47', '29', '33', '-53', '366.1']
      ]
    };
    const divisionType = 'Province';
    const divisionField = '省份';
    const newWebMapServiceObj = cloneDeep(WebMapServiceObj);
    newWebMapServiceObj.serverUrl = 'http://test/iportal';
    expect(newWebMapServiceObj._excelData2FeatureByDivision(content, divisionType, divisionField)).not.toBeNull();
  });
});
