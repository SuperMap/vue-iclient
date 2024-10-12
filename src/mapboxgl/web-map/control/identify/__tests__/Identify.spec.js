import { mount, config } from '@vue/test-utils';
import SmIdentify from '../Identify.vue';
import Identify from '../index';
import { LineStyle, CircleStyle, FillStyle } from '../../../../_types/index';
import mapboxgl from '@libs/mapboxgl/mapbox-gl-enhance.js';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap';

describe('Identify.vue', () => {
  let wrapper, mapWrapper;
  beforeEach(() => {
    config.mapLoad = false;
    wrapper = null;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    config.mapLoad = true;
    if (mapWrapper) {
      mapWrapper.destroy();
    }
    if (wrapper) {
      wrapper.destroy();
    }
  });

  it('render default correctly', async done => {
    mapWrapper = await createEmptyMap();
    wrapper = mount(SmIdentify, {
      propsData: {
        layers: ['民航数据'],
        fields: ['机场', '同比增速%', '2017旅客吞吐量（人次）'],
        autoResize: false
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.find('.sm-component-identify').exists()).toBe(true);
    wrapper.vm.getWidthStyle;
    expect(wrapper.vm.keyMaxWidth).toBe(110);
    expect(wrapper.vm.valueMaxWidth).toBe(170);
    done();
  });

  it('clcik map', async done => {
    mapWrapper = await createEmptyMap();
    wrapper = mount(SmIdentify, {
      propsData: {
        layers: ['China'],
        fields: ['机场', '同比增速%', '2017旅客吞吐量（人次）']
      }
    });
    await mapSubComponentLoaded(wrapper);
    const spyPopup = jest.spyOn(mapboxgl, 'Popup');
    spyPopup.mockReturnValue({
      setLngLat: jest.fn().mockReturnValue({
        setDOMContent: jest.fn().mockReturnValue({
          addTo: jest.fn().mockReturnValue({
            remove: jest.fn(),
            off: jest.fn(),
            on: jest.fn()
          })
        })
      })
    });
    const spy = jest.spyOn(wrapper.vm.viewModel, 'removed');
    const e = {
      target: '',
      point: {
        x: 10,
        y: 10
      }
    };
    wrapper.vm.map.fire('click', e);
    await wrapper.setProps({
      layers: ['民航数据']
    });
    expect(spy).toHaveBeenCalledTimes(1);
    done();
  });

  it('clcik layer on map', async done => {
    // 设置外界传入的参数，对面填充和边框的颜色
    const color = '#FF0000';
    mapWrapper = await createEmptyMap();
    wrapper = mount(SmIdentify, {
      propsData: {
        layers: ['第七次人口普查全国各省人口数(未包含港澳台', '第七次人口普查全国各省人口数(未包含港澳台-strokeLine'],
        fields: ['地区', '人口数'],
        layerStyle: {
          line: new LineStyle({ 'line-width': 3, 'line-color': '#3fb1e3' }),
          circle: new CircleStyle({ 'circle-color': '#3fb1e3', 'circle-radius': 6 }),
          fill: new FillStyle({ 'fill-color': '#3fb1e3', 'fill-opacity': 0.8 }),
          stokeLine: new LineStyle({ 'line-width': 3, 'line-color': color })
        }
      }
    });
    await mapSubComponentLoaded(wrapper);
    wrapper.vm.setViewModel();
    const spy = jest.spyOn(wrapper.vm.viewModel, 'addOverlayToMap');
    // 手动设置点击事件的参数，确认是再点击面
    const layer = {
      id: '第七次人口普查全国各省人口数(未包含港澳台',
      type: 'fill',
      source: '第七次人口普查全国各省人口数(未包含港澳台',
      minzoom: 0,
      maxzoom: 22,
      layout: {},
      paint: {
        'fill-color': { r: 0.5098039215686274, g: 0.42745098039215684, b: 0.7294117647058823, a: 1 },
        'fill-opacity': 0.9
      }
    };
    // 设置过了条件，点击的行政区域
    const filter = '["all",["==","地区","青海"]]';

    //
    wrapper.vm.viewModel.addOverlayToMap(layer, filter);

    // 确保修改图层的函数被执行
    expect(spy).toHaveBeenCalledTimes(1);

    // 判断图层颜色是否被修改
    expect(wrapper.vm.viewModel.hightlightStyle.strokeLine.paint['line-color']).toBe(color);

    done();
  });

  it('clcik layer not on map', async done => {
    mapWrapper = await createEmptyMap();
    wrapper = mount(SmIdentify, {
      propsData: {
        layers: ['test']
      }
    });
    await mapSubComponentLoaded(wrapper);
    wrapper.vm.bindQueryRenderedFeatures(
      {
        target: {
          getLayer: jest.fn(),
          queryRenderedFeatures: (a, b) => {
            expect(b.layers.length).toBe(0);
            done();
          }
        },
        point: { x: 0, y: 0 }
      },
      ['test']
    );
    done();
  });

  it('grab', async done => {
    mapWrapper = await createEmptyMap();
    wrapper = mount(SmIdentify, {
      propsData: {
        layers: ['China'],
        fields: ['机场', '同比增速%', '2017旅客吞吐量（人次）']
      }
    });
    await mapSubComponentLoaded(wrapper);
    const spy = jest.spyOn(wrapper.vm.map, 'getCanvas');
    wrapper.vm.getWidthStyle;
    wrapper.vm.layerStyle;
    wrapper.vm.changeCursorGrab();
    wrapper.vm.changeCursorPointer();
    expect(spy).toHaveBeenCalledTimes(4);
    done();
  });

  it('render index correctly', done => {
    wrapper = mount(Identify);
    done();
  });

  it('changeLayers', async done => {
    mapWrapper = await createEmptyMap();
    wrapper = mount(SmIdentify, {
      propsData: {
        multiSelect: true,
        layers: ['民航数据'],
        fields: ['机场'],
        autoResize: false
      }
    });
    await mapSubComponentLoaded(wrapper);
    wrapper.vm.keydownCtrlCb({ ctrlKey: true });
    expect(wrapper.vm.isKeydownCtrl).toBe(true);
    wrapper.vm.map.queryRenderedFeatures = () => {
      return [
        {
          _vectorTileFeature: { _keys: ['机场', 'id'] },
          layer: { id: '民航数据' },
          properties: {
            id: 1,
            机场: '天府机场'
          }
        }
      ];
    };
    wrapper.vm.map.fire('click', {
      target: {
        getLayer: jest.fn()
      },
      point: {
        x: 10,
        y: 10
      }
    });
    wrapper.setProps({layers: ['民航数据']})
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.popupProps).toEqual({
      机场: {
        slotName: undefined,
        value: '天府机场'
      }
    });
    expect(wrapper.vm.currentLayer.id).toEqual('民航数据');
    expect(wrapper.vm.filters.length).toBe(2);
    expect(wrapper.vm.currentIndex).toBe(0);

    wrapper.setProps({layers: ['']})
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.currentLayer).toBe(null);
    expect(wrapper.vm.filters.length).toBe(1);
    expect(wrapper.vm.currentIndex).toBe(0);
    done();
  });

  it('multiSelect', async done => {
    mapWrapper = await createEmptyMap();
    wrapper = mount(SmIdentify, {
      propsData: {
        multiSelect: true,
        layers: ['民航数据'],
        fields: ['机场'],
        autoResize: false
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.find('.sm-component-identify').exists()).toBe(true);
    wrapper.vm.keydownCtrlCb({ ctrlKey: true });
    expect(wrapper.vm.isKeydownCtrl).toBe(true);
    wrapper.vm.map.queryRenderedFeatures = () => {
      return [
        {
          _vectorTileFeature: { _keys: ['机场', 'id'] },
          layer: { id: '民航数据' },
          properties: {
            id: 1,
            机场: '天府机场'
          }
        }
      ];
    };
    wrapper.vm.map.fire('click', {
      target: {
        getLayer: jest.fn()
      },
      point: {
        x: 10,
        y: 10
      }
    });
    expect(wrapper.vm.popupProps).toEqual({
      机场: {
        slotName: undefined,
        value: '天府机场'
      }
    });
    expect(wrapper.vm.currentLayer.id).toEqual('民航数据');
    expect(wrapper.vm.filters.length).toBe(2);
    expect(wrapper.vm.currentIndex).toBe(0);

    wrapper.vm.map.queryRenderedFeatures = () => {
      return [
        {
          _vectorTileFeature: { _keys: ['机场', 'id'] },
          layer: { id: '民航数据' },
          properties: {
            id: 2,
            机场: '大连机场'
          }
        }
      ];
    };
    wrapper.vm.map.fire('click', {
      target: {
        getLayer: jest.fn()
      },
      point: {
        x: 11,
        y: 12
      }
    });

    expect(wrapper.vm.popupProps).toEqual({
      机场: {
        slotName: undefined,
        value: '大连机场'
      }
    });
    expect(wrapper.vm.currentLayer.id).toEqual('民航数据');
    expect(wrapper.vm.filters.length).toBe(3);
    expect(wrapper.vm.currentIndex).toBe(1);

    wrapper.vm.keyupCtrlCb({ key: 'Control' });
    expect(wrapper.vm.isKeydownCtrl).toBe(false);
    expect(wrapper.vm.popupProps).toEqual({ 机场: { slotName: undefined, value: '大连机场' } });

    wrapper.vm.map.queryRenderedFeatures = () => {
      return [];
    };
    wrapper.vm.map.fire('click', {
      target: {
        getLayer: jest.fn()
      },
      point: {
        x: 11,
        y: 12
      }
    });
    expect(wrapper.vm.filters.length).toBe(1);

    expect(wrapper.vm.valueMaxWidth).toBe(170);
    done();
  });
  it('field title', async done => {
    mapWrapper = await createEmptyMap();
    wrapper = mount(SmIdentify, {
      propsData: {
        multiSelect: true,
        layers: ['民航数据'],
        fields: [[
          {
            "slotName":"6",
            "linkTitle":"",
            "field":"机场",
            "title":"机场22",
            "linkTarget":"_blank",
            "repeatOption":"left",
            "type":"text"
          }
        ]],
        autoResize: false
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.find('.sm-component-identify').exists()).toBe(true);
    wrapper.vm.map.queryRenderedFeatures = () => {
      return [
        {
          _vectorTileFeature: { _keys: ['机场', 'id'] },
          layer: { id: '民航数据' },
          properties: {
            id: 1,
            机场: '天府机场'
          }
        }
      ];
    };
    wrapper.vm.map.fire('click', {
      target: {
        getLayer: jest.fn()
      },
      point: {
        x: 10,
        y: 10
      }
    });
    expect(wrapper.vm.popupProps).toEqual({
      机场22: {
        slotName: '6',
        value: '天府机场'
      }
    });
    done();
  });
});
