import {
  mount
} from '@vue/test-utils';
import SmMapvLayer from '../MapvLayer.vue';

describe('MapvLayer.vue', () => {
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
    wrapper = mount(SmMapvLayer);
  })
})
