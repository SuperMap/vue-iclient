import { mount } from '@vue/test-utils';
import SmLegend from '../Legend.vue';
import mockFetch from 'vue-iclient/test/unit/mocks/FetchRequest';
import mapLegends from 'vue-iclient/test/unit/mocks/data/WebMap/map_legends.json';

describe('Legend.vue', () => {
  let wrapper;
  let mapWrapper;

  beforeEach(() => {
  });

  afterEach(() => {
    jest.resetAllMocks();
    if (wrapper) {
      wrapper.destroy();
    }
    if (mapWrapper) {
      mapWrapper.destroy();
    }
  });

  it('render default correctly', done => {
    wrapper = mount(SmLegend, {
      propsData: {
        layerNames: ['民航数据'],
        mapTarget: 'map'
      }
    });
    wrapper.vm.webmap = {
      getLegendInfo: jest.fn(() => mapLegends)
    }
    wrapper.vm.$options.loaded.call(wrapper.vm);
    expect(wrapper.vm.legendList).not.toEqual({});
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });
});
