import { mount } from '@vue/test-utils';
import SmLegend from '../Legend.vue';
import StyleRenderer from '../subs/StyleRenderer.vue';
import ImageRenderer from '../subs/ImageRenderer.vue';
import mapLegends from 'vue-iclient/test/unit/mocks/data/WebMap/map_legends.json';

describe('Legend.vue', () => {
  let wrapper;
  let mapWrapper;

  document.getElementById = () => {
    return {
      getContext: () => ({
        arc: jest.fn(),
        fill: jest.fn(),
        fillRect: jest.fn(),
        strokeRect: jest.fn(),
        clearRect: jest.fn(),
        beginPath: jest.fn(),
        setLineDash: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        stroke: jest.fn(),
        drawImage: jest.fn()
      })
    };
  };

  beforeEach(() => {});

  afterEach(() => {
    jest.resetAllMocks();
    if (wrapper) {
      wrapper.destroy();
    }
    if (mapWrapper) {
      mapWrapper.destroy();
    }
  });

  it('render default correctly', async done => {
    wrapper = mount(SmLegend, {
      propsData: {
        layerNames: ['上海疫情点标注', '站点3', '未命名数据', '未命名数据(1)', '未命名数据(3)'],
        mapTarget: 'map'
      }
    });
    const webmap = {
      getLegendInfo: () => mapLegends
    };
    wrapper.vm.$options.loaded.call(wrapper.vm);
    wrapper.vm.viewModel.setMap({
      webmap
    });
    wrapper.vm.initLegendList();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.legendList).not.toEqual({});
    expect(wrapper.vm.mapTarget).toBe('map');
    expect(wrapper.find(StyleRenderer).exists()).toBeTruthy()
    expect(wrapper.find(ImageRenderer).exists()).toBeTruthy()
    done();
  });
});
