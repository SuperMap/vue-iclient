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

  it('isStastic', async () => {
    const dataset = {
      "maxFeatures": 20,
      "url": "",
      "type": "geoJSON",
      "geoJSON": {
          "type": "FeatureCollection",
          "features": [
              {
                  "type": "Feature",
                  "properties": {
                      "国家": "中国",
                      "船只数量": "1",
                      "区域": "1",
                      "区域text": "北京"
                  }
              },
              {
                  "type": "Feature",
                  "properties": {
                      "国家": "中国",
                      "船只数量": "2",
                      "区域": "2",
                      "区域text": "上海"
                  }
              },
              {
                  "type": "Feature",
                  "properties": {
                      "国家": "中国",
                      "船只数量": "3",
                      "区域": "3",
                      "区域text": "成都"
                  }
              },
              {
                  "type": "Feature",
                  "properties": {
                      "国家": "俄罗斯",
                      "船只数量": "1",
                      "区域": "1",
                      "区域text": "莫斯科"
                  }
              },
              {
                  "type": "Feature",
                  "properties": {
                      "国家": "俄罗斯",
                      "船只数量": "6",
                      "区域": "2",
                      "区域text": "圣彼得堡"
                  }
              },
              {
                  "type": "Feature",
                  "properties": {
                      "国家": "美国",
                      "船只数量": "1",
                      "区域": "1",
                      "区域text": "纽约"
                  }
              }
          ]
      },
      "withCredentials": false
    }
    const datasetOptions = [
      {
          "seriesType": "bar", 
          "isStastic": true, 
          "isStack": false, 
          "xField": "国家", 
          "yField": "区域", 
          "sort": "unsort"
      }, 
      {
          "seriesType": "bar", 
          "isStastic": true, 
          "isStack": false, 
          "xField": "国家", 
          "yField": "船只数量", 
          "sort": "ascending"
      }
    ]
    echartsDataService = new EchartsDataService(dataset, datasetOptions);
    await echartsDataService.getDataOption(dataset);
    const data = echartsDataService.serieDatas.find(item => item.name === '船只数量');
    expect(data.data).toEqual([1,6,7]);
  });
  it('isStastic with string statisticFunction', async () => {
    const dataset = {
      "maxFeatures": 20,
      "url": "",
      "type": "geoJSON",
      "geoJSON": {
          "type": "FeatureCollection",
          "features": [
              {
                  "type": "Feature",
                  "properties": {
                      "国家": "中国",
                      "船只数量": "1",
                      "区域": "1",
                      "区域text": "北京"
                  }
              },
              {
                  "type": "Feature",
                  "properties": {
                      "国家": "中国",
                      "船只数量": "2",
                      "区域": "2",
                      "区域text": "上海"
                  }
              },
              {
                  "type": "Feature",
                  "properties": {
                      "国家": "中国",
                      "船只数量": "3",
                      "区域": "3",
                      "区域text": "成都"
                  }
              },
              {
                  "type": "Feature",
                  "properties": {
                      "国家": "俄罗斯",
                      "船只数量": "1",
                      "区域": "1",
                      "区域text": "莫斯科"
                  }
              },
              {
                  "type": "Feature",
                  "properties": {
                      "国家": "俄罗斯",
                      "船只数量": "6",
                      "区域": "2",
                      "区域text": "圣彼得堡"
                  }
              },
              {
                  "type": "Feature",
                  "properties": {
                      "国家": "美国",
                      "船只数量": "1",
                      "区域": "1",
                      "区域text": "纽约"
                  }
              }
          ]
      },
      "withCredentials": false
    }
    const datasetOptions = [
      {
          "seriesType": "bar", 
          "isStastic": true, 
          "statisticFunction": 'max', 
          "isStack": false, 
          "xField": "国家", 
          "yField": "船只数量", 
          "sort": "ascending"
      }
    ]
    echartsDataService = new EchartsDataService(dataset, datasetOptions);
    await echartsDataService.getDataOption(dataset);
    const data = echartsDataService.serieDatas.find(item => item.name === '船只数量');
    expect(data.data).toEqual([1,3,6]);
  });
  it('isStastic with function statisticFunction', async () => {
    const dataset = {
      "maxFeatures": 20,
      "url": "",
      "type": "geoJSON",
      "geoJSON": {
          "type": "FeatureCollection",
          "features": [
              {
                  "type": "Feature",
                  "properties": {
                      "国家": "中国",
                      "船只数量": "3",
                      "区域": "3",
                      "区域text": "成都"
                  }
              },
              {
                  "type": "Feature",
                  "properties": {
                      "国家": "俄罗斯",
                      "船只数量": "1",
                      "区域": "1",
                      "区域text": "莫斯科"
                  }
              },
              {
                "type": "Feature",
                "properties": {
                    "国家": "中国",
                    "船只数量": "2",
                    "区域": "2",
                    "区域text": "上海"
                }
            },
              {
                  "type": "Feature",
                  "properties": {
                      "国家": "俄罗斯",
                      "船只数量": "5",
                      "区域": "2",
                      "区域text": "圣彼得堡"
                  }
              },
              {
                  "type": "Feature",
                  "properties": {
                      "国家": "美国",
                      "船只数量": "1",
                      "区域": "1",
                      "区域text": "纽约"
                  }
              },
              {
                "type": "Feature",
                "properties": {
                    "国家": "中国",
                    "船只数量": "1",
                    "区域": "1",
                    "区域text": "北京"
                }
            },
          ]
      },
      "withCredentials": false
    }
    const datasetOptions = [
      {
          "seriesType": "bar", 
          "isStastic": true, 
          "statisticFunction": (fieldValues, features) =>  {
            // let newData = fieldValues.map(d => d * 10);
            // return Math.max(...newData);
            let area = 0;
            let boats = 0;
            features.forEach(feature => {
              area += parseInt(feature.properties['区域']);
              boats += parseInt(feature.properties['船只数量']);
            })
            const meanBoats = boats / area;
            return meanBoats;
          }, 
          "isStack": false, 
          "xField": "国家", 
          "yField": "船只数量", 
          "sort": "ascending"
      }
    ]
    echartsDataService = new EchartsDataService(dataset, datasetOptions);
    await echartsDataService.getDataOption(dataset);
    const data = echartsDataService.serieDatas.find(item => item.name === '船只数量');
    // expect(data.data).toEqual([10,30,60]);
    expect(data.data).toEqual([1,1,2]);
  });
  it('without datasetOptions', async () => {
    const dataset = {
      "maxFeatures": 20,
      "url": "",
      "type": "geoJSON",
      "geoJSON": {
          "type": "FeatureCollection",
          "features": [
              {
                  "type": "Feature",
                  "properties": {
                      "国家": "中国",
                      "船只数量": "1",
                      "区域": "1",
                      "区域text": "北京"
                  }
              },
              {
                  "type": "Feature",
                  "properties": {
                      "国家": "中国",
                      "船只数量": "2",
                      "区域": "2",
                      "区域text": "上海"
                  }
              },
              {
                  "type": "Feature",
                  "properties": {
                      "国家": "中国",
                      "船只数量": "3",
                      "区域": "3",
                      "区域text": "成都"
                  }
              },
              {
                  "type": "Feature",
                  "properties": {
                      "国家": "俄罗斯",
                      "船只数量": "1",
                      "区域": "1",
                      "区域text": "莫斯科"
                  }
              },
              {
                  "type": "Feature",
                  "properties": {
                      "国家": "俄罗斯",
                      "船只数量": "6",
                      "区域": "2",
                      "区域text": "圣彼得堡"
                  }
              },
              {
                  "type": "Feature",
                  "properties": {
                      "国家": "美国",
                      "船只数量": "1",
                      "区域": "1",
                      "区域text": "纽约"
                  }
              }
          ]
      },
      "withCredentials": false
    }
    const datasetOptions = []
    echartsDataService = new EchartsDataService(dataset, datasetOptions);
    await echartsDataService.getDataOption(dataset);
    expect(echartsDataService.serieDatas).toEqual([])
  });
});
