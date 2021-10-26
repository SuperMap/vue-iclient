import { shallowMount, mount } from '@vue/test-utils';
import ChartMixin from '../ChartMixin.vue';

describe('Chart Mixin Component', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    wrapper && wrapper.destroy();
  });

  describe('toggle component by isShow props', () => {
    const factory = propsData => {
      return shallowMount(ChartMixin, {
        propsData
      });
    };

    it('show component', () => {
      wrapper = factory();
      expect(wrapper.isVisible()).toBe(true);
    });

    it('hide component', () => {
      wrapper = factory({ isShow: false });
      expect(wrapper.isVisible()).toBe(false);
    });
  });

  const xAxis = {
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    axisLabel: {
      rotate: 0,
      fontFamily: 'MicrosoftYaHei'
    },
    show: true,
    name: '',
    nameGap: 2,
    nameLocation: 'end',
    type: 'category'
  };
  const yAxis = {
    name: '',
    axisLine: {
      lineStyle: {}
    },
    axisLabel: {
      rotate: 0,
      fontFamily: 'MicrosoftYaHei'
    },
    show: true,
    splitArea: {
      show: false
    },
    nameGap: 5,
    nameLocation: 'end',
    type: 'value',
    nameTextStyle: {
      padding: [0, 0, 5, 0]
    }
  };
  const commonOptionWithAxis = {
    xAxis,
    yAxis,
    grid: {
      left: 50,
      right: 50,
      top: 35,
      bottom: 35
    }
  };

  const factory = (propsData = {}, componentOptions = {}) => {
    return mount(ChartMixin, {
      propsData,
      ...componentOptions
    });
  };

  const axisOptions = series => Object.assign({}, commonOptionWithAxis, { series });

  it('has echarts instance', async () => {
    const name = 'SmChart';
    wrapper = factory({}, { name });
    const refName = wrapper.vm.chartId;
    const chartRef = wrapper.find({ ref: refName });
    expect(refName).toContain(name.toLowerCase());
    expect(chartRef.exists()).toBe(true);
    expect(wrapper.vm.width).not.toBeUndefined();
    expect(wrapper.vm.height).not.toBeUndefined();
    expect(wrapper.vm.computedOptions).not.toBeUndefined();
    expect(wrapper.vm.theme).toBeUndefined(); 
    expect(wrapper.vm.chartTheme).not.toBeNull(); 
    await wrapper.setProps({ theme: 'dark' });
    expect(wrapper.vm.chartTheme).toBeNull(); 
  });

  it('render empty chart', () => {
    const options = axisOptions();
    wrapper = factory({ options });
    expect(wrapper.vm.parseOptions).toStrictEqual(options);
  });

  it('render pie chart', async () => {
    const series = [
      {
        name: 'demo',
        type: 'pie',
        radius: ['60%', '80%'],
        avoidLabelOverlap: false,
        maxLabels: 10,
        label: {
          normal: {
            show: true,
            position: 'center'
          },
          emphasis: {
            show: true,
            textStyle: {
              fontSize: '30',
              fontWeight: 'bold'
            }
          }
        },
        labelLine: {
          show: false,
          smooth: true
        },
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
    ];
    const options = { series };
    const datasetOptions = [
      {
        xField: 'date',
        yField: 'sale',
        sort: 'unsort',
        seriesType: 'pie'
      }
    ];
    wrapper = factory({ options, datasetOptions });
    expect(wrapper.vm.parseOptions).not.toStrictEqual(options);
    expect(wrapper.vm.parseOptions.series[0].label.normal.formatter).not.toBeUndefined();
    const dataset = {
      maxFeatures: 20,
      url: '',
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
              sale: 3000
            }
          },
          {
            properties: {
              date: 'Thu',
              sale: 3617
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
              sale: 4200
            }
          },
          {
            properties: {
              date: 'Sun',
              sale: 1842
            }
          }
        ]
      }
    };
    expect(wrapper.vm.datasetChange).toBeFalsy();
    const spyFn = jest.spyOn(wrapper.vm, '_setEchartOptions');
    await wrapper.setProps({ dataset });
    expect(wrapper.vm.datasetChange).toBeTruthy();
    expect(spyFn).toHaveBeenCalled();
  });

  it('render rankBar chart', async () => {
    const series = [
      {
        name: 'sale',
        emphasis: {
          itemStyle: {}
        },
        itemStyle: {
          barBorderRadius: [0, 15, 15, 0]
        },
        stack: 0,
        type: 'bar',
        barWidth: 10,
        data: [22, 65, 86, 48, 43, 53, 34, 33, 24]
      }
    ];
    const options = {
      xAxis: yAxis,
      yAxis: xAxis,
      series
    };
    const datasetOptions = [
      {
        seriesType: 'bar',
        xField: 'date',
        yField: 'sale',
        sort: 'descending',
        rankLabel: true
      }
    ];
    wrapper = factory({ options, datasetOptions });
    expect(wrapper.vm.xBar).toBeTruthy();
  });

  describe('render special chart which type is 2.5Bar', () => {
    const series = [
      {
        data: [6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000],
        type: '2.5Bar',
        shape: 'square',
        itemStyle: {
          color: '#294C7C'
        }
      },
      {
        data: [2016, 1230, 3790, 2349, 1654, 1120, 1980, 980, 1333, 2001, 1820, 3200],
        type: '2.5Bar',
        shape: 'square'
      }
    ];
    const options = axisOptions(series);
    it('static data', () => {
      wrapper = factory({ options });
      const parseOptions = wrapper.vm.parseOptions;
      expect(parseOptions).not.toStrictEqual(options);
      expect(parseOptions.series.length).toBe(0);
    });
    it('fetch data', () => {
      wrapper = factory({
        options,
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
        ]
      });
      expect(wrapper.vm.$options.graphic).not.toBeUndefined();
    });
  });

  it('render special chart which customType is customRingsSeries', () => {
    const series = [
      {
        name: '',
        type: 'gauge',
        customType: 'customRingsSeries',
        customOptions: {
          pointState: 'startPoint',
          radius: 0.65,
          color: ''
        },
        radius: '58%',
        center: ['50%', '50%'],
        startAngle: 90,
        endAngle: -269.9,
        splitNumber: 8,
        hoverAnimation: true,
        axisTick: {
          show: false
        },
        splitLine: {
          length: 20,
          lineStyle: {
            width: 5
          }
        },
        axisLabel: {
          show: false,
          distance: 25,
          fontSize: 14,
          formatter: '{value}'
        },
        pointer: {
          show: false
        },
        axisLine: {
          lineStyle: {
            opacity: 0
          }
        },
        detail: {
          show: true,
          offsetCenter: [0, 0],
          textStyle: {
            fontSize: 20
          }
        },
        data: [
          {
            value: 80,
            name: ''
          }
        ],
        animation: false
      },
      {
        name: '吃猪肉频率',
        type: 'pie',
        radius: ['58%', '45%'],
        silent: true,
        clockwise: true,
        startAngle: 90,
        z: 0,
        zlevel: 0,
        label: {
          normal: {
            position: 'center'
          }
        },
        data: [
          {
            value: 80,
            name: ''
          },
          {
            value: 46,
            name: '',
            label: {
              normal: {
                show: false
              }
            }
          }
        ]
      }
    ];
    const options = axisOptions(series);
    jest.useFakeTimers();
    wrapper = factory({ options });
    expect(wrapper.vm.startSpin).not.toBeNull();
    expect(wrapper.vm.parseOptions).toStrictEqual(options);
    jest.advanceTimersByTime(120);
    const customSeriesLen = wrapper.vm.customSeries.length;
    expect(customSeriesLen).not.toBe(0);
    expect(wrapper.vm.parseOptions.series.length).toBe(options.series.length + customSeriesLen);
    jest.useRealTimers();
  });
});
