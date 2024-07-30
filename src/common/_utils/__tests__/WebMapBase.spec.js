import WebMapBase from '../../../common/web-map/WebMapBase.ts';
import cloneDeep from 'lodash.clonedeep';
import flushPromises from 'flush-promises';

const SuperMap = require('../../../../test/unit/mocks/supermap');
window.canvg = jest.fn();
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
  style: {
    layers: [],
    sources: {},
    version: 8
  }
};
const WebMapBaseObj = new WebMapBase(id, options, mapOptions);
WebMapBaseObj.map = {
  getZoom: () => 2,
  setZoom: jest.fn(),
  setMaxBounds: jest.fn(),
  setMinZoom: jest.fn(),
  setMaxZoom: jest.fn(),
  getSource: () => {
    return {
      _data: {
        features: [
          {
            geometry: {}
          }
        ]
      }
    };
  }
};
describe('WebMapBase.spec', () => {
  it('echartslayer', () => {
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    newWebMapBaseObj.echartslayer = [
      {
        chart: {
          resize: jest.fn()
        }
      }
    ];
    newWebMapBaseObj.echartsLayerResize();
  });

  it('setMapId mapId is number', async done => {
    const mapId = 123;
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    newWebMapBaseObj._initWebMap = jest.fn();
    await newWebMapBaseObj.setMapId(mapId);
    setTimeout(() => {
      done();
    });
  });

  it('setMapId mapId is obj', async done => {
    const mapId = {
      value: 123
    };
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    newWebMapBaseObj._initWebMap = jest.fn();
    await newWebMapBaseObj.setMapId(mapId);
    setTimeout(() => {
      done();
    });
  });

  it('setServerUrl', () => {
    const serverUrl = '123';
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    newWebMapBaseObj.setServerUrl(serverUrl);
    expect(newWebMapBaseObj.serverUrl).toBe('123');
  });

  it('setWithCredentials', () => {
    const withCredentials = true;
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    newWebMapBaseObj.setWithCredentials(withCredentials);
    expect(newWebMapBaseObj.withCredentials).toBe(true);
  });

  it('setProxy', () => {
    const proxy = 'http://test';
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    newWebMapBaseObj.setProxy(proxy);
    expect(newWebMapBaseObj.proxy).toBe(proxy);
  });

  it('setZoom', () => {
    const zoom = 2;
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    newWebMapBaseObj.setZoom(zoom);
    expect(newWebMapBaseObj.mapOptions.zoom).toBe(zoom);
  });

  //maxBounds真实值？？？
  it('setMaxBounds', () => {
    const maxBounds = 10;
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    newWebMapBaseObj.setMaxBounds(maxBounds);
    expect(newWebMapBaseObj.mapOptions.maxBounds).toBe(maxBounds);
  });

  it('setMinZoom', () => {
    const minZoom = 1;
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    newWebMapBaseObj.setMinZoom(minZoom);
    expect(newWebMapBaseObj.mapOptions.minZoom).toBe(minZoom);
  });

  it('setMinZoom minZoom is undefined', () => {
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    newWebMapBaseObj.setMinZoom();
    expect(newWebMapBaseObj.mapOptions.minZoom).toBe(undefined);
  });

  it('setMaxZoom', () => {
    const maxZoom = 19;
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    newWebMapBaseObj.setMaxZoom(maxZoom);
    expect(newWebMapBaseObj.mapOptions.maxZoom).toBe(maxZoom);
  });

  it('setMaxZoom maxZoom is undefined', () => {
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    newWebMapBaseObj.setMaxZoom();
    expect(newWebMapBaseObj.mapOptions.maxZoom).toBe(undefined);
  });

  it('initWebMap', () => {
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    newWebMapBaseObj.clean = jest.fn();
    newWebMapBaseObj._getMapInfo = jest.fn();
    newWebMapBaseObj.initWebMap();
    expect(newWebMapBaseObj.serverUrl).toBe('123/');
  });

  it('getBaseLayerType layerType is TIANDITU', () => {
    const layerInfo = {
      layerType: 'TIANDITU_TER'
    };
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    newWebMapBaseObj.getBaseLayerType(layerInfo);
    // expect(newWebMapBaseObj.serverUrl).toBe('maxZoom');
    // expect(newWebMapBaseObj._taskID).toBe('maxZoom');
  });

  it('getBaseLayerType layerType is TILE', () => {
    const layerInfo = {
      layerType: 'TILE'
    };
    const layerInfo1 = {
      layerType: 'SUPERMAP_REST'
    };
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    expect(newWebMapBaseObj.getBaseLayerType(layerInfo)).toBe('TILE');
    expect(newWebMapBaseObj.getBaseLayerType(layerInfo1)).toBe('TILE');
  });

  it('getBaseLayerType layerType is CLOUD', () => {
    const layerInfo = {
      layerType: 'CLOUD'
    };
    const layerInfo1 = {
      layerType: 'CLOUD_BLACK'
    };
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    expect(newWebMapBaseObj.getBaseLayerType(layerInfo)).toBe('CLOUD');
    expect(newWebMapBaseObj.getBaseLayerType(layerInfo1)).toBe('CLOUD');
  });

  it('getBaseLayerType layerType is XYZ', () => {
    const layerInfo = {
      layerType: 'OSM'
    };
    const layerInfo1 = {
      layerType: 'JAPAN_ORT'
    };
    const layerInfo2 = {
      layerType: 'JAPAN_RELIEF'
    };
    const layerInfo3 = {
      layerType: 'JAPAN_PALE'
    };
    const layerInfo4 = {
      layerType: 'JAPAN_STD'
    };
    const layerInfo5 = {
      layerType: 'GOOGLE_CN'
    };
    const layerInfo6 = {
      layerType: 'GOOGLE'
    };
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    expect(newWebMapBaseObj.getBaseLayerType(layerInfo)).toBe('XYZ');
    expect(newWebMapBaseObj.getBaseLayerType(layerInfo1)).toBe('XYZ');
    expect(newWebMapBaseObj.getBaseLayerType(layerInfo2)).toBe('XYZ');
    expect(newWebMapBaseObj.getBaseLayerType(layerInfo3)).toBe('XYZ');
    expect(newWebMapBaseObj.getBaseLayerType(layerInfo4)).toBe('XYZ');
    expect(newWebMapBaseObj.getBaseLayerType(layerInfo5)).toBe('XYZ');
    expect(newWebMapBaseObj.getBaseLayerType(layerInfo6)).toBe('XYZ');
  });

  it('getMapurls is default', () => {
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    expect(newWebMapBaseObj.getMapurls().CLOUD).toBe(
      'http://t2.dituhui.com/FileService/image?map=quanguo&type=web&x={x}&y={y}&z={z}'
    );
    expect(newWebMapBaseObj.getMapurls().CLOUD_BLACK).toBe('http://t3.dituhui.com/MapService/getGdp?x={x}&y={y}&z={z}');
  });

  it('getLayerFeatures 没覆盖完', done => {
    const layer = {
      dataSource: { accessType: 'DIRECT', type: 'PORTAL_DATA', serverId: '366831804' },
      enableFields: ['SmID', '标准名称', '起点x', '起点y', '终点x', '终点y'],
      featureType: 'LINE',
      layerID: '北京市轨道交通线路',
      layerType: 'UNIQUE',
      name: '北京市轨道交通线路',
      projection: 'EPSG:4326',
      style: { strokeWidth: 6, lineDash: 'solid', strokeColor: '#3288bd', type: 'LINE', strokeOpacity: 1 },
      themeSetting: { themeField: 'SmID', customSettings: {}, colors: [] },
      visible: true
    };
    const _taskID = '123';
    const type = 'hosted';
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    newWebMapBaseObj.getLayerFeatures(layer, _taskID, type);
    setTimeout(() => {
      done();
    });
  });

  it('setFeatureInfo feature comes from dataViz', () => {
    const feature = {
      dv_v5_markerInfo: {
        dataViz_title: 'jiuzhaigou',
        title: '老虎海',
        subtitle: '树正沟景点-老虎海'
      },
      geometry: { type: 'Point', coordinates: [0, 1] },
      properties: {
        title: '老虎海',
        subtitle: '树正沟景点-老虎海',
        imgUrl: './laohuhai.png',
        description: '老虎海海拔2298米',
        index: 1
      },
      type: 'Feature'
    };
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    expect(newWebMapBaseObj.setFeatureInfo(feature)).toBe(feature.dv_v5_markerInfo);
  });

  it('setFeatureInfo', () => {
    const feature = {
      geometry: { type: 'Point', coordinates: [0, 1] },
      properties: {
        title: '老虎海',
        subtitle: '树正沟景点-老虎海',
        imgUrl: './laohuhai.png',
        description: '老虎海海拔2298米',
        index: 1
      },
      type: 'Feature'
    };
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    expect(newWebMapBaseObj.setFeatureInfo(feature)).toBe(undefined);
  });

  it('getRankStyleGroup', () => {
    const themeField = 'description';
    const parameters = {
      style: { color: '#FFFFFF', fillColor: '#000' },
      themeSetting: {
        segmentMethod: '',
        segmentCount: [],
        customSettings: {},
        minRadius: 1,
        maxRadius: 1,
        colors: ['#000', '#FFF']
      },
      properties: {
        title: '老虎海',
        subtitle: '树正沟景点-老虎海',
        imgUrl: './laohuhai.png',
        description: '',
        index: 1
      },
      type: 'Feature'
    };
    const features = [
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
    ];
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    expect(newWebMapBaseObj.getRankStyleGroup(themeField, features, parameters).length).toBe(6);
    expect(newWebMapBaseObj.getRankStyleGroup(themeField, features, parameters)[0].color).toBe('#d53e4f');
  });

  it('getRankStyleGroup filter fieldValue is ""', () => {
    const themeField = 'description';
    const parameters = {
      style: { color: '#FFFFFF', fillColor: '#000' },
      themeSetting: {
        segmentMethod: '',
        segmentCount: 2,
        customSettings: {
          0: {
            segment: {
              start: 0,
              end: 10
            }
          },
          1: {
            segment: {
              start: 0,
              end: 10
            }
          }
        },
        minRadius: 1,
        maxRadius: 1,
        colors: ['#000', '#FFF']
      },
      properties: {
        title: '老虎海',
        subtitle: '树正沟景点-老虎海',
        imgUrl: './laohuhai.png',
        description: '老虎海海拔2298米',
        index: 1
      },
      type: 'Feature'
    };
    const features = [
      {
        geometry: { type: 'Point', coordinates: [0, 1] },
        properties: {
          title: '老虎海',
          subtitle: '树正沟景点-老虎海',
          imgUrl: './laohuhai.png',
          description: '老虎海海拔2298米',
          index: 1
        },
        type: 'Feature'
      }
    ];
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    expect(newWebMapBaseObj.getRankStyleGroup(themeField, features, parameters)[0].color).toBe('#d53e4f');
  });

  it('createRankStyleSource', () => {
    const parameters = {
      style: { color: '#FFFFFF', fillColor: '#000' },
      themeSetting: {
        segmentMethod: '',
        segmentCount: '',
        customSettings: '',
        minRadius: 1,
        maxRadius: 1,
        colors: ['#000', '#FFF']
      },
      themeField: 'title',
      properties: {
        title: '老虎海',
        subtitle: '树正沟景点-老虎海',
        imgUrl: './laohuhai.png',
        description: '老虎海海拔2298米',
        index: 1
      },
      type: 'Feature'
    };
    const features = [
      {
        geometry: { type: 'Point', coordinates: [0, 1] },
        properties: {
          title: '老虎海',
          subtitle: '树正沟景点-老虎海',
          imgUrl: './laohuhai.png',
          description: '老虎海海拔2298米',
          index: 1
        },
        type: 'Feature'
      }
    ];
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    expect(newWebMapBaseObj.createRankStyleSource(parameters, features).parameters.properties.description).toBe(
      '老虎海海拔2298米'
    );
  });

  it('isMatchAdministrativeName fieldName is string', () => {
    const featureName = '张家界市';
    const fieldName = 'address';
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    expect(newWebMapBaseObj.isMatchAdministrativeName(featureName, fieldName)).toBe(false);
  });

  it('isMatchAdministrativeName fieldName is not string', () => {
    const featureName = '张家界市';
    const fieldName = undefined;
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    expect(newWebMapBaseObj.isMatchAdministrativeName(featureName, fieldName)).toBe(false);
  });

  it('getRestMapLayerInfo', () => {
    const restMapInfo = {
      bounds: {
        left: 10,
        top: 10,
        bottom: 10,
        right: 10
      },
      coordUnit: 'm',
      visibleScales: 18,
      url: 'http://test'
    };
    const layer = {
      layerType: '',
      orginEpsgCode: '',
      units: '',
      extent: '',
      visibleScales: '',
      url: '',
      sourceType: ''
    };
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    expect(newWebMapBaseObj.getRestMapLayerInfo(restMapInfo, layer).layerType).toBe('TILE');
  });

  it('handleLayerFeatures', () => {
    const layerInfo = {
      layerType: 'TIANDITU_TER',
      themeSetting: {
        segmentMethod: '',
        segmentCount: 2,
        customSettings: {
          0: {
            segment: {
              start: 0,
              end: 10
            }
          },
          1: {
            segment: {
              start: 0,
              end: 10
            }
          }
        },
        minRadius: 1,
        maxRadius: 1,
        colors: ['#000', '#FFF']
      },
      filterCondition: 'true'
    };
    const features = [
      {
        geometry: { type: 'Point', coordinates: [0, 1] },
        properties: {
          title: '老虎海',
          subtitle: '树正沟景点-老虎海',
          imgUrl: './laohuhai.png',
          description: '老虎海海拔2298米',
          index: 1
        },
        type: 'Feature'
      }
    ];
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    expect(newWebMapBaseObj.handleLayerFeatures(features, layerInfo)[0].geometry).toEqual({
      coordinates: [0, 1],
      type: 'Point'
    });
  });

  it('mergeFeatures', () => {
    const layerId = 1;
    const features = [
      {
        geometry: { type: 'Point', coordinates: [0, 1] },
        properties: {
          title: '老虎海',
          subtitle: '树正沟景点-老虎海',
          imgUrl: './laohuhai.png',
          description: '老虎海海拔2298米',
          index: 1
        },
        type: 'Feature'
      }
    ];
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    expect(newWebMapBaseObj.mergeFeatures(layerId, features)[0].geometry).toEqual({
      coordinates: [0, 1],
      type: 'Point'
    });
  });

  it('getEchartsLayerOptions', () => {
    const layerInfo = {
      layerType: 'TIANDITU_TER',
      themeSetting: {
        segmentMethod: '',
        segmentCount: 2,
        customSettings: {
          0: {
            segment: {
              start: 0,
              end: 10
            }
          },
          1: {
            segment: {
              start: 0,
              end: 10
            }
          }
        },
        minRadius: 1,
        maxRadius: 1,
        colors: ['#000', '#FFF']
      },
      filterCondition: 'true',
      from: {
        type: 'XY_FIELD',
        xField: 'title',
        yField: 'num'
      },
      to: {
        type: 'XY_FIELD',
        xField: 'title',
        yField: 'num'
      },
      labelSetting: {
        show: true
      },
      animationSetting: {
        show: true,
        constantSpeed: 300,
        symbol: 'marker',
        symbolSize: 2
      },
      lineSetting: {
        color: '#000',
        type: 'solid',
        width: 0.5,
        opacity: 1,
        curveness: ''
      }
    };
    const features = [
      {
        geometry: { type: 'Point', coordinates: [0, 1] },
        properties: [
          {
            title: '老虎海',
            subtitle: '树正沟景点-老虎海',
            imgUrl: './laohuhai.png',
            description: '老虎海海拔2298米',
            index: 1,
            from: {
              type: 'XY_FIELD',
              xField: 'title',
              yField: 'num'
            },
            to: {
              type: 'XY_FIELD',
              xField: 'title',
              yField: 'num'
            }
          }
        ],
        type: 'Feature'
      }
    ];
    const coordinateSystem = {}; // 不知道
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    expect(
      newWebMapBaseObj.getEchartsLayerOptions(layerInfo, features, coordinateSystem).series[0].effect.constantSpeed
    ).toBe(300);
  });

  it('getEchartsLayerOptions', () => {
    const layerInfo = {
      layerType: 'TIANDITU_TER',
      themeSetting: {
        segmentMethod: '',
        segmentCount: 2,
        customSettings: {
          0: {
            segment: {
              start: 0,
              end: 10
            }
          },
          1: {
            segment: {
              start: 0,
              end: 10
            }
          }
        },
        minRadius: 1,
        maxRadius: 1,
        colors: ['#000', '#FFF']
      },
      filterCondition: 'true',
      from: {
        type: 'XY_FIELD',
        xField: 'title',
        yField: 'subtitle'
      },
      to: {
        type: 'XY_FIELD',
        xField: 'title',
        yField: 'subtitle'
      },
      labelSetting: {
        show: true
      },
      animationSetting: {
        show: true,
        constantSpeed: 300,
        symbol: 'marker',
        symbolSize: 2
      },
      lineSetting: {
        color: '#000',
        type: 'solid',
        width: 0.5,
        opacity: 1,
        curveness: ''
      }
    };
    const features = [
      {
        geometry: { type: 'Point', coordinates: [0, 1] },
        properties: [
          {
            title: '老虎海',
            subtitle: '树正沟景点-老虎海',
            imgUrl: './laohuhai.png',
            description: '老虎海海拔2298米',
            index: 1
          }
        ],
        type: 'Feature'
      }
    ];
    const coordinateSystem = {}; // 不知道
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    expect(
      newWebMapBaseObj.getEchartsLayerOptions(layerInfo, features, coordinateSystem).series[0].effect.constantSpeed
    ).toBe(300);
  });

  it('getDashStyle str is solid', () => {
    const str = 'solid';
    const strokeWidth = 2;
    const type = 'array';
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    expect(newWebMapBaseObj.getDashStyle(str, strokeWidth, type)).toEqual([]);
  });

  it('getDashStyle str is dot', () => {
    const str = 'dot';
    const strokeWidth = 2;
    const type = 'array';
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    expect(newWebMapBaseObj.getDashStyle(str, strokeWidth, type)).toEqual([1, 8]);
  });

  it('getDashStyle str is dash', () => {
    const str = 'dash';
    const strokeWidth = 2;
    const type = 'array';
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    expect(newWebMapBaseObj.getDashStyle(str, strokeWidth, type)).toEqual([8, 8]);
  });

  it('getDashStyle str is dashrailway', () => {
    const str = 'dashrailway';
    const strokeWidth = 2;
    const type = 'array';
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    expect(newWebMapBaseObj.getDashStyle(str, strokeWidth, type)).toEqual([16, 24]);
  });

  it('getDashStyle str is dashdot', () => {
    const str = 'dashdot';
    const strokeWidth = 2;
    const type = 'array';
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    expect(newWebMapBaseObj.getDashStyle(str, strokeWidth, type)).toEqual([8, 8, 2, 8]);
  });

  it('getDashStyle str is longdash', () => {
    const str = 'longdash';
    const strokeWidth = 2;
    const type = 'array';
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    expect(newWebMapBaseObj.getDashStyle(str, strokeWidth, type)).toEqual([16, 8]);
  });

  it('getDashStyle str is longdashdot', () => {
    const str = 'longdashdot';
    const strokeWidth = 2;
    const type = 'array';
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    expect(newWebMapBaseObj.getDashStyle(str, strokeWidth, type)).toEqual([16, 8, 1, 8]);
  });

  it('getDashStyle no params', () => {
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    expect(newWebMapBaseObj.getDashStyle()).toEqual([]);
  });

  it('getDashStyle params str is Array', () => {
    const str = ['longdashdot'];
    const strokeWidth = 2;
    const type = 'array';
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    expect(newWebMapBaseObj.getDashStyle(str, strokeWidth, type)).toEqual(['longdashdot']);
  });

  it('getCanvasFromSVG', async (done) => {
    window.canvg = {
      default: {
        from: (ctx, url, callback) => Promise.resolve({ stop: jest.fn(), start: jest.fn() })
      }
    };
    const svgUrl = 'http://testsvg';
    const divDom = {
      appendChild: jest.fn()
    };
    const callBack = function () {};
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    expect(newWebMapBaseObj.getCanvasFromSVG(svgUrl, divDom, callBack)).toBe(undefined);
    await flushPromises();
    done();
  });

  it('getRangeStyleGroup', () => {
    const layerInfo = {
      layerType: 'TIANDITU_TER',
      themeSetting: {
        segmentMethod: '',
        segmentCount: 2,
        customSettings: {
          0: {
            segment: {
              start: 0,
              end: 10
            }
          },
          1: {
            segment: {
              start: 0,
              end: 10
            }
          }
        },
        minRadius: 1,
        maxRadius: 1,
        colors: ['#000', '#FFF'],
        themeField: 'title'
      },
      style: { color: '#000' }
    };
    const features = [
      {
        geometry: { type: 'Point', coordinates: [0, 1] },
        properties: {
          title: '老虎海',
          subtitle: '树正沟景点-老虎海',
          imgUrl: './laohuhai.png',
          description: '老虎海海拔2298米',
          index: 1
        },
        type: 'Feature'
      }
    ];
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    expect(newWebMapBaseObj.getRangeStyleGroup(layerInfo, features)[0].color).toBe('#d53e4f');
  });

  it('getUniqueStyleGroup', () => {
    const parameters = {
      layerType: 'TIANDITU_TER',
      themeSetting: {
        segmentMethod: '',
        segmentCount: 2,
        customSettings: {
          0: {
            segment: {
              start: 0,
              end: 10
            }
          },
          1: {
            segment: {
              start: 0,
              end: 10
            }
          }
        },
        minRadius: 1,
        maxRadius: 1,
        colors: ['#000', '#FFF'],
        themeField: 'title'
      },
      style: { color: '#000' }
    };
    const features = [
      {
        geometry: { type: 'Point', coordinates: [0, 1] },
        properties: {
          title: '老虎海',
          subtitle: '树正沟景点-老虎海',
          imgUrl: './laohuhai.png',
          description: '老虎海海拔2298米',
          index: 1
        },
        type: 'Feature'
      }
    ];
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    expect(newWebMapBaseObj.getUniqueStyleGroup(parameters, features)[0].value).toBe('老虎海');
  });

  it('getUniqueStyleGroup when custom line color', () => {
    const parameters = {
      layerType: 'UNIQUE',
      themeSetting: {
        "themeField": "SmID",
        "customSettings": {
          "1": {
            "strokeWidth": 2,
            "lineDash": "solid",
            "strokeColor": "#ffffff",
            "type": "LINE",
            "strokeOpacity": 1
          },
          "2": {
            "strokeWidth": 2,
            "lineDash": "solid",
            "strokeColor": "#dddddd",
            "type": "LINE",
            "strokeOpacity": 1
          },
          "3": {
            "strokeWidth": 2,
            "lineDash": "solid",
            "strokeColor": "#eeeeee",
            "type": "LINE",
            "strokeOpacity": 1
          }
        },
        "colors": [
          "#D53E4F",
          "#FC8D59",
          "#FEE08B",
          "#FFFFBF",
          "#E6F598",
          "#99D594",
          "#3288BD"
        ]
      },
      style: { color: '#000' }
    };
    const features = [
      {
        geometry: { type: 'Point', coordinates: [0, 1] },
        properties: {
          title: '老虎海',
          subtitle: '树正沟景点-老虎海',
          imgUrl: './laohuhai.png',
          description: '老虎海海拔2298米',
          SmID: 1
        },
        type: 'Feature'
      }
    ];
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    expect(newWebMapBaseObj.getUniqueStyleGroup(parameters, features)[0].color).toBe('#ffffff');
  });

  it('handleSvgColor', () => {
    const style = {
      fillColor: '#000',
      fillOpacity: 1,
      strokeOpacity: 1,
      strokeWidth: 2
    };
    const canvas = {
      getContext: () => {
        return {
          fill: jest.fn(),
          stroke: jest.fn()
        };
      }
    };
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    expect(newWebMapBaseObj.handleSvgColor(style, canvas)).toBe(undefined);
  });

  it('_createLinesData', () => {
    const layerInfo = {
      layerType: 'TIANDITU_TER',
      themeSetting: {
        segmentMethod: '',
        segmentCount: 2,
        customSettings: {
          0: {
            segment: {
              start: 0,
              end: 10
            }
          },
          1: {
            segment: {
              start: 0,
              end: 10
            }
          }
        },
        minRadius: 1,
        maxRadius: 1,
        colors: ['#000', '#FFF']
      },
      filterCondition: 'true',
      from: {
        type: 'PLACE_FIELD',
        field: 'title'
      },
      to: {
        type: 'PLACE_FIELD',
        field: 'title'
      },
      labelSetting: {
        show: true
      },
      animationSetting: {
        show: true,
        constantSpeed: 300,
        symbol: 'marker',
        symbolSize: 2
      },
      lineSetting: {
        color: '#000',
        type: 'solid',
        width: 0.5,
        opacity: 1,
        curveness: ''
      }
    };
    const properties = [
      {
        title: '老虎海',
        subtitle: '树正沟景点-老虎海',
        imgUrl: './laohuhai.png',
        description: '老虎海海拔2298米',
        index: 1,
        from: {
          type: 'XY_FIELD',
          xField: 'title',
          yField: 'num'
        },
        to: {
          type: 'XY_FIELD',
          xField: 'title',
          yField: 'num'
        }
      }
    ];
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    expect(newWebMapBaseObj._createLinesData(layerInfo, properties)).toEqual([]);
  });

  it('_createPointsData', () => {
    const lineData = [
      {
        coords: [
          [1.295350519989875e7, 4851338.019912067],
          [1.295350519989875e7, 4851338.019912067]
        ]
      }
    ];
    const layerInfo = {
      animationSetting: {
        symbol: 'pin',
        symbolSize: 15,
        show: true,
        constantSpeed: 40
      },
      dataSource: { accessType: 'DIRECT', type: 'PORTAL_DATA', serverId: '1249258329' },
      enableFields: ['SmID', 'SmX', 'SmY', 'SmLibTileID', 'SmUserID', 'SmGeometrySize', 'SmGeoPosition', '标准名称'],
      featureType: 'POINT',
      from: {
        xField: 'SmX',
        yField: 'SmY',
        type: 'XY_FIELD'
      },
      labelSetting: {
        fontFamily: '黑体',
        color: '#62AD16',
        show: true
      },
      layerID: '北京市轨道交通站点',
      layerType: 'MIGRATION',
      lineSetting: {
        curveness: 0.2,
        color: '#792b1b',
        width: 1,
        type: 'solid',
        opacity: 0.6
      },
      name: '北京市轨道交通站点',
      projection: 'EPSG:4326',
      to: {
        xField: 'SmX',
        yField: 'SmY',
        type: 'XY_FIELD'
      },
      visible: 'visible'
    };
    const properties = [
      {
        SmGeoPosition: '393216',
        SmGeometrySize: '20',
        SmID: '1',
        SmLibTileID: '1',
        SmUserID: '0',
        SmX: '1.295350519989875E7',
        SmY: '4851338.019912067',
        index: 0,
        标准名称: '长椿街站'
      }
    ];
    const result = [
      { name: undefined, value: [12953505.19989875, 4851338.019912067] },
      { name: undefined, value: [12953505.19989875, 4851338.019912067] }
    ];
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    expect(newWebMapBaseObj._createPointsData(lineData, layerInfo, properties)).toEqual(result);
  });

  it('_createOptions open animation', () => {
    const lineData = [
      {
        coords: [
          [1.295350519989875e7, 4851338.019912067],
          [1.295350519989875e7, 4851338.019912067]
        ]
      }
    ];
    const layerInfo = {
      animationSetting: {
        symbol: 'pin',
        symbolSize: 15,
        show: true,
        constantSpeed: 40
      },
      dataSource: { accessType: 'DIRECT', type: 'PORTAL_DATA', serverId: '1249258329' },
      enableFields: ['SmID', 'SmX', 'SmY', 'SmLibTileID', 'SmUserID', 'SmGeometrySize', 'SmGeoPosition', '标准名称'],
      featureType: 'POINT',
      from: {
        xField: 'SmX',
        yField: 'SmY',
        type: 'XY_FIELD'
      },
      labelSetting: {
        fontFamily: '黑体',
        color: '#62AD16',
        show: true
      },
      layerID: '北京市轨道交通站点',
      layerType: 'MIGRATION',
      lineSetting: {
        curveness: 0.2,
        color: '#792b1b',
        width: 1,
        type: 'solid',
        opacity: 0.6
      },
      name: '北京市轨道交通站点',
      projection: 'EPSG:4326',
      to: {
        xField: 'SmX',
        yField: 'SmY',
        type: 'XY_FIELD'
      },
      visible: 'visible'
    };
    const properties = [
      {
        SmGeoPosition: '393216',
        SmGeometrySize: '20',
        SmID: '1',
        SmLibTileID: '1',
        SmUserID: '0',
        SmX: '1.295350519989875E7',
        SmY: '4851338.019912067',
        index: 0,
        标准名称: '长椿街站'
      }
    ];
    const pointData = [1.295350519989875e7, 4851338.019912067];
    const coordinateSystem = 'GLMap';
    const result = {
      series: [
        {
          coordinateSystem: 'GLMap',
          data: [
            {
              coords: [
                [12953505.19989875, 4851338.019912067],
                [12953505.19989875, 4851338.019912067]
              ]
            }
          ],
          effect: { constantSpeed: 40, show: true, symbol: 'pin', symbolSize: 15, trailLength: 0 },
          lineStyle: { normal: { color: '#792b1b', curveness: 0.2, opacity: 0.6, type: 'solid', width: 1 } },
          name: 'line-series',
          type: 'lines',
          zlevel: 1
        },
        {
          coordinateSystem: 'GLMap',
          data: [12953505.19989875, 4851338.019912067],
          itemStyle: { normal: { color: '#792b1b' } },
          label: {
            normal: { color: '#62AD16', fontFamily: '黑体', formatter: '{b}', position: 'right', show: true }
          },
          name: 'point-series',
          type: 'effectScatter',
          rippleEffect: {
            brushType: 'stroke'
          },
          zlevel: 2
        }
      ]
    };
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    expect(newWebMapBaseObj._createOptions(layerInfo, lineData, pointData, coordinateSystem)).toEqual(result);
  });

  it('_createOptions close animation', () => {
    const lineData = [
      {
        coords: [
          [1.295350519989875e7, 4851338.019912067],
          [1.295350519989875e7, 4851338.019912067]
        ]
      }
    ];
    const layerInfo = {
      animationSetting: {
        symbol: 'pin',
        symbolSize: 15,
        show: false,
        constantSpeed: 40
      },
      dataSource: { accessType: 'DIRECT', type: 'PORTAL_DATA', serverId: '1249258329' },
      enableFields: ['SmID', 'SmX', 'SmY', 'SmLibTileID', 'SmUserID', 'SmGeometrySize', 'SmGeoPosition', '标准名称'],
      featureType: 'POINT',
      from: {
        xField: 'SmX',
        yField: 'SmY',
        type: 'XY_FIELD'
      },
      labelSetting: {
        fontFamily: '黑体',
        color: '#62AD16',
        show: true
      },
      layerID: '北京市轨道交通站点',
      layerType: 'MIGRATION',
      lineSetting: {
        curveness: 0.2,
        color: '#792b1b',
        width: 1,
        type: 'solid',
        opacity: 0.6
      },
      name: '北京市轨道交通站点',
      projection: 'EPSG:4326',
      to: {
        xField: 'SmX',
        yField: 'SmY',
        type: 'XY_FIELD'
      },
      visible: 'visible'
    };
    const pointData = [1.295350519989875e7, 4851338.019912067];
    const coordinateSystem = 'GLMap';
    const result = {
      series: [
        {
          coordinateSystem: 'GLMap',
          data: [
            {
              coords: [
                [12953505.19989875, 4851338.019912067],
                [12953505.19989875, 4851338.019912067]
              ]
            }
          ],
          effect: { constantSpeed: 40, show: false, symbol: 'pin', symbolSize: 15, trailLength: 0 },
          lineStyle: { normal: { color: '#792b1b', curveness: 0.2, opacity: 0.6, type: 'solid', width: 1 } },
          name: 'line-series',
          type: 'lines',
          zlevel: 1
        },
        {
          coordinateSystem: 'GLMap',
          data: [12953505.19989875, 4851338.019912067],
          itemStyle: { normal: { color: '#792b1b' } },
          label: {
            normal: { color: '#62AD16', fontFamily: '黑体', formatter: '{b}', position: 'right', show: true }
          },
          name: 'point-series',
          type: 'scatter',
          zlevel: 2
        }
      ]
    };
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    expect(newWebMapBaseObj._createOptions(layerInfo, lineData, pointData, coordinateSystem)).toEqual(result);
  });

  it('_getLayerFeaturesSucceeded', () => {
    const result = {
      features: [
        {
          geometry: { type: 'Point', coordinates: [] },
          properties: {
            SmID: '1',
            SmX: '1.295350519989875E7',
            SmY: '4851338.019912067',
            SmLibTileID: '1',
            SmUserID: '0'
          },
          type: 'Feature'
        }
      ],
      type: 'feature'
    };
    const result1 = {
      features: [
        {
          geometry: { type: 'Point', coordinates: [] },
          properties: {
            SmID: '1',
            SmX: '1.295350519989875E7',
            SmY: '4851338.019912067',
            SmLibTileID: '1',
            SmUserID: '0'
          },
          type: 'Feature'
        }
      ],
      type: 'restMap'
    };
    const result2 = {
      features: [
        {
          geometry: { type: 'Point', coordinates: [] },
          properties: {
            SmID: '1',
            SmX: '1.295350519989875E7',
            SmY: '4851338.019912067',
            SmLibTileID: '1',
            SmUserID: '0'
          },
          type: 'Feature'
        }
      ],
      type: 'mvt'
    };
    const result3 = {
      features: [
        {
          geometry: { type: 'Point', coordinates: [] },
          properties: {
            SmID: '1',
            SmX: '1.295350519989875E7',
            SmY: '4851338.019912067',
            SmLibTileID: '1',
            SmUserID: '0'
          },
          type: 'feature'
        }
      ],
      type: 'dataflow'
    };
    const result4 = {
      features: [
        {
          geometry: { type: 'Point', coordinates: [] },
          properties: {
            SmID: '1',
            SmX: '1.295350519989875E7',
            SmY: '4851338.019912067',
            SmLibTileID: '1',
            SmUserID: '0'
          },
          type: 'feature'
        }
      ],
      type: 'noServerId'
    };
    const layer = {
      animationSetting: {
        symbol: 'pin',
        symbolSize: 15,
        show: false,
        constantSpeed: 40
      },
      dataSource: { accessType: 'DIRECT', type: 'PORTAL_DATA', serverId: '1249258329' },
      enableFields: ['SmID', 'SmX', 'SmY', 'SmLibTileID', 'SmUserID', 'SmGeometrySize', 'SmGeoPosition', '标准名称'],
      featureType: 'POINT',
      from: {
        xField: 'SmX',
        yField: 'SmY',
        type: 'XY_FIELD'
      },
      labelSetting: {
        fontFamily: '黑体',
        color: '#62AD16',
        show: true
      },
      layerID: '北京市轨道交通站点',
      layerType: 'MIGRATION',
      lineSetting: {
        curveness: 0.2,
        color: '#792b1b',
        width: 1,
        type: 'solid',
        opacity: 0.6
      },
      name: '北京市轨道交通站点',
      projection: 'EPSG:4326',
      to: {
        xField: 'SmX',
        yField: 'SmY',
        type: 'XY_FIELD'
      },
      visible: 'visible'
    };
    const newWebMapBaseObj = cloneDeep(WebMapBaseObj);
    newWebMapBaseObj._initOverlayLayer = jest.fn();
    expect(newWebMapBaseObj._getLayerFeaturesSucceeded(result, layer)).toEqual(undefined);
    expect(newWebMapBaseObj._getLayerFeaturesSucceeded(result1, layer)).toEqual(undefined);
    expect(newWebMapBaseObj._getLayerFeaturesSucceeded(result2, layer)).toEqual(undefined);
    expect(newWebMapBaseObj._getLayerFeaturesSucceeded(result3, layer)).toEqual(undefined);
    expect(newWebMapBaseObj._getLayerFeaturesSucceeded(result4, layer)).toEqual(undefined);
  });
});
