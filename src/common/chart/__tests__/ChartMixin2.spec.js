import { mount, shallowMount } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import ChartMixin from '../ChartMixin.vue';
import Message from 'vue-iclient/src/common/message/index.js';
import * as util from 'vue-iclient/src/common/_utils/util';
import { ColorsPickerUtil } from 'vue-iclient/static/libs/iclient-common/iclient-common';

const factory = (propsData = {}, componentOptions = {}) => {
  return mount(ChartMixin, {
    propsData: Object.assign(
      {
        colorGroup: ['#3fb1e3', '#6be6c1']
      },
      propsData
    ),
    ...componentOptions
  });
};

describe('ChartMixin additional coverage', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('_controlLabel formatter respects maxLabels and formats correctly', () => {
    const wrapper = factory();
    const normalLabel = {
      show: true,
      originFormatter: '{b}: {c}',
      xFieldDecimals: 2,
      decimals: 1
    };
    const out = wrapper.vm._controlLabel(normalLabel, 2);
    expect(typeof out.formatter).toBe('function');
    // dataIndex within limit
    expect(out.formatter({ dataIndex: 0, name: '1.234', value: 1.2547, percent: 125.47 })).toBe('1.23: 1.3');
    // dataIndex exceed maxLabels -> empty
    expect(out.formatter({ dataIndex: 2, name: '1.234', value: 1.2547, percent: 125.47 })).toBe('');
  });

  it('setItemStyleColor highlights pie slices and uses serieColor for others', async () => {
    // use shallow mount to avoid echarts initialization
    const wrapper = shallowMount(ChartMixin, {
      propsData: Object.assign({ colorGroup: ['#3fb1e3', '#6be6c1'] }, { options: { series: [ { itemStyle: { color: 'red' }, type: 'pie' }, { itemStyle: { color: 'blue' }, type: 'bar' } ] } })
    });
    // prepare echartOptions to be manipulated
    wrapper.vm.echartOptions = { series: [ { type: 'pie', data: [1,2] }, { type: 'bar', data: [3,4] } ] };
    // avoid mutating prop directly: use setProps to set highlightOptions
    await wrapper.setProps({ highlightOptions: [ { seriesIndex: [0], dataIndex: 1, color: 'pink' } ] });

    // Ensure ColorPicker used for non-highlight pie
    const spyColors = jest.spyOn(ColorsPickerUtil, 'getGradientColors');
    wrapper.vm.setItemStyleColor(true);

    const pieColorFn = wrapper.vm.echartOptions.series[0].itemStyle.color;
    const barColorFn = wrapper.vm.echartOptions.series[1].itemStyle.color;

    expect(typeof pieColorFn).toBe('function');
    expect(typeof barColorFn).toBe('function');
    // highlighted pie index 1 -> pink
    expect(pieColorFn({ dataIndex: 1 })).toBe('pink');
    // non highlighted pie index 0 -> uses color picker result (string)
    const nonHl = pieColorFn({ dataIndex: 0 });
    expect(typeof nonHl).toBe('string');
    // bar series non-highlight returns serieColor
    expect(barColorFn({ dataIndex: 0 })).toBe('blue');
    expect(spyColors).toHaveBeenCalled();
  });

  it('setPieAutoPlay and clearPieAutoPlay dispatch actions', async () => {
    // shallow mount to avoid echarts internal init
    const wrapper = shallowMount(ChartMixin, { propsData: { options: { legend: { data: [0,1,2] }, series: [ { type: 'pie' } ] }, colorGroup: ['#3fb1e3', '#6be6c1'] } });
    const echartsNode = { dispatchAction: jest.fn() };

    jest.useFakeTimers();
    wrapper.vm.setPieAutoPlay(echartsNode);
    // advance so interval runs a few times
    jest.advanceTimersByTime(4500);
    expect(echartsNode.dispatchAction).toHaveBeenCalled();

    const callsBeforeClear = echartsNode.dispatchAction.mock.calls.length;
    wrapper.vm.clearPieAutoPlay(echartsNode);
    // clear should call downplay for each legend item
    expect(echartsNode.dispatchAction.mock.calls.length).toBeGreaterThanOrEqual(callsBeforeClear + 3);
  });

  it('timing uses echartsDataService to set dataSeriesCache and echartOptions', async () => {
    const wrapper = factory();
    wrapper.vm.echartsDataService = { getDataOption: jest.fn(() => Promise.resolve({ foo: 'bar' })) };
    jest.spyOn(wrapper.vm, 'hideLoading').mockImplementation(() => {});
    const spyOptionsHandler = jest.spyOn(wrapper.vm, '_optionsHandler').mockImplementation((opt, options) => ({ merged: true, options }));

    await wrapper.vm.timing();
    await flushPromises();

    expect(wrapper.vm.dataSeriesCache).toEqual({ foo: 'bar' });
    expect(wrapper.vm.echartOptions).toEqual({ merged: true, options: { foo: 'bar' } });
    expect(wrapper.vm.datasetChange).toBe(false);
    expect(spyOptionsHandler).toHaveBeenCalled();
  });

  it('unSupportedFeatureTip triggers Message.warning', () => {
    const wrapper = factory();
    const spy = jest.spyOn(Message, 'warning').mockImplementation(() => {});
    wrapper.vm.unSupportedFeatureTip();
    expect(spy).toHaveBeenCalled();
  });

  it('handleChartClick forwards selected feature to showDetailInfo when associatedMap', () => {
    const wrapper = factory({ associatedMap: true });
    wrapper.vm.echartsDataService = { sortDataCache: { features: [ { id: 1 }, { id: 2 } ] } };
    const spy = jest.spyOn(wrapper.vm, 'showDetailInfo').mockImplementation(() => {});

    wrapper.vm.handleChartClick({ dataIndex: 1 });
    expect(spy).toHaveBeenCalledWith({ id: 2 });
  });

  it('showDetailInfo calls viewModel.setPopupContent when feature has coordinates', async () => {
    const wrapper = factory();
    const feature = { geometry: { coordinates: [1,2] }, properties: { a: 'b' } };
    // stub getFeatureCenter
    jest.spyOn(util, 'getFeatureCenter').mockReturnValue([100,200]);
    wrapper.vm.viewModel = { setPopupContent: jest.fn() };
    wrapper.vm.$refs.chartTablePopup = { $el: {} };

    wrapper.vm.showDetailInfo(feature);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.tablePopupProps.data.length).toBe(1);
    expect(wrapper.vm.viewModel.setPopupContent).toHaveBeenCalled();
  });

  it('showDetailInfo calls unSupportedFeatureTip when no coordinates and map is loaded', () => {
    const wrapper = factory();
    const feature = { geometry: { coordinates: [] }, properties: {} };
    jest.spyOn(wrapper.vm, 'mapNotLoadedTip').mockReturnValue(false);
    const spy = jest.spyOn(wrapper.vm, 'unSupportedFeatureTip').mockImplementation(() => {});

    wrapper.vm.showDetailInfo(feature);
    expect(spy).toHaveBeenCalled();
  });

  it('generateTableData filters falsy properties', () => {
    const wrapper = factory();
    const props = { a: '1', b: '', c: null, d: 0, e: 'x' };
    const res = wrapper.vm.generateTableData(props);
    // only truthy values (a and e)
    expect(res.data.length).toBe(2);
    expect(res.data.find(i => i.attribute === 'a')).toBeTruthy();
    expect(res.data.find(i => i.attribute === 'e')).toBeTruthy();
  });

  it('_dataZoomChanged calls _optionsHandler when smart labels enabled', () => {
    const wrapper = factory();
    const spy = jest.spyOn(wrapper.vm, '_optionsHandler').mockImplementation(() => ({}));
    // use setProps to avoid mutating props directly and include a valid series.type to avoid echarts runtime errors
    wrapper.setProps({ options: { series: [ { type: 'pie', label: { normal: { show: true, smart: true } } } ] } });
    wrapper.vm.dataSeriesCache = { foo: 'bar' };
    wrapper.vm._dataZoomChanged();
    expect(spy).toHaveBeenCalledWith(wrapper.vm.options, wrapper.vm.dataSeriesCache, true);
  });

  it('delegate convertToPixel returns delegated value', () => {
    const wrapper = factory();
    wrapper.vm.smChart = { convertToPixel: jest.fn(() => 'pixel-val') };
    const res = wrapper.vm.convertToPixel('finder', [1,2]);
    expect(res).toBe('pixel-val');
  });

  describe('registerShape and custom rings effects', () => {
    it('registerShape registers cube shapes when not present and buildPath executes', () => {
      const wrapper = shallowMount(ChartMixin, {
        propsData: {
          datasetOptions: [ { seriesType: '2.5Bar' } ],
          options: { series: [ { type: '2.5Bar', shape: 'square' } ] },
          colorGroup: ['#3fb1e3']
        }
      });
      const registered = [];
      const captured = [];
      const fakeGraphic = {
        getShapeClass: jest.fn(() => undefined),
        extendShape: jest.fn((obj) => { captured.push(obj); return obj; }),
        registerShape: jest.fn((name) => registered.push(name))
      };
      wrapper.vm.$options.graphic = fakeGraphic;
      wrapper.vm.registerShape();
      expect(fakeGraphic.extendShape).toHaveBeenCalled();
      expect(registered).toEqual(expect.arrayContaining(['CubesquareLeft', 'CubesquareRight', 'CubesquareTop']));

      // execute buildPath for captured shapes to cover drawing logic
      const ctx = { moveTo: jest.fn(() => ctx), lineTo: jest.fn(() => ctx), closePath: jest.fn() };
      captured.forEach(obj => {
        if (obj && typeof obj.buildPath === 'function') {
          obj.buildPath(ctx, { x: 10, y: 20, bottomYAxis: 100 });
        }
      });
      expect(ctx.moveTo).toHaveBeenCalled();
    });

    it('registerShape skips when shape already registered', () => {
      const wrapper = shallowMount(ChartMixin, {
        propsData: {
          datasetOptions: [ { seriesType: '2.5Bar' } ],
          options: { series: [ { type: '2.5Bar', shape: 'rectangle' } ] },
          colorGroup: ['#3fb1e3']
        }
      });
      const fakeGraphic = {
        getShapeClass: jest.fn((name) => (name === 'CuberectangleLeft' ? { exists: true } : undefined)),
        extendShape: jest.fn(() => ({})),
        registerShape: jest.fn()
      };
      wrapper.vm.$options.graphic = fakeGraphic;
      wrapper.vm.registerShape();
      // since getShapeClass returned truthy for left, extendShape/registerShape should not be called
      expect(fakeGraphic.extendShape).not.toHaveBeenCalled();
      expect(fakeGraphic.registerShape).not.toHaveBeenCalled();
    });

    it('customRingsLine and customRingsPoint produce renderItems with expected types', () => {
      const wrapper = shallowMount(ChartMixin, { propsData: { colorGroup: ['#3fb1e3'] } });
      const lineSeries = wrapper.vm.customRingsLine(0, 90, 10, 'red', 0.5);
      expect(lineSeries.renderItem).toBeInstanceOf(Function);
      const arc = lineSeries.renderItem(null, { getWidth: () => 200, getHeight: () => 100 });
      expect(arc.type).toBe('arc');
      const pointSeries = wrapper.vm.customRingsPoint(10, -5, 'blue', 0.6);
      const circle = pointSeries.renderItem(null, { getWidth: () => 200, getHeight: () => 100 });
      expect(circle.type).toBe('circle');
      expect(circle.shape.r).toBe(4);
    });

    it('addEffect pushes lines and points based on pointState', () => {
      const wrapper = shallowMount(ChartMixin, {
        propsData: {
          options: { series: [ { customOptions: { pointState: 'startPoint', radius: 0.5, color: 'green' } } ] },
          colorGroup: ['#3fb1e3']
        }
      });
      wrapper.vm.customSeries = [];
      wrapper.vm.addEffect(30);
      // 4 lines + 2 points expected when pointState === 'startPoint'
      expect(wrapper.vm.customSeries.length).toBe(6);
      // check that renderItem exists on some series
      expect(wrapper.vm.customSeries[0].renderItem).toBeDefined();
    });

    it('startEffect sets interval and updates customSeries', () => {
      jest.useFakeTimers();
      const wrapper = shallowMount(ChartMixin, {
        propsData: {
          options: { series: [ { customType: 'customRingsSeries', customOptions: { pointState: 'startPoint', radius: 0.5, color: 'green' } } ] },
          colorGroup: ['#3fb1e3']
        }
      });
      // start the effect
      wrapper.vm.startEffect();
      expect(wrapper.vm.startSpin).not.toBeNull();
      jest.advanceTimersByTime(250);
      expect(wrapper.vm.customSeries.length).toBeGreaterThan(0);
      clearInterval(wrapper.vm.startSpin);
      jest.useRealTimers();
    });

    it('registerShape executes buildPath for rectangle shapes', () => {
      const wrapper = shallowMount(ChartMixin, {
        propsData: {
          datasetOptions: [ { seriesType: '2.5Bar' } ],
          options: { series: [ { type: '2.5Bar', shape: 'rectangle' } ] },
          colorGroup: ['#3fb1e3']
        }
      });
      const registered = [];
      const captured = [];
      const fakeGraphic = {
        getShapeClass: jest.fn(() => undefined),
        extendShape: jest.fn((obj) => { captured.push(obj); return obj; }),
        registerShape: jest.fn((name) => registered.push(name))
      };
      wrapper.vm.$options.graphic = fakeGraphic;
      wrapper.vm.registerShape();
      expect(registered).toEqual(expect.arrayContaining(['CuberectangleLeft', 'CuberectangleRight', 'CuberectangleTop']));
      const ctx = { moveTo: jest.fn(() => ctx), lineTo: jest.fn(() => ctx), closePath: jest.fn() };
      captured.forEach(obj => {
        if (obj && typeof obj.buildPath === 'function') {
          obj.buildPath(ctx, { x: 5, y: 15, bottomYAxis: 80 });
        }
      });
      expect(ctx.moveTo).toHaveBeenCalled();
    });

    it('getCirlPoint computes coordinates correctly', () => {
      const wrapper = shallowMount(ChartMixin);
      const p = wrapper.vm.getCirlPoint(0, 0, 1, 0);
      expect(p.x).toBeCloseTo(1);
      expect(p.y).toBeCloseTo(0);
    });

    it('startEffect returns early when options.series is missing', () => {
      jest.useFakeTimers();
      const wrapper = shallowMount(ChartMixin, { propsData: { options: {}, colorGroup: ['#3fb1e3'] } });
      wrapper.vm.customSeries = [];
      wrapper.vm.startEffect();
      jest.advanceTimersByTime(250);
      expect(wrapper.vm.customSeries.length).toBe(0);
      clearInterval(wrapper.vm.startSpin);
      jest.useRealTimers();
    });

    it('startEffect does not call addEffect when customType is different', () => {
      jest.useFakeTimers();
      const wrapper = shallowMount(ChartMixin, { propsData: { options: { series: [ { customType: 'other' } ] }, colorGroup: ['#3fb1e3'] } });
      const spy = jest.spyOn(wrapper.vm, 'addEffect');
      wrapper.vm.startEffect();
      jest.advanceTimersByTime(200);
      expect(spy).not.toHaveBeenCalled();
      clearInterval(wrapper.vm.startSpin);
      jest.useRealTimers();
    });

    it('startEffect callback runs synchronously with mocked setInterval', () => {
      const realSetInterval = global.setInterval;
      global.setInterval = jest.fn((cb) => { cb(); return 999; });
      const wrapper = shallowMount(ChartMixin, {
        propsData: {
          options: { series: [ { customType: 'customRingsSeries', customOptions: { pointState: 'startPoint', radius: 0.5, color: 'red' } } ] },
          colorGroup: ['#3fb1e3']
        }
      });
      wrapper.vm.customSeries = [];
      wrapper.vm.startEffect();
      expect(wrapper.vm.customSeries.length).toBeGreaterThan(0);
      // restore
      global.setInterval = realSetInterval;
    });
  });
});
