import {
  mount
} from '@vue/test-utils';
import SmTree from '../Tree.vue';

describe('Tree.vue', () => {
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
    wrapper = mount(SmTree);
  })
})