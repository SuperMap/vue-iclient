import {
  mount
} from '@vue/test-utils';
import SmHeatmapLayer from '../HeatmapLayer.vue';

describe('HeatmapLayer.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  })

  it('render default correctly', () => {
    wrapper = mount(SmHeatmapLayer, {
      propsData: {
        data: {}
      }
    });
  })
})
