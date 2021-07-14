import {
  mount
} from '@vue/test-utils';
import SmSpin from '../Spin.vue';

describe('Spin.vue', () => {
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
    wrapper = mount(SmSpin);
  })
})