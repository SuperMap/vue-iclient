import AttributesViewModel from '../AttributesViewModel.ts';

describe('AttributesViewModel.ts', () => {
  const options = {
    associateWithMap: {
      centerToFeature: false,
      enabled: true,
      zoomToFeature: false
    },
    dataset: undefined,
    fieldConfigs: [
      { value: '最低气温', visible: false },
      { value: '年均降雨_Num', visible: false },
      { value: 'lon', visible: true, title: '经度' },
      { value: 'lat', visible: true, title: '纬度' }
    ],
    layerName: '全国671个气象站观测数据',
    layerStyle: {
      circle: {},
      fill: {},
      line: {},
      stokeLine: {}
    },
    lazy: true,
    mapTarget: undefined,
    paginationOptions: {
      defaultCurrent: 1,
      pageSize: 15
    },
    statistics: {
      showSelect: true,
      showTotal: true
    },
    table: {
      pagination: {
        pageSize: 15,
        defaultCurrent: 1
      },
      showBorder: true,
      showHeader: true
    },
    textColor: undefined,
    title: undefined,
    toolbar: {
      enabled: true,
      showClearSelected: true,
      showColumnsControl: true,
      showRefresh: true,
      showZoomToFeature: true
    }
  };
  const layerStyleOptions = {
    circle: {
      layout: {
        visibility: 'visible'
      },
      paint: {
        'circle-blur': 0,
        'circle-color': '#409eff',
        'circle-opacity': 0.6,
        'circle-pitch-alignment': 'viewport',
        'circle-pitch-scale': 'map',
        'circle-radius': 8,
        'circle-stroke-color': '#409eff',
        'circle-stroke-opacity': 1,
        'circle-stroke-width': 2,
        'circle-translate': [0, 0],
        'circle-translate-anchor': 'map'
      }
    },
    fill: {
      layout: {
        visibility: 'visible'
      },
      paint: {
        'fill-antialias': true,
        'fill-color': '#409eff',
        'fill-opacity': 0.6,
        'fill-outline-color': '#409eff',
        'fill-translate': [0, 0],
        'fill-translate-anchor': 'map'
      }
    },
    line: {
      layout: {
        'line-cap': 'butt',
        'line-join': 'miter',
        visibility: 'visible'
      },
      paint: {
        'line-blur': 1,
        'line-color': '#409eff',
        'line-opacity': 1,
        'line-width': 3
      }
    },
    stokeLine: {
      layout: {
        'line-blur': 1,
        'line-color': '#409eff',
        'line-opacity': 1,
        'line-width': 3
      },
      paint: {
        'line-blur': 1,
        'line-color': '#409eff',
        'line-opacity': 1,
        'line-width': 3
      }
    }
  };

  it('setLayerName', () => {
    const viewModel = new AttributesViewModel(options);
    const layerName = 'UTLayer';
    viewModel.setLayerName(layerName);
    expect(viewModel.layerName).toBe('UTLayer');
  });

  it('setDataset', () => {
    const nextOption = {
      ...options,
      associateWithMap: {
        enabled: false,
        centerToFeature: false,
        zoomToFeature: false
      }
    };
    const viewModel = new AttributesViewModel(nextOption);
    const dataset = {
      type: 'geoJSON',
      geoJSON: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              coordinates: [1, 1],
              type: 'Point'
            },
            properties: {
              SmID: 0,
              index: 0,
              站台: '满洲里',
              省份: '内蒙古3'
            }
          }
        ]
      }
    };
    viewModel.setDataset(dataset);
    expect(viewModel.dataset).toBe(dataset);
  });

  it('setLazy', async () => {
    const nextOption = {
      ...options,
      dataset: {
        type: 'iServer',
        url: 'http://test'
      },
      searchText: '漠河',
      searchedColumn: '站台',
      sorter: {
        field: '温度',
        order: 'ascend'
      }
    };
    const viewModel = new AttributesViewModel(nextOption);
    const lazy = true;
    viewModel.setLazy(lazy);
    expect(viewModel.lazy).toBe(true);
  });

  it('setsorter', () => {
    const viewModel = new AttributesViewModel(options);
    const sorter = () => jest.fn();
    viewModel.setSorter(sorter);
    expect(viewModel.sorter).toBe(sorter);
  });

  it('associateWithMap', () => {
    const viewModel = new AttributesViewModel(options);
    const associateWithMap = {
      enabled: true,
      zoomToFeature: true,
      centerToFeature: true
    };
    const spy = jest.spyOn(viewModel, 'selectLayerFn');
    viewModel.setAssociateWithMap(associateWithMap);
    expect(viewModel.associateWithMap).toBe(associateWithMap);
  });

  it('setFieldInfo', () => {
    const viewModel = new AttributesViewModel(options);
    const fieldConfigs = { value: '最低气温', visible: false };
    viewModel.setFieldInfo(fieldConfigs);
    expect(viewModel.fieldConfigs).toBe(fieldConfigs);
  });

  it('add MultiPoint Overlays to map', () => {
    const nextOption = {
      ...options,
      layerName: '全国671个气象站观测数据-strokeLine',
      map: {
        getLayer: layerName => {
          if (layerName === '全国671个气象站观测数据-strokeLine') {
            return {
              type: 'line',
              id: '全国671个气象站观测数据-strokeLine',
              paint: {
                _properties: {},
                _values: {}
              }
            };
          } else {
            return;
          }
        },
        getPaintProperty: () => jest.fn(),
        removeLayer: () => jest.fn(),
        setFilter: () => jest.fn(),
        addLayer: () => jest.fn(),
        getBounds: () => {
          return {
            _ne: { lng: 0, lat: 1 },
            _sw: { lng: 0, lat: 1 },
            contains: () => true
          };
        }
      },
      layerStyle: layerStyleOptions,
      featureMap: {
        0: {
          geometry: { coordinates: [[[0, 1]]], type: 'MultiPoint' },
          id: 1,
          properties: {
            SmID: '1',
            index: '0',
            省份: '黑龙江',
            站台: '漠河'
          },
          type: 'Feature'
        }
      }
    };
    const viewModel = new AttributesViewModel(nextOption);
    const spy = jest.spyOn(viewModel.map, 'addLayer');
    const selectedKeys = [0];
    viewModel.addOverlaysToMap(selectedKeys);
    expect(spy).toBeCalled();
  });

  it('add Polygon Overlays to map', () => {
    const nextOption = {
      ...options,
      layerName: '全国671个气象站观测数据-strokeLine',
      map: {
        getLayer: layerName => {
          if (layerName === '全国671个气象站观测数据-strokeLine') {
            return {
              type: 'line',
              id: '全国671个气象站观测数据-strokeLine',
              paint: {
                _properties: {},
                _values: {}
              }
            };
          } else {
            return;
          }
        },
        getPaintProperty: () => jest.fn(),
        removeLayer: () => jest.fn(),
        setFilter: () => jest.fn(),
        addLayer: () => jest.fn(),
        getBounds: () => {
          return {
            _ne: { lng: 0, lat: 1 },
            _sw: { lng: 0, lat: 1 },
            contains: () => true
          };
        }
      },
      layerStyle: layerStyleOptions,
      featureMap: {
        0: {
          geometry: { coordinates: [[[0, 1]]], type: 'Polygon' },
          id: 1,
          properties: {
            SmID: 1,
            index: '0',
            省份: '黑龙江',
            站台: '漠河'
          },
          type: 'Feature'
        }
      }
    };
    const viewModel = new AttributesViewModel(nextOption);
    const spy = jest.spyOn(viewModel.map, 'addLayer');
    const selectedKeys = [0];
    viewModel.addOverlaysToMap(selectedKeys);
    expect(spy).toBeCalled();
  });

  it('add MultiPolygon Overlays to map', () => {
    const nextOption = {
      ...options,
      layerName: '全国671个气象站观测数据-strokeLine',
      map: {
        getLayer: layerName => {
          if (layerName === '全国671个气象站观测数据-strokeLine') {
            return {
              type: 'line',
              id: '全国671个气象站观测数据-strokeLine',
              paint: {
                _properties: {},
                _values: {}
              }
            };
          } else {
            return;
          }
        },
        getPaintProperty: () => jest.fn(),
        removeLayer: () => jest.fn(),
        setFilter: () => jest.fn(),
        addLayer: () => jest.fn(),
        getBounds: () => {
          return {
            _ne: { lng: 0, lat: 1 },
            _sw: { lng: 0, lat: 1 },
            contains: () => true
          };
        }
      },
      layerStyle: layerStyleOptions,
      featureMap: {
        0: {
          geometry: { coordinates: [[[0, 1]]], type: 'MultiPolygon' },
          id: 1,
          properties: {
            SmID: 1,
            index: '0',
            省份: '黑龙江',
            站台: '漠河'
          },
          type: 'Feature'
        }
      }
    };
    const viewModel = new AttributesViewModel(nextOption);
    const spy = jest.spyOn(viewModel.map, 'addLayer');
    const selectedKeys = [0];
    viewModel.addOverlaysToMap(selectedKeys);
    expect(spy).toBeCalled();
  });

  it('add MultiPolygon Overlays to map by attributesTitle', () => {
    const nextOption = {
      ...options,
      map: {
        getLayer: () => undefined,
        getSource: () => {
          return {
            setData: () => jest.fn()
          };
        },
        addLayer: () => jest.fn(),
        getBounds: () => {
          return {
            contains: () => true
          };
        }
      },
      featureMap: {
        0: {
          geometry: { coordinates: [0, 1], type: 'Point' },
          id: 1,
          properties: {
            SmID: 1,
            index: '0',
            省份: '黑龙江',
            站台: '漠河'
          },
          type: 'Feature'
        }
      }
    };
    const viewModel = new AttributesViewModel(nextOption);
    const spy = jest.spyOn(viewModel.map, 'addLayer');
    const selectedKeys = [0];
    const attributesTitle = '全国671个气象站观测数据';
    viewModel.addOverlaysToMap(selectedKeys, layerStyleOptions, attributesTitle);
    expect(spy).toBeCalled();
  });

  it('add MultiLineString Overlays to map by attributesTitle', () => {
    const nextOption = {
      ...options,
      map: {
        getLayer: () => undefined,
        getSource: () => undefined,
        addSource: () => jest.fn(),
        addLayer: () => jest.fn(),
        getBounds: () => {
          return {
            contains: () => true
          };
        }
      },
      featureMap: {
        0: {
          geometry: { coordinates: [[[0, 1]]], type: 'MultiLineString' },
          id: 1,
          properties: {
            SmID: 1,
            index: '0',
            省份: '黑龙江',
            站台: '漠河'
          },
          type: 'Feature'
        }
      }
    };
    const viewModel = new AttributesViewModel(nextOption);
    const spy = jest.spyOn(viewModel.map, 'addLayer');
    const selectedKeys = [0];
    const attributesTitle = '全国671个气象站观测数据';
    viewModel.addOverlaysToMap(selectedKeys, layerStyleOptions, attributesTitle);
    expect(spy).toBeCalled();
  });
  it('add Polygon Overlays to map', () => {
    const headers = {
      Layer: '中学1',
      LayerOn: '1',
      LineWidth: '0',
      Ctype: null,
      Ctype1: [],
      Ctype2: undefined,
      Ctype3: '',
      Ctype4: {},
      key: 0
    };
    const viewModel = new AttributesViewModel(options);
    const columns = viewModel.toTableColumns(headers);
    columns.forEach((element, index) => {
      if([1, 2, 8].includes(index)){
        expect(typeof element.sorter).toBe('function');
      }else {
        expect(element.sorter).toBe(undefined);
      }
    });
  });
});
