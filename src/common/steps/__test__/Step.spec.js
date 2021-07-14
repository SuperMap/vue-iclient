import {
  mount
} from '@vue/test-utils';
import SmStep from '../Step.vue';

describe('Step.vue', () => {
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
    wrapper = mount(SmStep);
  })
})