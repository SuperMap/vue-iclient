import { mount, config } from '@vue/test-utils';
import SmWebMap from '../../web-map/WebMap.vue';
import SmChart from '../Chart.vue';
import mapEvent from '@types_mapboxgl/map-event';
config.stubs.transition = false;

describe('Chart', () => {
  let wrapper;
  let mapWrapper;
  let iportalDataSet = {
    type: 'iPortal', //iServer iPortal
    url: 'https://fakeiportal.supermap.io/iportal/web/datas/123',
    queryInfo: {
      maxFeatures: 20
    }
  };

  beforeEach(() => {
    mapEvent.firstMapTarget = null;
    mapEvent.$options.mapCache = {};
    mapEvent.$options.webMapCache = {};
    wrapper = null;
    mapWrapper = null;
    mapWrapper = mount(SmWebMap, {
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
      }
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
    if (mapWrapper) {
      mapWrapper.destroy();
    }
  });

  it('bar', done => {
    wrapper = mount(SmChart, {
      propsData: {
        mapTarget: 'map',
        dataset: iportalDataSet,
        echartOptions: {
          legend: {
            data: ['2016起降架次（架次）', '2017起降架次（架次）']
          }, //与yField数据一致
          tooltip: {
            formatter: '{b0}: {c0}'
          },
          grid: {
            top: 30,
            bottom: 60,
            left: 60,
            right: 30
          }
        },
        chartStyle: {
          position: 'absolute',
          bottom: '10px',
          right: '10px'
        },
        datasetOptions: [
          {
            seriesType: 'bar', //图表类型
            isStastic: true, //是否统计, 默认不统计
            isStack: true, //是否堆叠, 默认不堆叠
            xField: '机场', //x坐标轴数据字段
            yField: '2016起降架次（架次）' //统计的数据，legned默认名字
          },
          {
            seriesType: 'bar',
            isStastic: true,
            isStack: true,
            xField: '机场',
            yField: '2017起降架次（架次）'
          }
        ]
      }
    });
    wrapper.vm.$on('loaded', () => {
      expect(wrapper.find('div#smchart-1').exists()).toBe(true);
      expect(wrapper.vm.$el.outerHTML).toContain('canvas');
      expect(wrapper.vm.mapTarget).toBe('map');
      expect(wrapper.vm.dataset.type).toBe('iPortal');
      done();
    });
  });

  it('default 2.5BarSquare', done => {
    wrapper = mount(SmChart, {
      propsData: {
        frequency: 2,
        startTiming: false,
        seriesType: '2.5Bar',
        dataset: {
          maxFeatures: 20,
          type: 'geoJSON',
          geoJSON: {
            type: 'FeatureCollection',
            features: [
              {
                properties: {
                  date: '1月',
                  sale: 2016,
                  target: 6000
                }
              },
              {
                properties: {
                  date: '2月',
                  sale: 1230,
                  target: 6000
                }
              },
              {
                properties: {
                  date: '3月',
                  sale: 3790,
                  target: 6000
                }
              }
            ]
          }
        },
        datasetOptions: [
          {
            seriesType: '2.5Bar',
            xField: 'date',
            yField: 'target',
            sort: 'unsort'
          },
          {
            seriesType: '2.5Bar',
            xField: 'date',
            yField: 'sale',
            sort: 'unsort'
          }
        ],
        options: {
          yAxis: {
            name: '',
            nameGap: 5,
            nameLocation: 'end',
            type: 'value',
            nameTextStyle: {
              padding: [0, 0, 5, 0]
            }
          },
          xAxis: {
            data: ['1月', '2月', '3月'],
            show: true,
            name: '',
            nameGap: 2,
            nameLocation: 'end',
            type: 'category'
          },
          grid: {
            left: 50,
            right: 35,
            top: 35,
            bottom: 35
          },
          legend: {
            type: 'scroll',
            data: ['Y2', 'Y1', 'Y3'],
            show: false,
            top: 'auto',
            bottom: 'auto'
          },
          series: [
            {
              data: [6000, 6000, 6000],
              type: '2.5Bar',
              shape: 'square',
              itemStyle: {
                color: '#294C7C'
              }
            },
            {
              data: [2016, 1230, 3790],
              type: '2.5Bar',
              shape: 'square'
            }
          ],
          tooltip: {
            axisPointer: {
              shadowStyle: {},
              type: 'shadow'
            },
            trigger: 'axis',
            textStyle: {
              align: 'left'
            }
          },
          textStyle: {
            fontFamily: 'Microsoft YaHei Light'
          },
          title: {
            padding: [5, 0, 0, 20],
            x: 'left'
          }
        }
      }
    });
    wrapper.vm.$on('loaded', async () => {
      expect(wrapper.vm.$el.outerHTML).toContain('canvas');
      done();
    });
  });

  it('default 2.5BarRectangle', done => {
    wrapper = mount(SmChart, {
      propsData: {
        frequency: 2,
        startTiming: false,
        seriesType: '2.5Bar',
        dataset: {
          maxFeatures: 20,
          type: 'geoJSON',
          geoJSON: {
            type: 'FeatureCollection',
            features: [
              {
                properties: {
                  date: '1月',
                  sale: 2016,
                  target: 6000
                }
              },
              {
                properties: {
                  date: '2月',
                  sale: 1230,
                  target: 6000
                }
              },
              {
                properties: {
                  date: '3月',
                  sale: 3790,
                  target: 6000
                }
              }
            ]
          }
        },
        datasetOptions: [
          {
            seriesType: '2.5Bar',
            xField: 'date',
            yField: 'target',
            sort: 'unsort'
          },
          {
            seriesType: '2.5Bar',
            xField: 'date',
            yField: 'sale',
            sort: 'unsort'
          }
        ],
        options: {
          yAxis: {
            name: '',
            show: true,
            nameGap: 5,
            nameLocation: 'end',
            type: 'value',
            nameTextStyle: {
              padding: [0, 0, 5, 0]
            }
          },
          xAxis: {
            data: ['1月', '2月', '3月'],
            show: true,
            name: '',
            nameGap: 2,
            nameLocation: 'end',
            type: 'category'
          },
          grid: {
            left: 50,
            right: 50,
            top: 35,
            bottom: 35
          },
          legend: {
            type: 'scroll',
            data: ['Y2', 'Y1', 'Y3'],
            show: false,
            top: 'auto',
            bottom: 'auto'
          },
          series: [
            {
              data: [6000, 600, 6000],
              type: '2.5Bar',
              shape: 'rectangle',
              itemStyle: {
                color: '#092354'
              }
            },
            {
              data: [2016, 1230, 3790],
              type: '2.5Bar',
              shape: 'rectangle',
              itemStyle: {
                color: '#5A9BF4'
              }
            }
          ],
          tooltip: {
            axisPointer: {
              shadowStyle: {},
              type: 'shadow'
            },
            trigger: 'axis',
            textStyle: {
              align: 'left'
            }
          },
          textStyle: {
            fontFamily: 'Microsoft YaHei Light'
          },
          title: {
            padding: [5, 0, 0, 20],
            x: 'left'
          }
        }
      }
    });
    wrapper.vm.$on('loaded', async () => {
      expect(wrapper.vm.$el.outerHTML).toContain('canvas');
      done();
    });
  });

  it('default 2.5BarCylinder', done => {
    wrapper = mount(SmChart, {
      propsData: {
        frequency: 2,
        startTiming: false,
        isGradient: true,
        seriesType: '2.5Bar',
        dataset: {
          maxFeatures: 20,
          type: 'geoJSON',
          geoJSON: {
            type: 'FeatureCollection',
            features: [
              {
                properties: {
                  date: '1月',
                  sale: 2016,
                  target: 6000
                }
              },
              {
                properties: {
                  date: '2月',
                  sale: 1230,
                  target: 6000
                }
              },
              {
                properties: {
                  date: '3月',
                  sale: 3790,
                  target: 6000
                }
              }
            ]
          }
        },
        datasetOptions: [
          {
            seriesType: '2.5Bar',
            xField: 'date',
            yField: 'target',
            sort: 'unsort'
          },
          {
            seriesType: '2.5Bar',
            xField: 'date',
            yField: 'sale',
            sort: 'unsort'
          }
        ],
        options: {
          yAxis: {
            name: '',
            show: true,
            nameGap: 5,
            nameLocation: 'end',
            type: 'value',
            nameTextStyle: {
              padding: [0, 0, 5, 0]
            }
          },
          xAxis: {
            data: ['1月', '2月', '3月'],
            show: true,
            name: '',
            nameGap: 2,
            nameLocation: 'end',
            type: 'category'
          },
          grid: {
            left: 50,
            right: 50,
            top: 35,
            bottom: 35
          },
          legend: {
            type: 'scroll',
            data: ['Y2', 'Y1', 'Y3'],
            show: false,
            top: 'auto',
            bottom: 'auto'
          },
          series: [
            {
              data: [6000, 600, 6000],
              type: '2.5Bar',
              shape: 'cylinder'
            },
            {
              data: [2016, 1230, 3790],
              type: '2.5Bar',
              shape: 'cylinder'
            }
          ],
          tooltip: {
            axisPointer: {
              shadowStyle: {},
              type: 'shadow'
            },
            trigger: 'axis',
            textStyle: {
              align: 'left'
            }
          },
          textStyle: {
            fontFamily: 'Microsoft YaHei Light'
          },
          title: {
            padding: [5, 0, 0, 20],
            x: 'left'
          }
        }
      }
    });
    wrapper.vm.$on('loaded', async () => {
      expect(wrapper.vm.$el.outerHTML).toContain('canvas');
      done();
    });
  });

  it('default xbar', done => {
    wrapper = mount(SmChart, {
      propsData: {
        dataset: { maxFeatures: 20, url: '', type: '' },
        datasetOptions: [{ seriesType: 'bar' }],
        options: {
          series: [
            {
              data: [72, 86, 73, 94, 50, 96],
              name: 'Y1',
              type: 'line'
            }
          ],
          yAxis: {
            name: '单位：%',
            show: true,
            type: 'category'
          },
          xAxis: {
            data: ['2015', '2016', '2017', '2018', '2019', '2020'],
            show: true,
            name: '',
            nameGap: 2,
            type: 'value'
          },
          grid: { top: 35, left: 30, bottom: 20, right: 15 },
          legend: {
            data: ['Y1', 'Y2'],
            show: false,
            textStyle: { color: '#fff', fontSize: 12 },
            type: 'scroll',
            top: 'top',
            left: 'center'
          }
        },
        chartStyle: {
          position: 'absolute',
          bottom: '10px',
          right: '10px'
        }
      }
    });
    wrapper.vm.$on('loaded', async () => {
      expect(wrapper.vm.$el.outerHTML).toContain('canvas');
      done();
    });
  });

  it('default RankXBar', done => {
    wrapper = mount(SmChart, {
      propsData: {
        seriesType: 'xBar',
        thresholdConfig: [
          {
            type: 'number',
            show: true,
            dataConfig: [],
            rankConfig: [
              {
                min: 1,
                max: 3,
                color: '#f0515e'
              }
            ]
          }
        ],
        dataset: {
          maxFeatures: 20,
          type: 'geoJSON',
          geoJSON: {
            type: 'FeatureCollection',
            features: [
              {
                properties: {
                  date: '四川',
                  sale: 22
                }
              },
              {
                properties: {
                  date: '福建',
                  sale: 65
                }
              },
              {
                properties: {
                  date: '北京',
                  sale: 86
                }
              },
              {
                properties: {
                  date: '上海',
                  sale: 48
                }
              },
              {
                properties: {
                  date: '台湾',
                  sale: 43
                }
              }
            ]
          }
        },
        datasetOptions: [
          {
            seriesType: 'bar',
            xField: 'date',
            yField: 'sale',
            sort: 'descending',
            rankLabel: true
          }
        ],
        options: {
          dataZoom: [
            { type: 'slider', start: 0, end: 20, xAxisIndex: 0, height: 25 },
            { type: 'inside', xAxisIndex: 0 }
          ],
          yAxis: {
            show: true,
            type: 'category',
            name: '',
            nameLocation: 'end',
            nameGap: 2,
            axisLabel: {
              show: true,
              rotate: 0,
              fontFamily: 'MicrosoftYaHei',
              align: 'left',
              margin: 60
            },
            splitLine: {
              lineStyle: {
                width: 0.3,
                type: 'solid'
              },
              show: false
            },
            data: ['四川', '福建', '北京', '上海', '台湾']
          },
          xAxis: {
            type: 'value',
            name: '',
            nameLocation: 'end',
            nameGap: 5,
            scale: false,
            axisLine: {
              show: false,
              lineStyle: {}
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: false,
              rotate: 0,
              fontFamily: 'MicrosoftYaHei'
            },
            splitLine: {
              lineStyle: {
                type: 'solid'
              },
              show: false
            },
            splitArea: {
              show: false
            },
            nameTextStyle: {
              padding: [0, 0, 5, 0]
            }
          },
          grid: {
            left: 60,
            right: 50,
            top: 35,
            bottom: 35
          },
          legend: {
            type: 'scroll',
            data: ['Y2', 'Y1', 'Y3'],
            show: false,
            top: 'auto',
            bottom: 'auto'
          },
          series: [
            {
              name: 'sale',
              emphasis: {
                itemStyle: {}
              },
              itemStyle: {
                barBorderRadius: [0, 15, 15, 0]
              },
              label: {
                show: true,
                normal: {
                  position: 'top',
                  show: true,
                  textStyle: { fontSize: 12 },
                  smart: true
                }
              },
              stack: 0,
              type: 'bar',
              barWidth: 10,
              data: [22, 65, 86, 48, 43, 53, 34, 33, 24]
            }
          ],
          tooltip: {
            axisPointer: {
              shadowStyle: {},
              type: 'shadow'
            },
            trigger: 'axis',
            textStyle: {
              align: 'left'
            }
          },
          textStyle: {
            fontFamily: 'Microsoft YaHei Light'
          },
          title: {
            padding: [5, 0, 0, 20],
            x: 'left',
            text: '',
            textStyle: {
              fontFamily: 'Microsoft YaHei Light',
              fontWeight: '100'
            }
          }
        },
        colorGroup: ['#3fb1e3', '#6be6c1', '#626c91', '#a0a7e6', '#c4ebad']
      }
    });
    wrapper.vm.$on('loaded', async () => {
      expect(wrapper.vm.$el.outerHTML).toContain('canvas');
      done();
    });
  });

  it('default RingShine', done => {
    wrapper = mount(SmChart, {
      propsData: {
        frequency: 2,
        startTiming: false,
        seriesType: 'pie',
        showInnerCircle: true,
        innerCircleColor: '#ffe000',
        dataset: {
          maxFeatures: 20,
          type: 'geoJSON',
          geoJSON: {
            type: 'FeatureCollection',
            features: [
              {
                properties: {
                  date: 'Mon',
                  sale: 500
                }
              },
              {
                properties: {
                  date: 'Tue',
                  sale: 800
                }
              },
              {
                properties: {
                  date: 'Wed',
                  sale: 1842
                }
              },
              {
                properties: {
                  date: 'Thu',
                  sale: 3000
                }
              },
              {
                properties: {
                  date: 'Fri',
                  sale: 3400
                }
              },
              {
                properties: {
                  date: 'Sat',
                  sale: 3617
                }
              },
              {
                properties: {
                  date: 'Sun',
                  sale: 4200
                }
              }
            ]
          }
        },
        datasetOptions: [
          {
            xField: 'date',
            yField: 'sale',
            sort: 'descending',
            seriesType: 'pie'
          }
        ],
        options: {
          tooltip: {
            show: false
          },
          legend: {
            type: 'scroll',
            orient: 'vertical',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            show: true,
            top: 'auto',
            bottom: 'auto'
          },
          series: [
            {
              name: 'demo',
              type: 'pie',
              radius: ['75%', '80%'],
              clockwise: false,
              avoidLabelOverlap: true,
              isShine: true,
              outerGap: 0,
              data: [
                {
                  value: 500,
                  name: 'Mon'
                },
                {
                  value: 800,
                  name: 'Tue'
                },
                {
                  value: 3000,
                  name: 'Wed'
                },
                {
                  value: 3617,
                  name: 'Thu'
                },
                {
                  value: 3400,
                  name: 'Fri'
                },
                {
                  value: 4200,
                  name: 'Sat'
                },
                {
                  value: 1842,
                  name: 'Sun'
                }
              ]
            }
          ]
        }
      }
    });
    wrapper.vm.$on('loaded', async () => {
      expect(wrapper.vm.$el.outerHTML).toContain('canvas');
      done();
    });
  });

  it('scatter', done => {
    wrapper = mount(SmChart, {
      propsData: {
        mapTarget: 'map',
        dataset: iportalDataSet,
        options: {
          legend: {
            data: ['同比增速%']
          }, //与yField数据一致
          tooltip: {
            formatter: '{b0}: {c0}'
          }
        },
        style: {
          position: 'absolute',
          bottom: '10px',
          right: '830px'
        },
        datasetOptions: [
          {
            seriesType: 'scatter', //图表类型
            isStastic: true, //是否统计, 默认不统计
            isStack: false, //是否堆叠, 默认不堆叠
            xField: '机场', //x坐标轴数据字段
            yField: '同比增速%' //统计的数据，legned默认名字
          }
        ]
      }
    });
    wrapper.vm.$on('loaded', () => {
      expect(wrapper.vm.$el.outerHTML).toContain('canvas');
      expect(wrapper.vm.mapTarget).toBe('map');
      expect(wrapper.vm.dataset.type).toBe('iPortal');
      done();
    });
  });

  it('default line', done => {
    wrapper = mount(SmChart, {
      propsData: {
        dataset: { maxFeatures: 20, url: '', type: '' },
        datasetOptions: [{ seriesType: 'line' }],
        options: {
          series: [
            {
              data: [72, 86, 73, 94, 50, 96],
              name: 'Y1',
              type: 'line'
            }
          ],
          yAxis: {
            name: '单位：%',
            show: true,
            type: 'value'
          },
          xAxis: {
            data: ['2015', '2016', '2017', '2018', '2019', '2020'],
            show: true,
            name: '',
            nameGap: 2,
            type: 'category'
          },
          grid: { top: 35, left: 30, bottom: 20, right: 15 },
          legend: {
            data: ['Y1', 'Y2'],
            show: false,
            textStyle: { color: '#fff', fontSize: 12 },
            type: 'scroll',
            top: 'top',
            left: 'center'
          }
        },
        chartStyle: {
          position: 'absolute',
          bottom: '10px',
          right: '10px'
        }
      }
    });
    wrapper.vm.$on('loaded', async () => {
      expect(wrapper.vm.$el.outerHTML).toContain('canvas');
      await wrapper.setProps({
        mapTarget: 'map',
        dataset: iportalDataSet,
        options: {
          legend: {
            data: ['2016旅客吞吐量（人次）', '2017旅客吞吐量（人次）']
          }, //与yField数据一致
          tooltip: {
            formatter: '{b0}: {c0}'
          },
          grid: {
            top: 30,
            bottom: 60,
            left: 60,
            right: 30
          }
        },
        style: {
          position: 'absolute',
          bottom: '10px',
          right: '10px'
        },
        datasetOptions: [
          {
            seriesType: 'line',
            isStastic: true,
            isStack: true,
            xField: '机场',
            yField: '2016旅客吞吐量（人次）',
            xAxis: {
              show: true,
              type: 'value'
            },
            yAxis: {
              show: true,
              type: 'category'
            }
          },
          {
            seriesType: 'line',
            isStastic: true,
            isStack: true,
            xField: '机场',
            yField: '2017旅客吞吐量（人次）',
            xAxis: {
              show: true,
              type: 'value'
            },
            yAxis: {
              show: true,
              type: 'category'
            }
          }
        ]
      });
      expect(wrapper.vm.mapTarget).toBe('map');
      expect(wrapper.vm.dataset.type).toBe('iPortal');
      done();
    });
  });

  it('line', done => {
    wrapper = mount(SmChart, {
      propsData: {
        mapTarget: 'map',
        dataset: iportalDataSet,
        options: {
          legend: {
            data: ['2016旅客吞吐量（人次）', '2017旅客吞吐量（人次）']
          }, //与yField数据一致
          tooltip: {
            formatter: '{b0}: {c0}'
          },
          grid: {
            top: 30,
            bottom: 60,
            left: 60,
            right: 30
          }
        },
        style: {
          position: 'absolute',
          bottom: '10px',
          right: '10px'
        },
        datasetOptions: [
          {
            seriesType: 'line', //图表类型
            isStastic: true, //是否统计, 默认不统计
            isStack: true, //是否堆叠, 默认不堆叠
            xField: '机场', //x坐标轴数据字段
            yField: '2016旅客吞吐量（人次）' //统计的数据，legned默认名字
          },
          {
            seriesType: 'line',
            isStastic: true,
            isStack: true,
            xField: '机场',
            yField: '2017旅客吞吐量（人次）'
          }
        ]
      }
    });
    wrapper.vm.$on('loaded', () => {
      expect(wrapper.vm.$el.outerHTML).toContain('canvas');
      expect(wrapper.vm.mapTarget).toBe('map');
      expect(wrapper.vm.dataset.type).toBe('iPortal');
      done();
    });
  });

  it('radar', done => {
    wrapper = mount(SmChart, {
      propsData: {
        mapTarget: 'map',
        dataset: iportalDataSet,
        options: {
          legend: {
            data: ['2016旅客吞吐量（人次）', '2017旅客吞吐量（人次）']
          }, //与yField数据一致
          tooltip: {
            formatter: '{b0}: {c0}'
          },
          grid: {
            top: 30,
            bottom: 60,
            left: 60,
            right: 30
          }
        },
        style: {
          position: 'absolute',
          bottom: '10px',
          right: '10px'
        },
        datasetOptions: [
          {
            seriesType: 'radar', //图表类型
            isStastic: true, //是否统计, 默认不统计
            isStack: true, //是否堆叠, 默认不堆叠
            xField: '机场', //x坐标轴数据字段
            yField: '2016旅客吞吐量（人次）' //统计的数据，legned默认名字
          },
          {
            seriesType: 'radar',
            isStastic: true,
            isStack: true,
            xField: '机场',
            yField: '2017旅客吞吐量（人次）'
          }
        ]
      }
    });
    wrapper.vm.$on('loaded', () => {
      expect(wrapper.vm.$el.outerHTML).toContain('canvas');
      expect(wrapper.vm.mapTarget).toBe('map');
      expect(wrapper.vm.dataset.type).toBe('iPortal');
      done();
    });
  });

  it('pie', done => {
    wrapper = mount(SmChart, {
      propsData: {
        mapTarget: 'map',
        dataset: iportalDataSet,
        options: {
          legend: {
            data: ['2016旅客吞吐量（人次）']
          }, //与yField数据一致
          grid: {
            top: 30,
            bottom: 60,
            left: 60,
            right: 30
          }
        },
        style: {
          position: 'absolute',
          bottom: '10px',
          right: '10px'
        },
        datasetOptions: [
          {
            seriesType: 'pie', //图表类型
            isStastic: true, //是否统计, 默认不统计
            isStack: true, //是否堆叠, 默认不堆叠
            xField: '机场', //x坐标轴数据字段
            yField: '2016旅客吞吐量（人次）' //统计的数据，legned默认名字
          }
        ]
      }
    });
    wrapper.vm.$on('loaded', () => {
      expect(wrapper.vm.$el.outerHTML).toContain('canvas');
      done();
    });
  });

  it('gauge', done => {
    wrapper = mount(SmChart, {
      propsData: {
        mapTarget: 'map',
        dataset: iportalDataSet,
        options: {
          legend: {
            data: ['2016旅客吞吐量（人次）', '2017旅客吞吐量（人次）']
          }, //与yField数据一致
          tooltip: {
            formatter: '{b0}: {c0}'
          },
          grid: {
            top: 30,
            bottom: 60,
            left: 60,
            right: 30
          }
        },
        style: {
          position: 'absolute',
          bottom: '10px',
          right: '10px'
        },
        datasetOptions: [
          {
            seriesType: 'gauge', //图表类型
            isStastic: true, //是否统计, 默认不统计
            isStack: true, //是否堆叠, 默认不堆叠
            xField: '机场', //x坐标轴数据字段
            yField: '2016旅客吞吐量（人次）' //统计的数据，legned默认名字
          },
          {
            seriesType: 'gauge',
            isStastic: true,
            isStack: true,
            xField: '机场',
            yField: '2017旅客吞吐量（人次）'
          }
        ]
      }
    });
    wrapper.vm.$on('loaded', () => {
      expect(wrapper.vm.$el.outerHTML).toContain('canvas');
      expect(wrapper.vm.mapTarget).toBe('map');
      expect(wrapper.vm.dataset.type).toBe('iPortal');
      done();
    });
  });

  it('change props', done => {
    wrapper = mount(SmChart, {
      propsData: {
        mapTarget: 'map',
        dataset: iportalDataSet,
        echartOptions: {
          legend: {
            data: ['2016起降架次（架次）', '2017起降架次（架次）']
          }, //与yField数据一致
          tooltip: {
            formatter: '{b0}: {c0}'
          },
          grid: {
            top: 30,
            bottom: 60,
            left: 60,
            right: 30
          }
        },
        chartStyle: {
          position: 'absolute',
          bottom: '10px',
          right: '10px'
        },
        datasetOptions: [
          {
            seriesType: 'bar', //图表类型
            isStastic: true, //是否统计, 默认不统计
            isStack: true, //是否堆叠, 默认不堆叠
            xField: '机场', //x坐标轴数据字段
            yField: '2016起降架次（架次）' //统计的数据，legned默认名字
          },
          {
            seriesType: 'bar',
            isStastic: true,
            isStack: true,
            xField: '机场',
            yField: '2017起降架次（架次）'
          }
        ]
      }
    });
    wrapper.vm.$on('loaded', () => {
      wrapper.setProps({
        mapTarget: 'map',
        dataset: {
          type: 'iPortal', //iServer iPortal
          url: 'https://fakeiportal.supermap.io/iportal/web/datas/1236666',
          queryInfo: {
            maxFeatures: 40
          }
        },
        echartOptions: {
          legend: {
            data: ['2019起降架次（架次）', '2020起降架次（架次）']
          }, //与yField数据一致
          tooltip: {
            formatter: '{b0}: {c0}'
          },
          grid: {
            top: 50,
            bottom: 70,
            left: 60,
            right: 30
          }
        },
        chartStyle: {
          position: 'absolute',
          bottom: '15px',
          right: '15px'
        },
        datasetOptions: [
          {
            seriesType: 'bar', //图表类型
            isStastic: true, //是否统计, 默认不统计
            isStack: true, //是否堆叠, 默认不堆叠
            xField: '机场', //x坐标轴数据字段
            yField: '2019起降架次（架次）' //统计的数据，legned默认名字
          },
          {
            seriesType: 'bar',
            isStastic: true,
            isStack: true,
            xField: '机场',
            yField: '2020起降架次（架次）'
          }
        ]
      });
      expect(wrapper.vm.mapTarget).toBe('map');
      expect(wrapper.vm.dataset.type).toBe('iPortal');
      done();
    });
  });
});
