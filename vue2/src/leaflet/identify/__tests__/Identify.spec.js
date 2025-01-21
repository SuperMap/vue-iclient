import { mount, config } from '@vue/test-utils';
import SmIdentify from '../Identify.vue';
import Identify from '../index';
import L from 'vue-iclient/src/leaflet/leaflet-wrapper';

describe('Identify.vue', () => {
  let wrapper, mapWrapper, map;
  beforeEach(() => {
    config.mapLoad = false;
    wrapper = null;
    map = {
      getLayerByName: jest.fn().mockReturnValue({
        on: jest.fn(),
        off: jest.fn()
      }),
      getLayerById: jest.fn().mockReturnValue({
        on: jest.fn(),
        off: jest.fn()
      }),
      addLayer: jest.fn(),
      removeLayer: jest.fn()
    };
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
    map = null;
  });

  it('change props layerNames', async done => {
    wrapper = mount(SmIdentify, {
      propsData: {
        layerNames: ['China'],
        fields: ['机场', '同比增速%', '2017旅客吞吐量（人次）']
      }
    });
    wrapper.vm.map = map;
    wrapper.vm.$options.loaded.call(wrapper.vm);
    expect(wrapper.vm.viewModel).not.toBeUndefined();
    const spy = jest.spyOn(wrapper.vm.viewModel, 'removed');
    const e = {
      target: '',
      point: {
        x: 10,
        y: 10
      }
    };
    wrapper.setProps({
      layerNames: ['民航数据']
    });
    await wrapper.vm.$nextTick();
    expect(spy).toHaveBeenCalledTimes(1);
    done();
  });

  it('layer click', async done => {
    jest.useFakeTimers();
    wrapper = mount(Identify, {
      propsData: {
        layerNames: ['China', 'GeoJSONLayer', 'RangeLayer'],
        fields: ['SmID', '标准名称', 'smpid']
      }
    });
    const listenList = [];
    const feature = {
      geometry: {
        coordinates: [],
        type: 'Point'
      },
      id: '1',
      type: 'Feature',
      properties: {
        SmID: 1,
        标准名称: '地铁二号线',
        smpid: 1
      }
    };
    class GeoLayer extends L.GeoJSON {
      constructor() {
        super();
      }
      on(type, cb) {
        listenList.push(cb);
      }
      getFeatureById() {
        return feature;
      }
    }
    const getLayer = name => {
      if (name === 'GeoJSONLayer') {
        return new GeoLayer();
      }
      const commonOptions = {
        on: jest.fn((type, cb) => {
          listenList.push(cb);
        }),
        off: jest.fn()
      };
      if (name === 'RangeLayer') {
        return {
          ...commonOptions,
          TFEvents: []
        };
      }
      return {
        ...commonOptions,
        _layers: [
          new GeoLayer(),
          {
            ...commonOptions,
            TFEvents: []
          },
          commonOptions
        ]
      };
    };
    wrapper.vm.map = {
      ...map,
      getLayerByName: jest.fn(getLayer),
      getLayerById: jest.fn(getLayer)
    };
    wrapper.vm.$options.loaded.call(wrapper.vm);
    expect(listenList.length).not.toBe(0);
    const layer = {
      feature,
      bindPopup: jest.fn(),
      openPopup: jest.fn(),
      closePopup: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      options: {}
    };
    listenList.forEach(cb => {
      cb({
        layer: layer,
        sourceTarget: layer,
        latlng: { lng: 116.38050072430798, lat: 39.94888011518407 }
      });
    });
    await wrapper.vm.$nextTick();
    jest.advanceTimersByTime(1000);
    expect(wrapper.vm.popupLayers.length).not.toBe(0);
    jest.useRealTimers();
    done();
  });
});

