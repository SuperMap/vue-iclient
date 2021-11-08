import { shallowMount, mount, createLocalVue } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import { message } from 'ant-design-vue';
import ChartMixin from '../ChartMixin.vue';

const sleep = (timeout = 0) => new Promise(resolve => setTimeout(resolve, timeout));

describe('Chart Mixin Component', () => {
  let wrapper;
  const localVue = createLocalVue();
  localVue.prototype.$message = message;

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
      wrapper = factory({
        isShow: false
      });
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
  const legend = {
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    show: true,
    top: 'auto',
    bottom: 'auto'
  };
  const commonOptionWithAxis = {
    xAxis,
    yAxis,
    grid: {
      left: 50,
      right: 50,
      top: 35,
      bottom: 35
    },
    dataZoom: [
      {
        type: 'slider',
        start: 20,
        end: 0,
        xAxisIndex: 0,
        height: 25
      },
      {
        type: 'inside',
        xAxisIndex: 0
      }
    ]
  };

  const datasetOptionsFactory = seriesTypeList =>
    seriesTypeList.map(seriesType => ({
      xField: 'date',
      yField: 'sale',
      sort: 'descending',
      seriesType
    }));

  const geoJSONDataset = {
    maxFeatures: 20,
    url: '',
    type: 'geoJSON',
    geoJSON: {
      type: 'FeatureCollection',
      features: [
        {
          properties: {
            date: 'Mon',
            sale: 500,
            target: 6000
          }
        },
        {
          properties: {
            date: 'Tue',
            sale: 800,
            target: 6000
          }
        },
        {
          properties: {
            date: 'Wed',
            sale: 3000,
            target: 6000
          }
        },
        {
          properties: {
            date: 'Thu',
            sale: 3617,
            target: 6000
          }
        },
        {
          properties: {
            date: 'Fri',
            sale: 3400,
            target: 6000
          }
        },
        {
          properties: {
            date: 'Sat',
            sale: 4200,
            target: 6000
          }
        },
        {
          properties: {
            date: 'Sun',
            sale: 1842,
            target: 6000
          }
        }
      ]
    }
  };

  const highlightOptions = (seriesIndex = [0, 1]) => [
    {
      seriesIndex,
      dataIndex: 0,
      properties: {
        date: 'Mon',
        sale: 500,
        target: 6000
      }
    }
  ];

  const highlightColor = 'pink';

  const factory = (propsData = {}, componentOptions = {}) => {
    return mount(ChartMixin, {
      propsData: Object.assign(
        {
          colorGroup: ['#3fb1e3', '#6be6c1', '#626c91', '#a0a7e6', '#c4ebad']
        },
        propsData
      ),
      ...componentOptions
    });
  };

  const optionFactory = series =>
    Object.assign({}, commonOptionWithAxis, {
      series
    });

  it('has echarts instance', async () => {
    const name = 'SmChart';
    wrapper = factory(
      {},
      {
        name
      }
    );
    const refName = wrapper.vm.chartId;
    const chartRef = wrapper.find({
      ref: refName
    });
    expect(refName).toContain(name.toLowerCase());
    expect(chartRef.exists()).toBe(true);
    expect(wrapper.vm.width).not.toBeUndefined();
    expect(wrapper.vm.height).not.toBeUndefined();
    expect(wrapper.vm.computedOptions).not.toBeUndefined();
    expect(wrapper.vm.theme).toBeUndefined();
    expect(wrapper.vm.chartTheme).not.toBeNull();
    await wrapper.setProps({
      theme: 'dark'
    });
    expect(wrapper.vm.chartTheme).toBeNull();
  });

  it('render empty chart', () => {
    const options = optionFactory();
    wrapper = factory({
      options
    });
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
    const options = { legend, series };
    wrapper = factory({
      autoPlay: false,
      options,
      datasetOptions: datasetOptionsFactory(['pie'])
    });
    expect(wrapper.vm.parseOptions).not.toStrictEqual(options);
    expect(wrapper.vm.parseOptions.series[0].label.normal.formatter).not.toBeUndefined();
    const spyFn = jest.spyOn(wrapper.vm, '_handlePieAutoPlay');
    jest.useFakeTimers();
    await wrapper.setProps({
      autoPlay: true
    });
    expect(spyFn).toHaveBeenCalled();
    expect(wrapper.vm.pieAutoPlay).not.toBeUndefined();
    jest.useRealTimers();
  });

  it('render rankBar chart', async () => {
    const serieItem = {
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
    };
    const series = [serieItem];
    const options = {
      xAxis: yAxis,
      yAxis: xAxis,
      legend,
      series
    };
    wrapper = factory({
      options
    });
    expect(wrapper.vm.xBar).toBeTruthy();
    await wrapper.setProps({
      options: {
        ...options,
        series: [
          {
            ...serieItem,
            label: {
              normal: {
                show: true,
                position: 'center',
                smart: true
              }
            }
          }
        ]
      }
    });
    expect(wrapper.vm.echartOptions).toStrictEqual(wrapper.vm.parseOptions);
    expect(wrapper.vm.datasetChange).toBeFalsy();
    const spyFn = jest.spyOn(wrapper.vm, '_setEchartOptions');
    await wrapper.setProps({
      datasetOptions: [
        {
          ...datasetOptionsFactory(['bar'])[0],
          rankLabel: true
        }
      ],
      dataset: geoJSONDataset
    });
    expect(wrapper.vm.datasetChange).toBeTruthy();
    expect(spyFn).toHaveBeenCalled();
    const spyOptionHandlerFn = jest.spyOn(wrapper.vm, '_optionsHandler');
    await flushPromises();
    await wrapper.setProps({
      options: {
        ...options,
        visualMap: [
          {
            show: false,
            seriesIndex: 0,
            pieces: [
              {
                min: 0,
                max: 3000,
                color: 'green'
              }
            ],
            outOfRange: {
              color: 'red'
            },
            dimension: 0
          }
        ]
      }
    });
    expect(spyOptionHandlerFn).toHaveBeenCalled();
  });

  describe('render special chart which type is 2.5Bar', () => {
    const series = [
      {
        type: '2.5Bar',
        shape: 'square',
        itemStyle: {
          color: '#294C7C'
        }
      },
      {
        type: '2.5Bar',
        shape: 'square',
        itemStyle: {
          color: {
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            type: 'linear',
            global: false,
            colorStops: [
              {
                offset: 0,
                color: '#3fb1e3'
              },
              {
                offset: 1,
                color: '#6be6c1'
              }
            ]
          }
        }
      }
    ];
    const options = optionFactory(series);
    it('static data', () => {
      wrapper = factory({
        options
      });
      const parseOptions = wrapper.vm.parseOptions;
      expect(parseOptions).not.toStrictEqual(options);
      expect(parseOptions.series.length).toBe(0);
    });
    it('fetch data', async () => {
      wrapper = factory({
        options,
        datasetOptions: datasetOptionsFactory(['2.5Bar', '2.5Bar']),
        dataset: geoJSONDataset,
        highlightColor
      });
      const graphic = wrapper.vm.$options.graphic;
      expect(graphic).not.toBeUndefined();
      expect(graphic.getShapeClass('CubesquareLeft')).not.toBeUndefined();
      await sleep(300);
      await wrapper.setProps({
        highlightOptions: highlightOptions([0])
      });
      await flushPromises();
      expect(wrapper.vm.echartOptions.series[0].renderItem).not.toBeUndefined();
      expect(wrapper.vm.echartOptions.series[0].shape).toBeUndefined();
    });
    it('render cylinder chart', async () => {
      wrapper = factory({
        options: {
          ...options,
          series: [
            {
              type: '2.5Bar',
              shape: 'cylinder'
            },
            {
              type: '2.5Bar',
              shape: 'cylinder'
            }
          ]
        },
        datasetOptions: datasetOptionsFactory(['2.5Bar', '2.5Bar']),
        dataset: geoJSONDataset,
        highlightColor
      });
      await flushPromises();
      const echartSeriesLen = wrapper.vm.echartOptions.series.length;
      expect(echartSeriesLen).toBeGreaterThan(options.series.length);
      expect(wrapper.vm.echartOptions.series[echartSeriesLen - 1].type).toBe('pictorialBar');
      await sleep(300);
      await wrapper.setProps({
        highlightOptions: highlightOptions([1])
      });
      expect(wrapper.vm.echartOptions.series[0].itemStyle.color).not.toStrictEqual(options.series[0].itemStyle.color);
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
    const options = optionFactory(series);
    jest.useFakeTimers();
    wrapper = factory({
      options
    });
    expect(wrapper.vm.startSpin).not.toBeNull();
    expect(wrapper.vm.parseOptions).toStrictEqual(options);
    jest.advanceTimersByTime(120);
    const customSeriesLen = wrapper.vm.customSeries.length;
    expect(customSeriesLen).not.toBe(0);
    expect(wrapper.vm.parseOptions.series.length).toBe(options.series.length + customSeriesLen);
    jest.useRealTimers();
  });

  it('render special pie chart which ring is shine', async () => {
    const series = [
      {
        name: 'demo',
        type: 'pie',
        radius: ['75%', '80%'],
        clockwise: false,
        avoidLabelOverlap: true,
        isShine: true,
        outerGap: 0
      }
    ];
    const options = optionFactory(series);
    wrapper = factory({
      options,
      datasetOptions: datasetOptionsFactory(['pie']),
      dataset: geoJSONDataset,
      highlightOptions: highlightOptions(),
      highlightColor
    });
    await flushPromises();
    expect(wrapper.vm.echartOptions.series[0].outerGap).toBeUndefined();
    expect(wrapper.vm.echartOptions.series[0].isShine).toBeUndefined();
  });

  it('render special pie chart which is named Rose', async () => {
    const series = [
      {
        name: 'area',
        type: 'pie',
        radius: ['10%', '80%'],
        center: ['50%', '50%'],
        roseType: 'area'
      },
      {
        name: 'area',
        type: 'pie',
        radius: ['10%', '80%'],
        center: ['50%', '50%']
      }
    ];
    const options = optionFactory(series);
    wrapper = factory({
      options,
      datasetOptions: datasetOptionsFactory(['pie', 'pie']),
      dataset: geoJSONDataset,
      highlightOptions: highlightOptions(),
      highlightColor
    });
    await flushPromises();
    expect(wrapper.vm.echartOptions.series[1].roseType).toBe(options.series[0].roseType);
  });

  it('trigger echarts events', () => {
    wrapper = factory({
      options: optionFactory(),
      datasetOptions: datasetOptionsFactory(['bar']),
      dataset: geoJSONDataset,
      associatedMap: true
    }, { localVue });
    const chartInstance = wrapper.vm._getEchart();
    expect(chartInstance).not.toBeUndefined();
    const params = { dataIndex: 0 };
    chartInstance.$emit('click', params);
    expect(wrapper.emitted().click).toBeTruthy();
    expect(wrapper.emitted().click.length).toBe(1);
    expect(wrapper.emitted().click[0]).toEqual([params]);
  });
});
