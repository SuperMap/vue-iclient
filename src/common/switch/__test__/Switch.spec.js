import {
  mount
} from '@vue/test-utils';
import SmSwitch from '../Switch.vue';

describe('Switch.vue', () => {
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
    wrapper = mount(SmSwitch);
  })
})