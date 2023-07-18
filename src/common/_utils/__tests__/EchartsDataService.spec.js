import EchartsDataService from '../EchartsDataService';

describe('EchartsDataService', () => {
  let echartsDataService;
  beforeEach(() => {
  })

  afterEach(() => {
    echartsDataService = null;
  })
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
});
