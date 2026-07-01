import { mount } from '@vue/test-utils';
import SmLegend from '../Legend.vue';
import StyleRenderer from '../subs/StyleRenderer.vue';
import ImageRenderer from '../subs/ImageRenderer.vue';
import StyleValue from '../subs/StyleValue.vue';
import mapLegends from 'vue-iclient/test/unit/mocks/data/WebMap/map_legends.json';
import flushPromises from 'flush-promises';
import SmWebMap from '../../../WebMap';
import mockFetch from 'vue-iclient/test/unit/mocks/FetchRequest';
import iportal_serviceProxy from 'vue-iclient/test/unit/mocks/data/iportal_serviceProxy';
import uniqueLayer_point from 'vue-iclient/test/unit/mocks/data/WebMap/uniqueLayer_point';
import layerData from 'vue-iclient/test/unit/mocks/data/layerData';

describe('Legend.vue', () => {
  let wrapper, mapWrapper, imageOnload;
  const documentBak = document;
  const ImageBak = Image;

  beforeEach(function() {
    document.getElementById = function() {
      return {
        getContext: function() {
          return {
            arc: jest.fn(),
            fill: jest.fn(),
            fillRect: jest.fn(),
            strokeRect: jest.fn(),
            clearRect: jest.fn(),
            beginPath: jest.fn(),
            closePath: jest.fn(),
            setLineDash: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            stroke: jest.fn(),
            drawImage: jest.fn(),
            createPattern: jest.fn(),
            createLinearGradient: function() {
              return {
                addColorStop: jest.fn()
              };
            }
          };
        }
      };
    };
  });

  beforeAll(() => {
    Object.defineProperty(Image.prototype, 'onload', {
      get: function () {
        return this._onload;
      },
      set: function (fn) {
        imageOnload = fn;
        this._onload = fn;
      }
    });
  });

  afterAll(() => {
    global.Image = ImageBak;
    global.document = documentBak;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
      wrapper = null;
    }
    if (mapWrapper) {
      mapWrapper.destroy();
      mapWrapper = null;
    }
    jest.resetAllMocks();
  });

  it('render default correctly', async done => {
    jest.useFakeTimers();
    wrapper = mount(SmLegend, {
      propsData: {
        layerNames: ['上海疫情点标注', '站点3', '未命名数据', '未命名数据(1)', '未命名数据(3)', '北京市轨道交通线路减'],
        mapTarget: 'map',
        mode: 'panel'
      }
    });
    const webmap = {
      getLegendInfo: () => mapLegends,
      un: jest.fn(),
      on: jest.fn(),
      getAppreciableLayers: () =>
        Object.values(
          mapLegends.reduce((layers, item) => {
            if (!layers[item.layerId]) {
              layers[item.layerId] = { id: item.layerId, visible: true };
            }
            return layers;
          }, {})
        )
    };
    wrapper.vm.viewModel.setMap({
      webmap
    });
    wrapper.vm.$options.loaded.call(wrapper.vm);
    await wrapper.vm.$nextTick();
    imageOnload();
    await flushPromises();
    jest.advanceTimersByTime(5000);
    expect(wrapper.vm.legendList).not.toEqual({});
    expect(wrapper.vm.mapTarget).toBe('map');
    expect(wrapper.find(StyleRenderer).exists()).toBeTruthy();
    expect(wrapper.find(ImageRenderer).exists()).toBeTruthy();
    expect(wrapper.find(StyleValue).exists()).toBeTruthy();
    jest.useRealTimers();
    done();
  });

  it('mapload', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_point,
      'https://fakeiportal.supermap.io/iportal/web/datas/676516522/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123':
        layerData
    };
    mockFetch(fetchResource);
    mapWrapper = mount(SmWebMap, {
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
      }
    });
    const addCallback = async function (data) {
      wrapper = mount(SmLegend, {
        propsData: {
          layerNames: ['民航数据']
        }
      });
      const callback = jest.fn();
      wrapper.vm.$on('loaded', callback);
      await wrapper.vm.$nextTick();
      expect(callback).toHaveBeenCalled();
      expect(wrapper.vm.legendList['民航数据']).not.toBeUndefined();
      expect(wrapper.vm.activeLegend.length).toBe(Object.keys(wrapper.vm.legendList).length);
      wrapper.setProps({ isShowTitle: true });
      wrapper.vm.initLegendList();
      expect(wrapper.vm.activeLegend.length).toBe(1);
      done();
    };
    mapWrapper.vm.viewModel.on({ addlayerssucceeded: addCallback });
  });

  it('map not load', async done => {
    wrapper = mount(SmLegend);
    await wrapper.setProps({ layerNames: ['民航数据'] })
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.legendList['民航数据']).toBeUndefined();
    done();
  });

  it('useMapLegend is false, use layerNames prop', async done => {
    jest.useFakeTimers();
    wrapper = mount(SmLegend, {
      propsData: {
        layerNames: ['上海疫情点标注'],
        useMapLegend: false,
        mapTarget: 'map',
        mode: 'panel'
      }
    });
    const webmap = {
      getLegendInfo: () => mapLegends,
      getLegendInfos: () => [{ layerId: '图层A' }, { layerId: '图层B' }],
      un: jest.fn(),
      on: jest.fn(),
      getAppreciableLayers: () => [{ id: '上海疫情点标注', visible: true }]
    };
    wrapper.vm.viewModel.setMap({ webmap });
    wrapper.vm.$options.loaded.call(wrapper.vm);
    await wrapper.vm.$nextTick();
    await flushPromises();
    jest.advanceTimersByTime(5000);
    // useMapLegend为false时，应使用props的layerNames
    expect(wrapper.vm.layerNamesValue).toEqual(['上海疫情点标注']);
    expect(wrapper.vm.legendList['上海疫情点标注']).not.toBeUndefined();
    jest.useRealTimers();
    done();
  });

  it('useMapLegend is true, use getLegendInfos from webmap', async done => {
    jest.useFakeTimers();
    wrapper = mount(SmLegend, {
      propsData: {
        layerNames: ['不应使用的图层名'],
        useMapLegend: true,
        mapTarget: 'map',
        mode: 'panel'
      }
    });
    const webmapLegendInfos = [{ id: '图层A', showLegend: true }, { id: '图层B', showLegend: false }];
    const webmap = {
      getLegendInfo: () => [],
      getLegendInfos: () => webmapLegendInfos,
      un: jest.fn(),
      on: jest.fn(),
      getAppreciableLayers: () => [{ id: '图层A', visible: true }, { id: '图层B', visible: true }]
    };
    wrapper.vm.viewModel.setMap({ webmap });
    wrapper.vm.$options.loaded.call(wrapper.vm);
    await wrapper.vm.$nextTick();
    await flushPromises();
    jest.advanceTimersByTime(5000);
    // useMapLegend为true时，应使用webmap的getLegendInfos
    expect(wrapper.vm.layerNamesValue).toEqual(['图层A']);
    jest.useRealTimers();
    done();
  });

  it('layerNamesValue updates when useMapLegend changes', async done => {
    jest.useFakeTimers();
    wrapper = mount(SmLegend, {
      propsData: {
        layerNames: ['图层A'],
        useMapLegend: false,
        mapTarget: 'map',
        mode: 'panel'
      }
    });
    const webmap = {
      getLegendInfo: () => [],
      getLegendInfos: () => [{ id: 'webmap图层', showLegend: true }],
      un: jest.fn(),
      on: jest.fn(),
      getAppreciableLayers: () => []
    };
    wrapper.vm.viewModel.setMap({ webmap });
    wrapper.vm.$options.loaded.call(wrapper.vm);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.layerNamesValue).toEqual(['图层A']);

    wrapper.setProps({ useMapLegend: true });
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.layerNamesValue).toEqual(['webmap图层']);
    jest.useRealTimers();
    done();
  });
});

