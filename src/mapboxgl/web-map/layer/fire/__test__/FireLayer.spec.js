import {
  mount
} from '@vue/test-utils';
import SmFireLayer from '../FireLayer.vue';

describe('FireLayer.vue', () => {
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
    wrapper = mount(SmFireLayer);
  })
})
