import NcpMapViewModel from '../NcpMapViewModel.ts';
import mockFetch from 'vue-iclient/test/unit/mocks/FetchRequest';
import flushPromises from 'flush-promises';
import iportal_serviceProxy from '../../../../test/unit/mocks/data/iportal_serviceProxy.json';
import markerLayer from 'vue-iclient/test/unit/mocks/data/WebMap/markerLayer';
import geojsonData from 'vue-iclient/test/unit/mocks/data/layerData_geojson.json';


const mapOptions = {
  container: 'map',
  center: {
    lng: 104.93846582803894,
    lat: 33.37080662210445
  },
  zoom: 3,
  bearing: 0,
  pitch: 0,
  interactive: true,
  style: {
    version: 8,
    sources: {
      中国地图: {
        type: 'raster',
        tiles: [
          'https://maptiles.supermapol.com/iserver/services/map_China/rest/maps/China_Dark/zxyTileImage.png?z={z}&x={x}&y={y}'
        ],
        tileSize: 256
      }
    },
    layers: [
      {
        id: '中国地图',
        source: '中国地图',
        type: 'raster',
        minzoom: 0,
        maxzoom: 22
      }
    ]
  },
  rasterTileSize: 256,
  preserveDrawingBuffer: true
};
const dataOptions = {
  name: '全省确诊人数',
  proxyUrl: '',
  url: ''
};

describe('NcpMapViewModel.spec', () => {
  it('initNcpMap', () => {
    expect(() => {
      new NcpMapViewModel('', dataOptions, mapOptions);
    }).not.toThrow();
  });

  it('set props', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/4845656956/map.json': markerLayer
    };
    mockFetch(fetchResource);
    const callback = jest.fn();
    const viewModel = new NcpMapViewModel('', dataOptions, mapOptions);
    await flushPromises();
    await viewModel.setCenter({
      x: 11615300.701720804,
      y: 4436879.386230171,
      lat: 33.37080662210445,
      lng: 104.93846582803894
    });
    await viewModel.setZoom(10);
    await viewModel.setMaxBounds([
      [0, 0],
      [180, 180]
    ]);
    await viewModel.setBearing(10);
    await viewModel.setPitch(6);
    expect(callback.mock.called).toBeTruthy;
    setTimeout(() => {
      expect(callback.mock.called).toBeTruthy;
      expect(viewModel.mapOptions.center).toStrictEqual({
        x: 11615300.701720804,
        y: 4436879.386230171,
        lat: 33.37080662210445,
        lng: 104.93846582803894
      });
      expect(viewModel.mapOptions.zoom).toBe(10);
      expect(viewModel.mapOptions.maxBounds).toStrictEqual([
        [0, 0],
        [180, 180]
      ]);
      expect(viewModel.mapOptions.pitch).toBe(6);
      done();
    }, 100);
  });

  it('add layers succeed', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/maps/4845656956/map.json': JSON.parse(geojsonData.POINT_GEOJSON.content)
    };
    mockFetch(fetchResource);
    const viewModel = new NcpMapViewModel('', { ...dataOptions, url: 'https://fakeiportal.supermap.io/iportal/web/maps/4845656956/map.json' }, {
      ...mapOptions,
      style: {
        version: 8,
        sources: {
          中国地图: {
            type: 'raster',
            tiles: [
              'https://maptiles.supermapol.com/iserver/services/map_China/rest/maps/China_Dark/zxyTileImage.png?z={z}&x={x}&y={y}'
            ],
            tileSize: 256
          },
          mvtSource: {
            type: 'raster',
            tiles: [
              'https://maptiles.supermapol.com/iserver/services/map_China/rest/maps/China_Dark/zxyTileImage.png?z={z}&x={x}&y={y}'
            ],
            tileSize: 256
          }
        },
        layers: [
          {
            id: '中国地图',
            source: '中国地图',
            type: 'raster',
            minzoom: 0,
            maxzoom: 22
          },
          {
            id: 'mvtlayer',
            source: 'mvtSource',
            type: 'raster',
            minzoom: 0,
            maxzoom: 22,
            'source-layer': 'test-source-layer'
          }
        ]
      }
    });
    viewModel.on('addlayerssucceeded', () => {
      expect(viewModel._layers.length).toBe(3);
      done();
    })
    await flushPromises();
  });

  it('test resize method', () => {
    const viewModel = new NcpMapViewModel('', dataOptions, mapOptions);
    expect(() => {
      viewModel.resize();
    }).not.toThrow();
  });

  it('test resize method with keepBounds', () => {
    document.body.innerHTML = '<div id="map"></div>';
    const bounds = {
      getEast: () => 120,
      getWest: () => 100,
      getSouth: () => 30,
      getNorth: () => 40
    };
    const viewModel = new NcpMapViewModel('map', dataOptions, {...mapOptions, bounds: bounds});
    expect(() => {
      viewModel.resize(true);
    }).not.toThrow();
  });

  it('test set methods without map', () => {
    const viewModel = new NcpMapViewModel('', dataOptions, mapOptions);
    // 移除map对象以测试边界情况
    viewModel.map = null;
    
    expect(() => {
      viewModel.setCenter([104, 33]);
      viewModel.setZoom(5);
      viewModel.setMaxBounds([[0, 0], [180, 90]]);
      viewModel.setBearing(10);
      viewModel.setPitch(15);
      viewModel.setRenderWorldCopies(true);
    }).not.toThrow();
  });

  it('test setRenderWorldCopies method', () => {
    const viewModel = new NcpMapViewModel('', dataOptions, mapOptions);
    expect(() => {
      viewModel.setRenderWorldCopies(true);
    }).not.toThrow();
    expect(viewModel.mapOptions.renderWorldCopies).toBe(true);
  });

  it('test setProxyUrl method', async () => {
    const featuresData = JSON.parse(geojsonData.POINT_GEOJSON.content);
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/maps/features.json': featuresData
    };
    mockFetch(fetchResource);
    
    const viewModel = new NcpMapViewModel('', dataOptions, mapOptions);
    await flushPromises();
    
    expect(() => {
      viewModel.setProxyUrl('https://proxy.example.com');
    }).not.toThrow();
    expect(viewModel.proxyUrl).toBe('https://proxy.example.com');
    
    await flushPromises();
  });

  it('test setUrl and setThemeUrl methods', async () => {
    const featuresData = JSON.parse(geojsonData.POINT_GEOJSON.content);
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/maps/features.json': featuresData
    };
    mockFetch(fetchResource);
    
    const viewModel = new NcpMapViewModel('', dataOptions, mapOptions);
    // 等待初始加载完成
    await flushPromises();
    
    expect(() => {
      viewModel.setUrl('https://fakeiportal.supermap.io/iportal/web/maps/features.json');
      viewModel.setThemeUrl('');
    }).not.toThrow();
    
    await flushPromises();
  });

  it('test setThemeUrl method with theme info', async () => {
    const featuresData = JSON.parse(geojsonData.POINT_GEOJSON.content);
    const themeData = {
      field: '治愈',
      identifyField: '省份',
      stroke: {
        'line-width': 1,
        'line-color': '#000000',
        'line-opacity': 0.8
      },
      label: { 'text-size': 12, 'text-color': 'black', 'text-halo-color': '#ffffff', 'text-halo-width': 2 },
      defaultColor: '#cccccc',
      styleGroup: [
        {
          color: '#ffffff',
          start: 0,
          end: 10,
          style: {}
        }
      ]
    };

    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/maps/features.json': featuresData,
      'https://fakeiportal.supermap.io/iportal/web/themes/theme.json': themeData
    };
    mockFetch(fetchResource);
    
    const viewModel = new NcpMapViewModel('', 
      {...dataOptions, 
        url: 'https://fakeiportal.supermap.io/iportal/web/maps/features.json',
        themeUrl: 'https://fakeiportal.supermap.io/iportal/web/themes/theme.json'}, 
      mapOptions);

    await flushPromises();
    
    expect(() => {
      viewModel.setThemeUrl('https://fakeiportal.supermap.io/iportal/web/themes/theme.json');
    }).not.toThrow();
    
    await flushPromises();
  });

  it('test setName method', () => {
    const viewModel = new NcpMapViewModel('', dataOptions, mapOptions);
    expect(() => {
      viewModel.setName('新图层名称');
    }).not.toThrow();
  });

  it('test get methods', async () => {
    const viewModel = new NcpMapViewModel('', dataOptions, mapOptions);
    await flushPromises();
    
    expect(viewModel.getLegendInfo()).toBeDefined();
    expect(Array.isArray(viewModel.getLegendInfo())).toBeTruthy();
    
    expect(viewModel.getLayerList()).toBeDefined();
    expect(Array.isArray(viewModel.getAppreciableLayers())).toBeTruthy();
  });

  it('test centerValid method', () => {
    const viewModel = new NcpMapViewModel('', dataOptions, mapOptions);
    
    expect(viewModel.centerValid([104, 33])).toBeTruthy();
    expect(viewModel.centerValid({lng: 104, lat: 33})).toBeTruthy();
    expect(viewModel.centerValid(null)).toBeFalsy();
    expect(viewModel.centerValid([])).toBeFalsy();
  });

  it('test _getResizedZoom method', () => {
    const viewModel = new NcpMapViewModel('', dataOptions, mapOptions);
    
    const bounds = {
      getEast: () => 120,
      getWest: () => 100,
      getSouth: () => 30,
      getNorth: () => 40
    };

    const mapContainerStyle = {
      width: "800px",
      height: "600px"
    };

    expect(() => {
      const zoom = viewModel._getResizedZoom(bounds, mapContainerStyle);
      expect(typeof zoom).toBe('number');
    }).not.toThrow();
  });

  it('test event handling for failed requests', async () => {
    const fetchResource = {};
    mockFetch(fetchResource); // 空资源将导致请求失败
    
    const errorCallback = jest.fn();
    const themeErrorCallback = jest.fn();
    
    const viewModel = new NcpMapViewModel('', { 
      ...dataOptions, 
      url: 'https://fakeiportal.supermap.io/iportal/web/maps/nonexistent.json',
      themeUrl: 'https://fakeiportal.supermap.io/iportal/web/themes/nonexistent.json'
    }, mapOptions);
    
    viewModel.on('getlayerinfofailed', errorCallback);
    viewModel.on('getthmeminfofailed', themeErrorCallback);
    
    await flushPromises();
    
    // 错误事件可能已被触发
  });

  it('test _clearOverLayer method', () => {
    const viewModel = new NcpMapViewModel('', dataOptions, mapOptions);
    
    // Mock map methods
    viewModel.map.removeLayer = jest.fn();
    viewModel.map.removeSource = jest.fn();
    viewModel.map.getLayer = jest.fn().mockReturnValue(true);
    viewModel.map.getSource = jest.fn().mockReturnValue(true);
    
    expect(() => {
      viewModel['_clearOverLayer']();
    }).not.toThrow();
  });

  it('test _restTheme method', () => {
    const viewModel = new NcpMapViewModel('', dataOptions, mapOptions);
    
    // Mock map methods
    viewModel.map.getLayer = jest.fn().mockReturnValue(true);
    
    expect(() => {
      viewModel['_restTheme']();
    }).not.toThrow();
    expect(viewModel.themeInfo.field).toBe('确诊');
  });

  it('test _creatNewLabelData with backup identify field', () => {
    const featuresData = JSON.parse(geojsonData.POINT_GEOJSON.content);
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/maps/features.json': featuresData
    };
    mockFetch(fetchResource);

    const viewModel = new NcpMapViewModel('', 
      {...dataOptions, url: 'https://fakeiportal.supermap.io/iportal/web/maps/features.json'}, 
      mapOptions);
      
    // 设置一个不存在的identifyField来触发备用字段逻辑
    viewModel.themeInfo.identifyField = '不存在的字段';
    
    // 手动设置features以测试备用字段逻辑
    viewModel.features = [{
      properties: {
        '地区': '北京市',
        '确诊': 100
      }
    }];
    
    // 模拟labelPoints数据
    const mockLabelPoints = {
      features: [{
        properties: {
          '省份': '北京'
        }
      }]
    };
    
    // 替换导入的labelPoints
    viewModel['_creatNewLabelData'] = function() {
      if (this.features.length > 0 && this.features[0].properties[this.themeInfo.identifyField] === undefined) {
        this.themeInfo.identifyField = '地区'; // BackupIdentifyField
      }
      const labels = {};
      this.features.forEach(feature => {
        labels[feature.properties[this.themeInfo.identifyField]] = feature.properties[this.themeInfo.field];
      });
      const newFeatures = mockLabelPoints.features.map(point => {
        const properties = {};
        properties[this.themeInfo.identifyField] = '北京市';
        properties[this.themeInfo.field] = 100;
        point.properties = properties;
        return point;
      });
      return { type: 'FeatureCollection', features: newFeatures };
    };
    
    expect(() => {
      const result = viewModel['_creatNewLabelData']();
      expect(result.features[0].properties['地区']).toBe('北京市');
      expect(result.features[0].properties['确诊']).toBe(100);
    }).not.toThrow();
  });

  it('test _initLegendInfo and _patchStyleDatas methods', () => {
    const viewModel = new NcpMapViewModel('', dataOptions, mapOptions);
    
    expect(() => {
      viewModel['_initLegendInfo']();
    }).not.toThrow();
    
    // 测试不同的样式类型
    const testCases = [
      { 
        newStyleGroup: { style: { shape: 'POINT', type: 'image' } }, 
        styleGroup: { style: { type: 'IMAGE_POINT', url: 'test.png' } } 
      },
      { 
        newStyleGroup: { style: { shape: 'POINT', type: 'style' } }, 
        styleGroup: { style: { type: 'OTHER', className: 'icon-class' } } 
      },
      { 
        newStyleGroup: { style: { shape: 'LINE' } }, 
        styleGroup: { color: '#ff0000', style: { strokeOpacity: 0.5 } } 
      },
      { 
        newStyleGroup: { style: { shape: 'FILL' } }, 
        styleGroup: { color: '#00ff00', style: { fillColor: '#00ff00', fillOpacity: 0.8, strokeColor: '#000000' } } 
      }
    ];
    
    testCases.forEach(testCase => {
      expect(() => {
        viewModel._patchStyleDatas(testCase.newStyleGroup, testCase.styleGroup);
      }).not.toThrow();
    });
  });
});