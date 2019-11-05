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
  search_mapjson,
  fieldsJson,
  datas_beijing
} from './services';

var SuperMap = (window.SuperMap = window.SuperMap || {});
SuperMap.Widgets = window.SuperMap.Widgets || {};
SuperMap.Widgets.FileReaderUtil = {};
SuperMap.ColorsPickerUtil = {};
SuperMap.ColorsPickerUtil.getGradientColors = function() {
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

var GetFeaturesBySQLParameters = (SuperMap.GetFeaturesBySQLParameters = jest.fn());
var GetFeaturesBySQLParameters = (SuperMap.GetFeaturesByBoundsParameters = jest.fn());
var QueryBySQLParameters = (SuperMap.QueryBySQLParameters = jest.fn());
var GeoCodingParameter = (SuperMap.GeoCodingParameter = jest.fn());
var FilterParameter = (SuperMap.FilterParameter = jest.fn());
var QueryByBoundsParameters = (SuperMap.QueryByBoundsParameters = jest.fn());
var isXField = (SuperMap.Widgets.FileReaderUtil.isXField = jest.fn());
var isYField = (SuperMap.Widgets.FileReaderUtil.isYField = jest.fn());

var FetchRequest = (SuperMap.FetchRequest = {
  get: function(url, params, options) {
    console.log(url);
    return new Promise((resolve, reject) => {
      if (url.indexOf('1962026684') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(datas))));
      } else if (url.indexOf('1649097980/map.json') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(datas_mapjson))));
      }
      // echarts
      else if (url.indexOf('datas/1920557079/content.json') > -1) {
        console.log('search_pagecontent');
        process.nextTick(() =>
          // resolve(new Response(JSON.stringify(search_pagecontent)))
          resolve(new Response(JSON.stringify(charts_content)))
        );
      }
      // 1920557079/content.json?pageSize=9999999&currentPage=1
      // /web/datas/1920557079.json echarts
      else if (url.indexOf('/web/datas/1920557079') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(datas_chart))));
      }
      // http://192.168.12.230:8092/web/datas/2040117719/content.json?pageSize=9999999&currentPage=1"
      else if (url.indexOf('content.json?pageSize=9999999&currentPage=1') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(iportal_content))));
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
      else if (url.indexOf('Countries/fields.rjson') > -1) {
        console.log('rjson');
        process.nextTick(() => resolve(new Response(JSON.stringify(fieldsJson))));
      } else if (url.indexOf('data_sichuan-2-/rest/data/datasources/supermap1_pg/datasets') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(datasets))));
      } else if (url.indexOf('data_sichuan-2-/rest/data/datasources') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(datasources))));
      }
      // http://www.supermapol.com/iserver/services/localsearch/rest/searchdatas/China/poiinfos.json?keywords=%E5%8C%97%E4%BA%AC&city=%E5%8C%97%E4%BA%AC%E5%B8%82&pageSize=10&pageNum=1&key=fvV2osxwuZWlY0wJb8FEb2i5
      else if (url.indexOf('China/poiinfos.json') > -1) {
        console.log('poiinfos json');
        process.nextTick(() => resolve(new Response(JSON.stringify(localSearch))));
      } else if (url.indexOf('geocoding.json') > -1) {
        process.nextTick(() => resolve(new Response(JSON.stringify(searchGeocoding))));
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
                [[[101.84004968, 26.0859968692659], [101.95654423, 26.0888446242659], [101.84004968, 26.0859968692659]]]
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
  getFeatureEvent.on('processCompleted', options.eventListeners.processCompleted);
  return {
    processAsync: processAsync
  };
});
var processAsync = (SuperMap.GetFeaturesBySQLService.processAsync = getFeatureBySQLParams => {
  setTimeout(() => {
    getFeatureEvent.emit('processCompleted', results);
  }, 0);
});

var QueryBySQLService = (SuperMap.QueryBySQLService = (url, options) => {
  getFeatureEvent.on('processCompleted', options.eventListeners.processCompleted);
  return {
    // queryBySQL: queryBySQL,
    processAsync: processAsync
  };
});

module.exports = SuperMap;
