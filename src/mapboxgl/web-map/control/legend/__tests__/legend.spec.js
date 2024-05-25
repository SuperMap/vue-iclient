import { mount } from '@vue/test-utils';
import SmLegend from '../Legend.vue';
import StyleRenderer from '../subs/StyleRenderer.vue';
import ImageRenderer from '../subs/ImageRenderer.vue';
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

  document.getElementById = () => {
    return {
      getContext: () => ({
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
        createPattern: jest.fn()
      })
    };
  };

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
      getAppreciableLayers: () => Object.values(mapLegends.reduce((layers, item) => {
        if (!layers[item.layerId]) {
          layers[item.layerId] = { id: item.layerId, visible: true };
        }
        return layers;
      }, {}))
    };
    wrapper.vm.viewModel.setMap({
      webmap
    });
    wrapper.vm.$options.loaded.call(wrapper.vm);
    await wrapper.vm.$nextTick();
    imageOnload();
    await flushPromises();
    expect(wrapper.vm.legendList).not.toEqual({});
    expect(wrapper.vm.mapTarget).toBe('map');
    expect(wrapper.find(StyleRenderer).exists()).toBeTruthy();
    expect(wrapper.find(ImageRenderer).exists()).toBeTruthy();
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
          layerNames: ['民航数据'],
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
});

