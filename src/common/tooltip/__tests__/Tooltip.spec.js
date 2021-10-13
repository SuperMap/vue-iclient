import {
  mount
} from '@vue/test-utils';
import SmTooltip from '../Tooltip.vue';

describe('Tooltip.vue', () => {
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
    wrapper = mount(SmTooltip)
  })
})