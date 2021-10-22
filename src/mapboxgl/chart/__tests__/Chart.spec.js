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
