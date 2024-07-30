import {
  featureResults,
  datas,
  datasources,
  datasets,
  queryResults,
  fakeLandUse,
  chartResult,
  datas_chart,
  iportal_content,
  datas_mapjson,
  charts_content,
  localSearch,
  portal_data,
  portal_data1,
  chart_data,
  search_mapjson,
  fieldsJson,
  datas_beijing,
  prj_data,
  dataset_data,
  datas_charts,
  searchGeocoding,
  drill_map_mapjson,
  drill_map_mapjson1,
  drill_map_mapjson2,
  drill_map_mapjson3,
  drill_map_719613442,
  drill_map_1960447494,
  drill_map_1687422166,
  marker_data,
  wmsCapabilitiesText,
  webmap_markerLayer,
  webmap_heatLayer,
  webmap_vectorLayer_point,
  webmap_vectorLayer_line,
  webmap_rangeLayer,
  webmap_ranksymbolLayer,
  webmap_uniqueLayer_polygon,
  webmap_tiandituLayer,
  webmap_wmsLayer,
  webmap_wmtsLayer,
  webmap_xyzLayer,
  webmap_mapboxstyleLayer,
  webmap_migrationLayer,
  webmap_MAPBOXSTYLE_Tile
} from './services';
import '../../../static/libs/iclient-mapboxgl/iclient-mapboxgl.min';

var SuperMap = (window.SuperMap = window.SuperMap || {});

SuperMap.SpatialQueryMode = {
  CONTAIN: 'CONTAIN',
  CROSS: 'CROSS',
  DISJOINT: 'DISJOINT',
  IDENTITY: 'IDENTITY',
  INTERSECT: 'INTERSECT',
  NONE: 'NONE',
  OVERLAP: 'OVERLAP',
  TOUCH: 'TOUCH',
  WITHIN: 'WITHIN'
};
SuperMap.Widgets = window.SuperMap.Widgets || {};
SuperMap.Widgets.FileReaderUtil = {};
SuperMap.ColorsPickerUtil = {};
SuperMap.ColorsPickerUtil.getGradientColors = function () {
  return [
    '#d53e4f',
    '#d6404f',
    '#dd4f51',
    '#de5151',
    '#df5351',
    '#e05652',
    '#e25852',
    '#e35a52',
    '#e45c52',
    '#e55e53',
    '#e66153',
    '#e76353',
    '#e86553',
    '#e96754',
    '#ea6954',
    '#eb6c54',
    '#ec6e55',
    '#ed7055',
    '#ef7255',
    '#f07455',
    '#f17756',
    '#f27956',
    '#f37b56',
    '#f47d57',
    '#f57f57',
    '#f68257',
    '#f78457',
    '#f88658',
    '#f98858',
    '#fa8a58',
    '#fc8d59',
    '#fc8f5a',
    '#fc915b',
    '#fc935d',
    '#fc965e',
    '#fc985f',
    '#fc9a61',
    '#fc9d62',
    '#fc9f64',
    '#fca165',
    '#fca466',
    '#fca668',
    '#fca869',
    '#fcaa6b',
    '#fcad6c',
    '#fcaf6d',
    '#fcb16f',
    '#fcb470',
    '#fcb671',
    '#fdb873',
    '#fdbb74',
    '#fdbd76',
    '#fdbf77',
    '#fdc278',
    '#fdc47a',
    '#fdc67b',
    '#fdc87d',
    '#fdcb7e',
    '#fdcd7f',
    '#fdcf81',
    '#fdd282',
    '#fdd484',
    '#fdd685',
    '#fdd986',
    '#fddb88',
    '#fddd89',
    '#fee08b',
    '#fee08c',
    '#fee18d',
    '#fee28f',
    '#fee390',
    '#fee492',
    '#fee593',
    '#fee695',
    '#fee696',
    '#fee798',
    '#fee899',
    '#fee99a',
    '#feea9c',
    '#feeb9d',
    '#feec9f',
    '#feeca0',
    '#feeda2',
    '#feeea3',
    '#feefa5',
    '#fef0a6',
    '#fef1a7',
    '#fef2a9',
    '#fef2aa',
    '#fef3ac',
    '#fef4ad',
    '#fef5af',
    '#fef6b0',
    '#fef7b2',
    '#fef8b3',
    '#fef8b4',
    '#fef9b6',
    '#fefab7',
    '#fefbb9',
    '#fefcba',
    '#fefdbc',
    '#fefebd',
    '#fdfebc',
    '#fcfebb',
    '#fcfdba',
    '#fbfdb9',
    '#fafdb8',
    '#fafdb7',
    '#f9fcb6',
    '#f8fcb5',
    '#f8fcb4',
    '#f7fbb3',
    '#f6fbb1',
    '#f5fbb0',
    '#f5fbaf',
    '#f4faae',
    '#f3faad',
    '#f3faac',
    '#f2faab',
    '#f1f9aa',
    '#f1f9a9',
    '#f0f9a8',
    '#eff8a7',
    '#eff8a6',
    '#eef8a4',
    '#edf8a3',
    '#ecf7a2',
    '#ecf7a1',
    '#ebf7a0',
    '#eaf69f',
    '#f8fcb5',
    '#f8fcb4',
    '#f7fbb3',
    '#f6fbb1',
    '#f5fbb0',
    '#f5fbaf',
    '#f4faae',
    '#f3faad',
    '#f3faac',
    '#f2faab',
    '#f1f9aa',
    '#f1f9a9',
    '#f0f9a8',
    '#eff8a7',
    '#eff8a6',
    '#eef8a4',
    '#edf8a3',
    '#ecf7a2',
    '#ecf7a1',
    '#ebf7a0',
    '#eaf69f',
    '#519fb0',
    '#f8fcb4',
    '#f7fbb3',
    '#f6fbb1',
    '#f5fbb0',
    '#f5fbaf',
    '#f4faae',
    '#f3faad',
    '#f3faac',
    '#f2faab',
    '#f1f9aa',
    '#f1f9a9',
    '#f0f9a8',
    '#eff8a7',
    '#eff8a6',
    '#eef8a4',
    '#edf8a3',
    '#ecf7a2',
    '#ecf7a1',
    '#ebf7a0',
    '#eaf69f',
    '#f8fcb5',
    '#f8fcb4',
    '#f7fbb3',
    '#f6fbb1',
    '#f5fbb0',
    '#f5fbaf',
    '#f4faae',
    '#f3faad',
    '#f3faac',
    '#f2faab',
    '#f1f9aa',
    '#f1f9a9',
    '#f0f9a8',
    '#eff8a7',
    '#eff8a6',
    '#eef8a4',
    '#edf8a3',
    '#ecf7a2',
    '#ecf7a1',
    '#ebf7a0',
    '#eaf69f',
    '#519fb0',
    '#f1f9a9',
    '#f0f9a8',
    '#eff8a7',
    '#eff8a6',
    '#eef8a4',
    '#edf8a3',
    '#f5fbaf',
    '#f4faae',
    '#f3faad',
    '#f3faac',
    '#f2faab',
    '#f1f9aa',
    '#f1f9a9',
    '#f0f9a8',
    '#eff8a7',
    '#eff8a6',
    '#eef8a4',
    '#edf8a3',
    '#ecf7a2',
    '#ecf7a1',
    '#ebf7a0',
    '#eaf69f',
    '#519fb0'
  ];
};
SuperMap.ArrayStatistic = {};
SuperMap.ArrayStatistic.getArraySegments = function (array, type, segNum) {
  return [
    0.406820286455,
    2.6944246004791665,
    4.982028914503333,
    7.2696332285275,
    9.557237542551666,
    11.844841856575833,
    14.1324461706
  ];
};
SuperMap.ArrayStatistic.getArrayStatistic = function () {};
SuperMap.SecurityManager = {
  registerToken: () => {}
};

var GetFeaturesBySQLParameters = (SuperMap.GetFeaturesBySQLParameters = jest.fn());
var GetFeaturesBySQLParameters = (SuperMap.GetFeaturesByBoundsParameters = jest.fn());
var QueryByGeometryParameters = (SuperMap.QueryByGeometryParameters = jest.fn());
var QueryBySQLParameters = (SuperMap.QueryBySQLParameters = jest.fn());
var GeoCodingParameter = (SuperMap.GeoCodingParameter = jest.fn());
var FilterParameter = (SuperMap.FilterParameter = jest.fn());
var QueryByBoundsParameters = (SuperMap.QueryByBoundsParameters = jest.fn());
var isXField = (SuperMap.Widgets.FileReaderUtil.isXField = jest.fn());
var isYField = (SuperMap.Widgets.FileReaderUtil.isYField = jest.fn());
var Util = (SuperMap.Util = {
  urlPathAppend: function (a, b) {
    return `${a}/${b}`;
  },
  urlAppend: function (url, paramStr) {
    var newUrl = url;
    var parts = (url + ' ').split(/[?&]/);
    newUrl += parts.pop() === ' ' ? paramStr : parts.length ? '&' + paramStr : '?' + paramStr;
    return newUrl;;
  },
  getScaleFromResolutionDpi: function (resolution, dpi, coordUnit = 'degree') {
    var scale = -1,
      ratio = 10000;
    if (resolution > 0 && dpi > 0) {
      if (coordUnit.toLowerCase() === 'degree') {
        scale = 0.0254 / dpi / resolution / ((Math.PI * 2 * 6378137) / 360);
      } else {
        scale = 0.0254 / dpi / resolution;
      }
    }
    return scale;
  },
  isArray: function (a) {
    return Array.isArray(a);
  }
});
SuperMap.String = {
  trim: a => {
    return String(a);
  }
};
var document = {};
var documentElement = (document.documentElement = {});
var FetchRequest = (SuperMap.FetchRequest = {
  get: function (url, params, options) {
    return new Promise((resolve, reject) => {
      if (url.indexOf('1962026684') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(datas))));
      } else if (url.indexOf('1649097980/map.json') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(datas_mapjson))));
      } else if (url.indexOf('244114284/map.json') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(drill_map_mapjson))));
      } else if (url.indexOf('1653065660') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(drill_map_mapjson1))));
      } else if (url.indexOf('891303728') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(drill_map_mapjson2))));
      } else if (url.indexOf('366831804') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(drill_map_mapjson3))));
      } else if (url.indexOf('1687422166') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(drill_map_1687422166))));
      } else if (url.indexOf('1960447494') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(drill_map_1960447494))));
      } else if (url.indexOf('719613442') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(drill_map_719613442))));
      } else if (url.indexOf('123456/map.json') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(webmap_markerLayer))));
      } else if (url.indexOf('12345678/map.json') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(webmap_heatLayer))));
      } else if (url.indexOf('147258369/map.json') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(webmap_vectorLayer_point))));
      } else if (url.indexOf('159357852/map.json') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(webmap_vectorLayer_line))));
      } else if (url.indexOf('123456789/map.json') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(webmap_ranksymbolLayer))));
      } else if (url.indexOf('2064629293/map.json') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(webmap_uniqueLayer_polygon))));
      } else if (url.indexOf('1224625555/map.json') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(webmap_tiandituLayer))));
      } else if (url.indexOf('4845656956/map.json') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(webmap_wmsLayer))));
      } else if (url.indexOf('1016996969/map.json') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(webmap_wmtsLayer))));
      } else if (url.indexOf('7894565555/map.json') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(webmap_xyzLayer))));
      } else if (url.indexOf('8888885555/map.json') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(webmap_mapboxstyleLayer))));
      } else if (url.indexOf('6177878786/map.json') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(webmap_migrationLayer))));
      } else if (url.indexOf('5785858575/map.json') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(webmap_rangeLayer))));
      } else if (url.indexOf('1324277678/map.json') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(webmap_MAPBOXSTYLE_Tile))));
      }
      // echarts
      else if (url.indexOf('datas/1920557079/content.json') > -1) {
        process.nextTick(() =>
          // resolve(new Response(JSON.stringify(search_pagecontent)))
          resolve(new Response(JSON.stringify(charts_content)))
        );
      }
      // 1920557079/content.json?pageSize=9999999&currentPage=1
      // /web/datas/1920557079.json echarts
      else if (url.indexOf('datas/123/content.json') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(datas_charts))));
      } else if (url.indexOf('datas/676516522/content.json') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(datas_charts))));
      } else if (url.indexOf('datas/123456/content.json') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(marker_data))));
      } else if (url.indexOf('iportal/web/datas') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(datas_chart))));
      }
      // http://fakeiportal.supermap.io/web/datas/2040117719/content.json?pageSize=9999999&currentPage=1"
      else if (url.indexOf('content.json?pageSize=9999999&currentPage=1') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(iportal_content))));
      } else if (url.indexOf('?REQUEST=GetCapabilities&SERVICE=WMS') > -1) {
        process.nextTick(() => resolve(new Response(wmsCapabilitiesText)));
      }
      // 2040117719
      else if (url.indexOf('2040117719') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(datas_beijing))));
      } else if (url.indexOf('/queryResults') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(queryResults))));
      } else if (url.indexOf('/featureResults') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(featureResults))));
      } else if (url.indexOf('/Landuse_R') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(fakeLandUse))));
      }
      /// iserver/services/data-world/rest/data/datasources/World/datasets/Countries/fields.rjson.json
      else if (url.indexOf('fields.rjson') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(fieldsJson))));
      } else if (url.indexOf('data_sichuan-2-/rest/data/datasources/supermap1_pg/datasets') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(datasets))));
      } else if (url.indexOf('data_sichuan-2-/rest/data/datasources') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(datasources))));
      }
      // http://www.supermapol.com/iserver/services/localsearch/rest/searchdatas/China/poiinfos.json?keywords=%E5%8C%97%E4%BA%AC&city=%E5%8C%97%E4%BA%AC%E5%B8%82&pageSize=10&pageNum=1&key=fvV2osxwuZWlY0wJb8FEb2i5
      else if (url.indexOf('China/poiinfos.json') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(localSearch))));
      } else if (url.indexOf('geocoding.json') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(searchGeocoding))));
      } else if (url.indexOf('web/config/portal.json') > -1) {
        // resolve(new Response(JSON.stringify(portal_data)));
        process.nextTick(() => resolve(new Response(JSON.stringify(portal_data1))));
      } else if (url.indexOf('iportal/web/maps') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(portal_data))));
      } else if (url.indexOf('/content.json') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(chart_data))));
      } else if (url.indexOf('/prjCoordSys') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(prj_data))));
      } else if (url.indexOf('/World/datasets/Countries') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(dataset_data))));
      } else {
        process.nextTick(() => reject('未匹配到'));
      }
    });
  }
});

var events = require('events');

var getFeatureEvent = new events.EventEmitter();
var results_getFeaturesBySQLService = {
  recordsets: [
    {
      datasetName: 'Capitals@World#1',
      features: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              SMID: '1',
              NAME: '四川省'
            },
            geometry: {
              type: 'MultiPolygon',
              coordinates: [
                [
                  [
                    [101.84004968, 26.0859968692659],
                    [101.95654423, 26.0888446242659],
                    [101.84004968, 26.0859968692659]
                  ]
                ]
              ]
            }
          }
        ]
      },
      fieldCaptions: [
        'SmID',
        'SmX',
        'SmY',
        'SmLibTileID',
        'SmUserID',
        'SmGeometrySize',
        'USERID',
        'POP',
        'CAPITAL_LO',
        'CAPITAL_CH',
        'COUNTRY_CH',
        'CAPITAL_EN',
        'COUNTRY_EN',
        'COUNTRY',
        'CAP_POP',
        'CAPITAL'
      ],
      fieldTypes: [
        'INT32',
        'DOUBLE',
        'DOUBLE',
        'INT32',
        'INT32',
        'INT32',
        'INT32',
        'DOUBLE',
        'WTEXT',
        'WTEXT',
        'WTEXT',
        'WTEXT',
        'WTEXT',
        'WTEXT',
        'DOUBLE',
        'WTEXT'
      ],
      fields: [
        'SmID',
        'SmX',
        'SmY',
        'SmLibTileID',
        'SmUserID',
        'SmGeometrySize',
        'USERID',
        'POP',
        'CAPITAL_LO',
        'CAPITAL_CH',
        'COUNTRY_CH',
        'CAPITAL_EN',
        'COUNTRY_EN',
        'COUNTRY',
        'CAP_POP',
        'CAPITAL'
      ]
    }
  ],
  totalCount: 0,
  currentCount: 0,
  customResponse: null,
  succeed: true
};

var results = {
  result: results_getFeaturesBySQLService
  //   result: chartResult
};

var GetFeaturesBySQLService = (SuperMap.GetFeaturesBySQLService = (url, options) => {
  const result = {
    result: {
      datasetInfos: [{
        fieldInfos:[{name: "SmID", caption: "SmID", type: "INT32"}, {name: "NAME", caption: "名称", type: "WTEXT"}]
      }],
      features: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              SMID: '1',
              NAME: '四川省'
            },
            geometry: {
              type: 'Point',
              coordinates: [101.84004968, 26.0859968692659]
            }
          }
        ]
      }
    }
  };
  if (options.eventListeners) {
    if (url.indexOf('processCompleted') > -1) {
      options.eventListeners.processCompleted(result);
    } else if (url.indexOf('processFailed') > -1) {
      options.eventListeners.processFailed('get features faild');
    }
  }
  getFeatureEvent.on('processCompleted', options.eventListeners.processCompleted);
  return {
    processAsync: () => {
      let returnData;
      if (
        url === 'https://fakeiportal.supermap.io/iportal/processCompleted?parentResType=MAP&parentResId=123' ||
        'https://fakeiportal.supermap.io/iportal/processFailed?parentResType=MAP&parentResId=123'
      ) {
        returnData = result;
      } else if (
        url === 'https://fakeiportal.supermap.io/iportal/processFailed.json?token=123&parentResType=MAP&parentResId=123'
      ) {
        returnData = result;
      } else {
        returnData = results;
      }
      // setTimeout(() => {
        getFeatureEvent.emit('processCompleted', returnData);
      // }, 0);
    }
  };
});

var QueryBySQLService = (SuperMap.QueryBySQLService = (url, options) => {
  const result = {
    result: {
      recordsets: [
        {
          fields: {
            0: 'SmID'
          },
          fieldCaptions: {
            0: 'SmID'
          },
          features: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {
                  SMID: '1',
                  NAME: '四川省'
                },
                geometry: {
                  type: 'Point',
                  coordinates: [101.84004968, 26.0859968692659]
                }
              }
            ]
          }
        }
      ]
    }
  };
  if (options.eventListeners) {
    if (url.indexOf('processCompleted') > -1) {
      options.eventListeners.processCompleted(result);
    } else if (url.indexOf('processFailed') > -1) {
      options.eventListeners.processFailed('get features faild');
    }
  }
  const processAsync = (getFeatureBySQLParams => {
      getFeatureEvent.emit('processCompleted', results);
  });
  return {
    // queryBySQL: queryBySQL,
    processAsync: processAsync
  };
});

module.exports = SuperMap;
