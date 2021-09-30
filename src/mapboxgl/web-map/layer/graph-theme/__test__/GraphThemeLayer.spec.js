import {
  mount
} from '@vue/test-utils';
import SmGraphThemeLayer from '../GraphThemeLayer.vue';

describe('GraphThemeLayer.vue', () => {
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
    wrapper = mount(SmGraphThemeLayer, {
      propsData: {
        data: {},
        chartsType: 'pie'
      }
    });
  })
})
