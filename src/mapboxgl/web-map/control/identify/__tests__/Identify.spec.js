import { mount, config } from '@vue/test-utils';
import SmIdentify from '../Identify.vue';
import Identify from '../index';
import { LineStyle, CircleStyle, FillStyle } from '../../../../_types/index';
import mapboxgl from '@libs/mapboxgl/mapbox-gl-enhance.js';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap';

describe('Identify.vue', () => {
  let wrapper;
  let mapWrapper;

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
        fields: ['机场','同比增速%','2017旅客吞吐量（人次）'],
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
        fields: ['机场','同比增速%','2017旅客吞吐量（人次）']
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
        layers: ['第七次人口普查全国各省人口数(未包含港澳台','第七次人口普查全国各省人口数(未包含港澳台-strokeLine'],
        fields: ['地区','人口数'],
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
    expect(wrapper.vm.viewModel.layerStyle.stokeLine.paint['line-color']).toBe(color);

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
        fields: ['机场','同比增速%','2017旅客吞吐量（人次）']
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

  it('render index correctly', () => {
    wrapper = mount(Identify);
  });
});
