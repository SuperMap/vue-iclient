import {
  mount
} from '@vue/test-utils';
import SmUniqueThemeLayer from '../UniqueThemeLayer.vue';

describe('UniqueThemeLayer.vue', () => {
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
    wrapper = mount(SmUniqueThemeLayer, {
      propsData: {
        data: []
      }
    });
  })
})
