import {
  mount
} from '@vue/test-utils';
import SmRangeThemeLayer from '../RangeThemeLayer.vue';

describe('RangeThemeLayer.vue', () => {
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
    wrapper = mount(SmRangeThemeLayer, {
      propsData: {
        data: []
      }
    });
  })
})
