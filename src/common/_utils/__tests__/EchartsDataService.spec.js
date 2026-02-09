import EchartsDataService from '../EchartsDataService';

describe('EchartsDataService', () => {
  let echartsDataService;
  beforeEach(() => {});

  afterEach(() => {
    echartsDataService = null;
  });
  it('test radar', async () => {
    const dataset = {
      maxFeatures: 20,
      url: '',
      withCredentials: false,
      type: 'geoJSON',
      geoJSON: {
        type: 'FeatureCollection',
        features: [
          {
            properties: {
              date: '印度',
              sale: 45.29
            }
          },
          {
            properties: {
              date: '越南',
              sale: 186.47
            }
          },
          {
            properties: {
              date: '印尼',
              sale: 40.42
            }
          },
          {
            properties: {
              date: '新加坡',
              sale: 338.31
            }
          },
          {
            properties: {
              date: '波兰',
              sale: 112.45
            }
          },
          {
            properties: {
              date: '沙特',
              sale: 59.12
            }
          },
          {
            properties: {
              date: '马拉西亚',
              sale: 130.57
            }
          },
          {
            properties: {
              date: '捷克',
              sale: 142.5
            }
          },
          {
            properties: {
              date: '俄罗斯',
              sale: 52.17
            }
          },
          {
            properties: {
              date: '伊朗',
              sale: 44.37
            }
          }
        ]
      }
    };
    const datasetOptions = [
      {
        xField: 'date',
        yField: 'sale',
        sort: 'unsort',
        seriesType: 'radar'
      }
    ];
    echartsDataService = new EchartsDataService(dataset, datasetOptions);
    expect(echartsDataService.dataset).toEqual(dataset);
    expect(echartsDataService.datasetOptions).toEqual(datasetOptions);
    const options = await echartsDataService.getDataOption(dataset);
    expect(options).toHaveProperty('radar');
  });

  it('isStastic', async () => {
    const dataset = {
      maxFeatures: 20,
      url: '',
      type: 'geoJSON',
      geoJSON: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              国家: '中国',
              船只数量: '1',
              区域: '1',
              区域text: '北京'
            }
          },
          {
            type: 'Feature',
            properties: {
              国家: '中国',
              船只数量: '2',
              区域: '2',
              区域text: '上海'
            }
          },
          {
            type: 'Feature',
            properties: {
              国家: '中国',
              船只数量: '3',
              区域: '3',
              区域text: '成都'
            }
          },
          {
            type: 'Feature',
            properties: {
              国家: '俄罗斯',
              船只数量: '1',
              区域: '1',
              区域text: '莫斯科'
            }
          },
          {
            type: 'Feature',
            properties: {
              国家: '俄罗斯',
              船只数量: '6',
              区域: '2',
              区域text: '圣彼得堡'
            }
          },
          {
            type: 'Feature',
            properties: {
              国家: '美国',
              船只数量: '1',
              区域: '1',
              区域text: '纽约'
            }
          }
        ]
      },
      withCredentials: false
    };
    const datasetOptions = [
      {
        seriesType: 'bar',
        isStastic: true,
        isStack: false,
        xField: '国家',
        yField: '区域',
        sort: 'unsort'
      },
      {
        seriesType: 'bar',
        isStastic: true,
        isStack: false,
        xField: '国家',
        yField: '船只数量',
        sort: 'ascending'
      }
    ];
    echartsDataService = new EchartsDataService(dataset, datasetOptions);
    await echartsDataService.getDataOption(dataset);
    const data = echartsDataService.serieDatas.find(item => item.name === '船只数量');
    expect(data.data).toEqual([1, 6, 7]);
  });
  it('isStastic with string getStatisticOriginData', async () => {
    const dataset = {
      maxFeatures: 20,
      url: '',
      type: 'geoJSON',
      geoJSON: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              国家: '中国',
              船只数量: '1',
              区域: '1',
              区域text: '北京'
            }
          },
          {
            type: 'Feature',
            properties: {
              国家: '中国',
              船只数量: '2',
              区域: '2',
              区域text: '上海'
            }
          },
          {
            type: 'Feature',
            properties: {
              国家: '中国',
              船只数量: '3',
              区域: '3',
              区域text: '成都'
            }
          },
          {
            type: 'Feature',
            properties: {
              国家: '俄罗斯',
              船只数量: '1',
              区域: '1',
              区域text: '莫斯科'
            }
          },
          {
            type: 'Feature',
            properties: {
              国家: '俄罗斯',
              船只数量: '6',
              区域: '2',
              区域text: '圣彼得堡'
            }
          },
          {
            type: 'Feature',
            properties: {
              国家: '美国',
              船只数量: '1',
              区域: '1',
              区域text: '纽约'
            }
          }
        ]
      },
      withCredentials: false
    };
    const datasetOptions = [
      {
        seriesType: 'bar',
        isStastic: true,
        statisticFunction: 'max',
        isStack: false,
        xField: '国家',
        yField: '船只数量',
        sort: 'ascending'
      }
    ];
    echartsDataService = new EchartsDataService(dataset, datasetOptions);
    await echartsDataService.getDataOption(dataset);
    const res = await echartsDataService.getStatisticOriginData(datasetOptions, dataset);
    const data = echartsDataService.serieDatas.find(item => item.name === '船只数量');
    expect(data.data).toEqual([1, 3, 6]);
    expect(res.get('美国')).toEqual([
      { properties: { 区域: '1', 区域text: '纽约', 国家: '美国', 船只数量: '1' }, type: 'Feature' }
    ]);
    expect(res.get('中国')).toEqual([
      { properties: { 区域: '1', 区域text: '北京', 国家: '中国', 船只数量: '1' }, type: 'Feature' },
      { properties: { 区域: '2', 区域text: '上海', 国家: '中国', 船只数量: '2' }, type: 'Feature' },
      { properties: { 区域: '3', 区域text: '成都', 国家: '中国', 船只数量: '3' }, type: 'Feature' }
    ]);
    expect(res.get('俄罗斯')).toEqual([
      { properties: { 区域: '1', 区域text: '莫斯科', 国家: '俄罗斯', 船只数量: '1' }, type: 'Feature' },
      { properties: { 区域: '2', 区域text: '圣彼得堡', 国家: '俄罗斯', 船只数量: '6' }, type: 'Feature' }
    ]);
  });
  it('isStastic with function statisticFunction', async () => {
    const dataset = {
      maxFeatures: 20,
      url: '',
      type: 'geoJSON',
      geoJSON: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              国家: '中国',
              船只数量: '3',
              区域: '3',
              区域text: '成都'
            }
          },
          {
            type: 'Feature',
            properties: {
              国家: '俄罗斯',
              船只数量: '1',
              区域: '1',
              区域text: '莫斯科'
            }
          },
          {
            type: 'Feature',
            properties: {
              国家: '中国',
              船只数量: '2',
              区域: '2',
              区域text: '上海'
            }
          },
          {
            type: 'Feature',
            properties: {
              国家: '俄罗斯',
              船只数量: '5',
              区域: '2',
              区域text: '圣彼得堡'
            }
          },
          {
            type: 'Feature',
            properties: {
              国家: '美国',
              船只数量: '1',
              区域: '1',
              区域text: '纽约'
            }
          },
          {
            type: 'Feature',
            properties: {
              国家: '中国',
              船只数量: '1',
              区域: '1',
              区域text: '北京'
            }
          }
        ]
      },
      withCredentials: false
    };
    const datasetOptions = [
      {
        seriesType: 'bar',
        isStastic: true,
        statisticFunction: (fieldValues, features) => {
          // let newData = fieldValues.map(d => d * 10);
          // return Math.max(...newData);
          let area = 0;
          let boats = 0;
          features.forEach(feature => {
            area += parseInt(feature.properties['区域']);
            boats += parseInt(feature.properties['船只数量']);
          });
          const meanBoats = boats / area;
          return meanBoats;
        },
        isStack: false,
        xField: '国家',
        yField: '船只数量',
        sort: 'ascending'
      }
    ];
    echartsDataService = new EchartsDataService(dataset, datasetOptions);
    await echartsDataService.getDataOption(dataset);
    const data = echartsDataService.serieDatas.find(item => item.name === '船只数量');
    // expect(data.data).toEqual([10,30,60]);
    expect(data.data).toEqual([1, 1, 2]);
  });
  it('without datasetOptions', async () => {
    const dataset = {
      maxFeatures: 20,
      url: '',
      type: 'geoJSON',
      geoJSON: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              国家: '中国',
              船只数量: '1',
              区域: '1',
              区域text: '北京'
            }
          },
          {
            type: 'Feature',
            properties: {
              国家: '中国',
              船只数量: '2',
              区域: '2',
              区域text: '上海'
            }
          },
          {
            type: 'Feature',
            properties: {
              国家: '中国',
              船只数量: '3',
              区域: '3',
              区域text: '成都'
            }
          },
          {
            type: 'Feature',
            properties: {
              国家: '俄罗斯',
              船只数量: '1',
              区域: '1',
              区域text: '莫斯科'
            }
          },
          {
            type: 'Feature',
            properties: {
              国家: '俄罗斯',
              船只数量: '6',
              区域: '2',
              区域text: '圣彼得堡'
            }
          },
          {
            type: 'Feature',
            properties: {
              国家: '美国',
              船只数量: '1',
              区域: '1',
              区域text: '纽约'
            }
          }
        ]
      },
      withCredentials: false
    };
    const datasetOptions = [];
    echartsDataService = new EchartsDataService(dataset, datasetOptions);
    await echartsDataService.getDataOption(dataset);
    expect(echartsDataService.serieDatas).toEqual([]);
  });
  describe('EchartsDataService._createStatisticOriginData', () => {
    let echartsDataService;

    beforeEach(() => {
      // 创建EchartsDataService实例
      const dataset = {
        type: 'iServer',
        url: 'https://example.com/service',
        queryInfo: {}
      };

      const datasetOptions = [
        {
          seriesType: 'bar',
          xField: 'country',
          yField: 'population'
        }
      ];

      echartsDataService = new EchartsDataService(dataset, datasetOptions);

      // 设置默认的statisticDataCache
      echartsDataService.statisticDataCache = [
        { country: 'China', population: 1400000000 },
        { country: 'India', population: 1380000000 },
        { country: 'USA', population: 330000000 }
      ];
    });

    it('should create statistic origin data with all parameters provided', () => {
      // 准备测试数据
      const data = {
        features: [
          { properties: { country: 'China', population: 1400000000, capital: 'Beijing' } },
          { properties: { country: 'China', population: 1400000000, capital: 'Beijing' } },
          { properties: { country: 'India', population: 1380000000, capital: 'New Delhi' } },
          { properties: { country: 'USA', population: 330000000, capital: 'Washington' } },
          { properties: { country: 'USA', population: 330000000, capital: 'Washington' } },
          { properties: { country: 'USA', population: 330000000, capital: 'Washington' } }
        ]
      };

      const datasetOptions = [
        {
          seriesType: 'bar',
          xField: 'country',
          yField: 'population'
        }
      ];

      const features = [
        { country: 'China', population: 1400000000 },
        { country: 'India', population: 1380000000 },
        { country: 'USA', population: 330000000 }
      ];

      // 调用方法
      const result = echartsDataService._createStatisticOriginData(data, datasetOptions, features);

      // 验证结果
      expect(result instanceof Map).toBe(true);
      expect(result.size).toBe(3);
      expect(result.get('China')).toHaveLength(2);
      expect(result.get('India')).toHaveLength(1);
      expect(result.get('USA')).toHaveLength(3);

      // 验证原始features的属性
      expect(result.get('China')[0].properties.capital).toBe('Beijing');
      expect(result.get('India')[0].properties.capital).toBe('New Delhi');
      expect(result.get('USA')[0].properties.capital).toBe('Washington');
    });

    it('should use default datasetOptions and statisticDataCache when not provided', () => {
      // 准备测试数据
      const data = {
        features: [
          { properties: { country: 'China', population: 1400000000 } },
          { properties: { country: 'India', population: 1380000000 } },
          { properties: { country: 'USA', population: 330000000 } }
        ]
      };

      // 调用方法，不提供datasetOptions和features
      const result = echartsDataService._createStatisticOriginData(data);

      // 验证结果
      expect(result instanceof Map).toBe(true);
      expect(result.size).toBe(3);
      expect(result.get('China')).toHaveLength(1);
      expect(result.get('India')).toHaveLength(1);
      expect(result.get('USA')).toHaveLength(1);
    });

    it('should handle null or undefined features parameter', () => {
      // 准备测试数据
      const data = {
        features: [
          { properties: { country: 'China', population: 1400000000 } },
          { properties: { country: 'India', population: 1380000000 } }
        ]
      };

      // 调用方法，features为null
      const result1 = echartsDataService._createStatisticOriginData(data, undefined, null);
      expect(result1 instanceof Map).toBe(true);
      expect(result1.size).toBe(0);

      // 调用方法，features为undefined
      const result2 = echartsDataService._createStatisticOriginData(data, undefined, undefined);
      expect(result2 instanceof Map).toBe(true);
      expect(result2.size).toBe(3); // 使用默认的statisticDataCache
    });

    it('should handle empty data.features array', () => {
      // 准备测试数据，data.features为空
      const data = {
        features: []
      };

      const features = [
        { country: 'China', population: 1400000000 },
        { country: 'India', population: 1380000000 }
      ];

      // 调用方法
      const result = echartsDataService._createStatisticOriginData(data, undefined, features);

      // 验证结果
      expect(result instanceof Map).toBe(true);
      expect(result.size).toBe(2);
      expect(result.get('China')).toHaveLength(0);
      expect(result.get('India')).toHaveLength(0);
    });

    it('should handle when xField value not found in data.features', () => {
      // 准备测试数据
      const data = {
        features: [
          { properties: { country: 'China', population: 1400000000 } },
          { properties: { country: 'India', population: 1380000000 } }
        ]
      };

      const features = [
        { country: 'China', population: 1400000000 },
        { country: 'Japan', population: 126000000 } // Japan不存在于data.features中
      ];

      // 调用方法
      const result = echartsDataService._createStatisticOriginData(data, undefined, features);

      // 验证结果
      expect(result instanceof Map).toBe(true);
      expect(result.size).toBe(2);
      expect(result.get('China')).toHaveLength(1);
      expect(result.get('Japan')).toHaveLength(0); // Japan对应的数组为空
    });
  });
});
