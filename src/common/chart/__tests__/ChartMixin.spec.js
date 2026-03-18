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
            decimals: 1,
            show: true,
            position: 'center',
            xFieldDecimals: 2,
            originFormatter: '{b}: {c}'
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
    expect(
      wrapper.vm.parseOptions.series[0].label.normal.formatter({
        dataIndex: 0,
        name: 1,
        value: 1.2547,
        percent: 125.47
      })
    ).toEqual('1.00: 1.3');
    const spyFn = jest.spyOn(wrapper.vm, '_handlePieAutoPlay');
    jest.useFakeTimers();
    await wrapper.setProps({
      autoPlay: true
    });
    expect(spyFn).toHaveBeenCalled();
    expect(wrapper.vm.pieAutoPlay).not.toBeUndefined();
    jest.useRealTimers();
  });

  it('render rankBar chart', async done => {
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
      yAxis: {
        ...xAxis,
        decimals: 2
      },
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
                decimals: 1,
                show: true,
                position: 'center',
                smart: true
              }
            }
          }
        ]
      }
    });
    await flushPromises();
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
    await flushPromises();
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
                max: 500,
                color: 'blue'
              },
              {
                min: 800,
                lt: 1842,
                color: 'green'
              },
              {
                gt: 1842,
                max: 3400,
                color: 'gray'
              },
              {
                value: 1842,
                color: 'purple'
              },
              {
                lte: 4200,
                gte: 3617,
                color: 'pink'
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
    await flushPromises();
    expect(spyOptionHandlerFn).toHaveBeenCalled();
    wrapper.vm.echartOptions.visualMap[0].pieces.forEach((item, index) => {
      expect(wrapper.vm.echartOptions.yAxis[0].axisLabel.rich[`color_${index}`]).not.toBeUndefined();
    });
    expect(wrapper.vm.echartOptions.yAxis[0].axisLabel.formatter('1Thu', 5)).toEqual([`{color_4|2}  Thu`].join('\n'));
    expect(wrapper.vm.echartOptions.yAxis[0].axisLabel.formatter('11.234', 1)).toEqual(
      [`{color_1|2}  1.23`].join('\n')
    );
    done();
  });

  it('decimals smart label', async done => {
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
    const options = {
      xAxis: yAxis,
      yAxis: {
        ...xAxis
      },
      legend,
      series: [
        {
          ...serieItem,
          label: {
            normal: {
              decimals: 1,
              show: true,
              position: 'center',
              smart: true
            }
          }
        }
      ]
    };
    wrapper = factory({
      options
    });
    await wrapper.setProps({
      datasetOptions: [
        {
          ...datasetOptionsFactory(['bar'])[0],
          rankLabel: true
        }
      ],
      dataset: geoJSONDataset
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.echartOptions.series[0].label.normal.formatter({ dataIndex: 0, value: 1.234 })).toEqual('1.2');
    done();
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
      const datasetOptions = [
        {
          xField: 'date',
          yField: 'target',
          sort: 'descending',
          seriesType: '2.5Bar'
        },
        {
          xField: 'date',
          yField: 'sale',
          sort: 'descending',
          seriesType: '2.5Bar'
        }
      ];
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
        datasetOptions: datasetOptions,
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
      await flushPromises();
      expect(wrapper.vm.echartOptions.series[0].itemStyle.color).not.toStrictEqual(options.series[0].itemStyle.color);
    });

    it('render cylinder chart with Multiple feature', async () => {
      const datasetOptions = [
        {
          xField: 'date',
          yField: '0-num',
          sort: 'descending',
          seriesType: '2.5Bar'
        },
        {
          xField: 'date',
          yField: '1-num',
          sort: 'descending',
          seriesType: '2.5Bar'
        }
      ];
      const geoJSONDataset = {
        maxFeatures: 20,
        url: '',
        type: 'geoJSON',
        geoJSON: {
          type: 'FeatureCollection',
          features: [
            {
              properties: {
                '0-num': 100,
                '1-num': 160,
                timestamp: '2020-10-01 12:45:02'
              }
            },
            {
              properties: {
                '0-num': 120,
                '1-num': 170,
                timestamp: '2020-10-02 12:45:02'
              }
            }
          ]
        }
      };
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
        datasetOptions: datasetOptions,
        dataset: geoJSONDataset,
        highlightColor
      });
      await flushPromises();
      const echartSeriesLen = wrapper.vm.echartOptions.series.length;
      expect(echartSeriesLen).toBeGreaterThan(options.series.length);
      expect(wrapper.vm.echartOptions.series[echartSeriesLen - 1].type).toBe('pictorialBar');
      expect(wrapper.vm.echartOptions.series[echartSeriesLen - 1].symbolSize).toStrictEqual(['50%', 10]);
      expect(wrapper.vm.echartOptions.series[0].barGap).toBe('0');
      expect(wrapper.vm.echartOptions.series[1].barGap).toBe('0');
      expect(wrapper.vm.echartOptions.series[0].itemStyle.color).not.toBeUndefined;
      expect(wrapper.vm.echartOptions.series[1].itemStyle.color).not.toBeUndefined;
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

  it('specify itemStyle.color which ring is shine', async () => {
    const testColor = 'red';
    const colorFn = jest.fn(params => {
      if (!params.name) {
        return;
      }
      return testColor;
    });
    const series = [
      {
        name: 'demo',
        type: 'pie',
        radius: ['75%', '80%'],
        clockwise: false,
        avoidLabelOverlap: true,
        isShine: true,
        itemStyle: {
          color: colorFn
        },
        outerGap: 0
      }
    ];
    const options = optionFactory(series);
    wrapper = factory({
      options,
      datasetOptions: datasetOptionsFactory(['pie']),
      dataset: geoJSONDataset,
      highlightOptions: [
        {
          seriesIndex: [0],
          dataIndex: 0,
          properties: {
            date: 'Mon',
            sale: 500,
            target: 6000
          },
          color: 'blue'
        }
      ]
    });
    await flushPromises();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.echartOptions.series[0].outerGap).toBeUndefined();
    expect(wrapper.vm.echartOptions.series[0].isShine).toBeUndefined();
    expect(colorFn).toHaveBeenCalled();
    expect(
      wrapper.vm.echartOptions.series[0].data.filter(item => item.name).some(item => item.itemStyle.color === testColor)
    ).toBeTruthy();
    expect(
      wrapper.vm.echartOptions.series[0].data.filter(item => item.name).some(item => item.itemStyle.color === 'blue')
    ).toBeTruthy();
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
    wrapper = factory(
      {
        options: optionFactory(),
        datasetOptions: datasetOptionsFactory(['bar']),
        dataset: geoJSONDataset,
        associatedMap: true
      },
      { localVue }
    );
    const chartInstance = wrapper.vm._getEchart();
    expect(chartInstance).not.toBeUndefined();
    const params = { dataIndex: 0 };
    chartInstance.$emit('click', params);
    expect(wrapper.emitted().click).toBeTruthy();
    expect(wrapper.emitted().click.length).toBe(1);
    expect(wrapper.emitted().click[0]).toEqual([params]);
  });
  it('radar decimals', () => {
    wrapper = factory(
      {
        options: optionFactory(),
        datasetOptions: datasetOptionsFactory(['radar']),
        dataset: geoJSONDataset,
        associatedMap: true
      },
      { localVue }
    );
    const chartInstance = wrapper.vm._getEchart();
    expect(chartInstance).not.toBeUndefined();
    const options = wrapper.vm._handleRadarAxisLabelFormatter({
      radar: {
        decimals: 1,
        indicator: { 0: { text: '1.232', vlaue: 1.232 } }
      }
    });
    expect(options.radar.indicator[0].text).toBe('1.2');
    expect(options.radar.decimals).toBeUndefined();
    const options1 = wrapper.vm._handleRadarAxisLabelFormatter({
      radar: {
        decimals: -1,
        indicator: { 0: { text: '1.232', vlaue: 1.232 } }
      }
    });
    expect(options1.radar.indicator[0].text).toBe('1.232');
  });
  it('highlightOptions, dataZoom', async () => {
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
      data: []
    };
    const options = {
      xAxis: yAxis,
      yAxis: {
        ...xAxis
      },
      legend,
      series: [
        {
          ...serieItem,
          label: {
            normal: {
              decimals: 1,
              show: true,
              position: 'center',
              smart: true
            }
          }
        }
      ]
    };

    wrapper = factory(
      {
        options,
        datasetOptions: datasetOptionsFactory(['bar']),
        dataset: geoJSONDataset
      },
      { localVue }
    );
    jest.useFakeTimers();
    await flushPromises();
    expect(wrapper.vm._chartOptions.dataZoom).toEqual(undefined);
    await wrapper.setProps({
      options: {
        ...options,
        dataZoom: [
          {
            type: 'slider',
            start: 0,
            end: 5,
            xAxisIndex: 0,
            height: 25
          },
          {
            type: 'inside',
            xAxisIndex: 0
          }
        ]
      },
      highlightOptions: [
        {
          color: 'red',
          properties: {
            date: 'Sat',
            sale: 4200,
            target: 6000
          }
        }
      ]
    });
    await flushPromises();
    expect(wrapper.vm.newHighlightOptions.length).toEqual(1);
    expect(wrapper.vm.newHighlightOptions[0].seriesIndex).toEqual([0]);
    expect(wrapper.vm.newHighlightOptions[0].dataIndex).toEqual(6);
    expect(wrapper.vm.newHighlightOptions[0].color).toEqual('red');

    expect(wrapper.vm._chartOptions.dataZoom[0]).toEqual({
      endValue: 210,
      height: 25,
      startValue: 0,
      type: 'slider',
      xAxisIndex: 0
    });
    await wrapper.setProps({
      options: {
        ...options,
        dataZoom: undefined
      }
    });
    await flushPromises();

    expect(wrapper.vm._chartOptions.dataZoom).toEqual(undefined);
    await wrapper.setProps({
      datasetOptions: [{ ...datasetOptionsFactory(['bar'])[0], isStatic: true }],
      dataset: {
        ...geoJSONDataset,
        geoJSON: {
          ...geoJSONDataset.geoJSON,
          features: [
            {
              type: 'Feature',
              properties: {
                date: 'Sat',
                sale: 4200,
                target: 6000
              }
            }
          ]
        }
      }
    });
    await flushPromises();
    expect(wrapper.vm.newHighlightOptions.length).toEqual(1);
    expect(wrapper.vm.newHighlightOptions[0].seriesIndex).toEqual([0]);
    expect(wrapper.vm.newHighlightOptions[0].dataIndex).toEqual(0);
    jest.useRealTimers();
  });

  describe('misc internal methods coverage', () => {
    it('showDetailInfo returns early when mapNotLoadedTip is true', () => {
      wrapper = factory();
      const spyUnSup = jest.spyOn(wrapper.vm, 'unSupportedFeatureTip');
      jest.spyOn(wrapper.vm, 'mapNotLoadedTip').mockReturnValue(true);
      wrapper.vm.showDetailInfo({ geometry: { coordinates: [] }, properties: {} });
      expect(wrapper.vm.mapNotLoadedTip).toHaveBeenCalled();
      expect(spyUnSup).not.toHaveBeenCalled();
    });

    it('_dataZoomChanged does not call _optionsHandler when smart labels not enabled', () => {
      wrapper = factory();
      const spy = jest.spyOn(wrapper.vm, '_optionsHandler').mockImplementation(() => ({}));
      // set options without smart label (include series.type to avoid echarts error)
      wrapper.setProps({ options: { series: [{ type: 'pie', label: { normal: { show: false, smart: false } } }] } });
      wrapper.vm.dataSeriesCache = {};
      wrapper.vm._dataZoomChanged();
      expect(spy).not.toHaveBeenCalled();
    });

    it('delegate methods call through to smChart', () => {
      wrapper = factory();
      const mock = {
        mergeOptions: jest.fn(() => 'merged'),
        appendData: jest.fn(() => 'appended'),
        resize: jest.fn(() => 'resized'),
        dispatchAction: jest.fn(() => 'dispatched'),
        convertToPixel: jest.fn(() => 'pixel')
      };
      wrapper.vm.smChart = mock;
      expect(wrapper.vm.mergeOptions({ a: 1 }, true, false)).toBeUndefined();
      expect(mock.mergeOptions).toHaveBeenCalledWith({ a: 1 }, true, false);
      wrapper.vm.appendData({ b: 2 });
      expect(mock.appendData).toHaveBeenCalledWith({ b: 2 });
      wrapper.vm.resize({ width: 100 });
      expect(mock.resize).toHaveBeenCalledWith({ width: 100 });
      wrapper.vm.dispatchAction({ type: 'test' });
      expect(mock.dispatchAction).toHaveBeenCalledWith({ type: 'test' });
      const cv = wrapper.vm.convertToPixel('finder', [1, 2]);
      expect(cv).toBe('pixel');
    });

    it('chart static methods delegate to ECharts when available', () => {
      // ensure ECharts static functions exist
      const ECharts = require('vue-echarts');
      ECharts.connect = jest.fn();
      ECharts.disConnect = jest.fn();
      ECharts.registerMap = jest.fn();
      ECharts.registerTheme = jest.fn();

      wrapper = factory();
      // static functions are defined on the component export, not instance methods
      ChartMixin.connect('group1');
      expect(ECharts.connect).toHaveBeenCalledWith('group1');
      ChartMixin.disconnect('group1');
      expect(ECharts.disConnect).toHaveBeenCalledWith('group1');
      ChartMixin.registerMap('mapName', { foo: 1 }, { special: true });
      expect(ECharts.registerMap).toHaveBeenCalledWith('mapName', { foo: 1 }, { special: true });
      ChartMixin.registerTheme('dark', { color: '#000' });
      expect(ECharts.registerTheme).toHaveBeenCalledWith('dark', { color: '#000' });
    });
  });

  describe('xBar with visualMap and highlightOptions', () => {
    it('should disable visualMap when xBar has highlightOptions', async () => {
      const geoJSONDataset = {
        maxFeatures: 20,
        url: '',
        type: 'geoJSON',
        geoJSON: {
          type: 'FeatureCollection',
          features: [
            {
              properties: {
                name: 'Item 1',
                value: 100
              }
            }
          ]
        }
      };

      // xBar 配置：yAxis 是 category
      const xBarOptions = {
        yAxis: {
          type: 'category',
          show: true
        },
        xAxis: {
          type: 'value',
          show: false
        },
        series: [
          {
            type: 'bar',
            data: []
          }
        ],
        visualMap: [
          {
            show: false,
            seriesIndex: 0,
            pieces: [
              {
                min: 0,
                max: 100,
                color: '#3fb1e3'
              }
            ],
            outOfRange: {
              color: '#6be6c1'
            }
          }
        ]
      };

      wrapper = factory({
        options: xBarOptions,
        datasetOptions: datasetOptionsFactory(['bar']),
        dataset: geoJSONDataset,
        highlightOptions: [
          {
            seriesIndex: [0],
            dataIndex: 0,
            color: 'red'
          }
        ]
      });

      await flushPromises();

      // visualMap 应该被禁用（设置为 null）
      expect(wrapper.vm.echartOptions.visualMap).toBeNull();
    });

    it('should keep visualMap when not xBar chart', async () => {
      const geoJSONDataset = {
        maxFeatures: 20,
        url: '',
        type: 'geoJSON',
        geoJSON: {
          type: 'FeatureCollection',
          features: [
            {
              properties: {
                name: 'Item 1',
                value: 100
              }
            }
          ]
        }
      };

      // 普通柱状图配置：xAxis 是 category，yAxis 是 value
      const normalBarOptions = {
        xAxis: {
          type: 'category',
          show: true
        },
        yAxis: {
          type: 'value',
          show: true
        },
        series: [
          {
            type: 'bar',
            data: []
          }
        ],
        visualMap: [
          {
            show: false,
            seriesIndex: 0,
            pieces: [
              {
                min: 0,
                max: 100,
                color: '#3fb1e3'
              }
            ],
            outOfRange: {
              color: '#6be6c1'
            }
          }
        ]
      };

      wrapper = factory({
        options: normalBarOptions,
        datasetOptions: datasetOptionsFactory(['bar']),
        dataset: geoJSONDataset,
        highlightOptions: [
          {
            seriesIndex: [0],
            dataIndex: 0,
            color: 'red'
          }
        ]
      });

      await flushPromises();

      // visualMap 应该保留
      expect(wrapper.vm.echartOptions.visualMap).not.toBeNull();
      expect(wrapper.vm.echartOptions.visualMap).toEqual(normalBarOptions.visualMap);
    });

    it('should keep visualMap when xBar has no highlightOptions', async () => {
      const geoJSONDataset = {
        maxFeatures: 20,
        url: '',
        type: 'geoJSON',
        geoJSON: {
          type: 'FeatureCollection',
          features: [
            {
              properties: {
                name: 'Item 1',
                value: 100
              }
            }
          ]
        }
      };

      const xBarOptions = {
        yAxis: {
          type: 'category',
          show: true
        },
        xAxis: {
          type: 'value',
          show: false
        },
        series: [
          {
            type: 'bar',
            data: []
          }
        ],
        visualMap: [
          {
            show: false,
            seriesIndex: 0,
            min: 0,
            max: 100,
            color: '#3fb1e3'
          }
        ]
      };

      wrapper = factory({
        options: xBarOptions,
        datasetOptions: datasetOptionsFactory(['bar']),
        dataset: geoJSONDataset,
        // 没有 highlightOptions
        highlightOptions: []
      });

      await flushPromises();

      // visualMap 应该保留
      expect(wrapper.vm.echartOptions.visualMap).not.toBeNull();
    });
  });

  describe('computed properties', () => {
    it('isPie returns true when series type is pie', () => {
      const options = {
        series: [
          {
            type: 'pie',
            data: []
          }
        ]
      };
      wrapper = factory({ options });
      expect(wrapper.vm.isPie).toBe(true);
    });

    it('isPie returns false when options has no series', () => {
      wrapper = factory({ options: {} });
      expect(wrapper.vm.isPie).toBe(false);
    });

    it('isPie returns false when options is empty', () => {
      wrapper = factory({});
      expect(wrapper.vm.isPie).toBe(false);
    });

    it('maxFeatures returns dataset maxFeatures when not pie chart', () => {
      const dataset = {
        maxFeatures: 100,
        geoJSON: {
          type: 'FeatureCollection',
          features: []
        }
      };
      // xBar 配置：yAxis 是 category
      const xBarOptions = {
        yAxis: {
          type: 'category',
          show: true
        },
        xAxis: {
          type: 'value',
          show: false
        },
        series: [
          {
            type: 'bar',
            data: []
          }
        ],
        visualMap: [
          {
            show: false,
            seriesIndex: 0,
            pieces: [
              {
                min: 0,
                max: 100,
                color: '#3fb1e3'
              }
            ],
            outOfRange: {
              color: '#6be6c1'
            }
          }
        ]
      };
      wrapper = factory({ dataset, options: xBarOptions });
      expect(wrapper.vm.maxFeatures).toBe(100);
    });

    it('maxFeatures returns PIE_MAX_FEATURES when pie chart and maxFeatures is empty string', () => {
      const dataset = {
        maxFeatures: '',
        geoJSON: {
          type: 'FeatureCollection',
          features: []
        }
      };
      const options = {
        series: [
          {
            type: 'pie',
            data: []
          }
        ]
      };
      wrapper = factory({ dataset, options });
      expect(wrapper.vm.maxFeatures).toBe(300);
    });

    it('maxFeatures returns PIE_MAX_FEATURES when pie chart and maxFeatures > 300', () => {
      const dataset = {
        maxFeatures: 500,
        geoJSON: {
          type: 'FeatureCollection',
          features: []
        }
      };
      const options = {
        series: [
          {
            type: 'pie',
            data: []
          }
        ]
      };
      wrapper = factory({ dataset, options });
      expect(wrapper.vm.maxFeatures).toBe(300);
    });

    it('maxFeatures returns original value when pie chart and maxFeatures <= 300', () => {
      const dataset = {
        maxFeatures: 200,
        geoJSON: {
          type: 'FeatureCollection',
          features: []
        }
      };
      const options = {
        series: [
          {
            type: 'pie',
            data: []
          }
        ]
      };
      wrapper = factory({ dataset, options });
      expect(wrapper.vm.maxFeatures).toBe(200);
    });

    it('_dataset returns null when dataset is null', () => {
      wrapper = factory({ dataset: null });
      expect(wrapper.vm._dataset).toBeNull();
    });

    it('isStastic returns true when datasetOptions has isStastic true', () => {
      wrapper = factory({
        datasetOptions: [
          {
            xField: 'date',
            yField: 'sale',
            isStastic: true
          }
        ]
      });
      expect(wrapper.vm.isStastic).toBe(true);
    });

    it('isStastic returns false when datasetOptions has isStastic false', () => {
      wrapper = factory({
        datasetOptions: [
          {
            xField: 'date',
            yField: 'sale',
            isStastic: false
          }
        ]
      });
      expect(wrapper.vm.isStastic).toBe(false);
    });

    it('isStastic returns false when datasetOptions has no isStastic', () => {
      wrapper = factory({
        datasetOptions: [
          {
            xField: 'date',
            yField: 'sale'
          }
        ]
      });
      expect(wrapper.vm.isStastic).toBe(false);
    });

    it('isStastic returns false when datasetOptions is null', () => {
      wrapper = factory({
        datasetOptions: null
      });
      expect(wrapper.vm.isStastic).toBe(false);
    });
  });

  describe('colorNumber computed property', () => {
    it('returns colorGroupsData length when no series', () => {
      wrapper = factory({});
      expect(wrapper.vm.colorNumber).toBe(wrapper.vm.colorGroupsData.length);
    });
  });

  describe('_isRequestData computed property', () => {
    it('returns false when dataset is empty', () => {
      wrapper = factory({ dataset: {}, datasetOptions: [] });
      expect(wrapper.vm._isRequestData).toBe(false);
    });

    it('returns false when datasetOptions is empty', () => {
      wrapper = factory({
        dataset: { url: 'http://example.com' },
        datasetOptions: []
      });
      expect(wrapper.vm._isRequestData).toBe(false);
    });

    it('returns true when dataset has url and datasetOptions is not empty', () => {
      wrapper = factory({
        dataset: { url: 'http://example.com' },
        datasetOptions: [{ xField: 'date', yField: 'sale' }]
      });
      expect(wrapper.vm._isRequestData).toBe(true);
    });

    it('returns true when dataset has geoJSON and datasetOptions is not empty', () => {
      wrapper = factory({
        dataset: {
          geoJSON: {
            type: 'FeatureCollection',
            features: []
          }
        },
        datasetOptions: [{ xField: 'date', yField: 'sale' }]
      });
      expect(wrapper.vm._isRequestData).toBe(true);
    });
  });

  describe('methods - timing', () => {
    it('sets dataSeriesCache and echartOptions when echartsDataService exists', async () => {
      const options = {
        series: [
          {
            type: 'pie',
            data: []
          }
        ]
      };
      wrapper = factory({ options });
      const mockOptions = { series: [{ data: [1, 2, 3] }] };
      wrapper.vm.echartsDataService = {
        getDataOption: jest.fn().mockResolvedValue(mockOptions)
      };
      const spyHandler = jest.spyOn(wrapper.vm, '_optionsHandler');

      wrapper.vm.timing();
      await flushPromises();

      expect(wrapper.vm.dataSeriesCache).toEqual(mockOptions);
      expect(spyHandler).toHaveBeenCalled();
    });
  });
});
