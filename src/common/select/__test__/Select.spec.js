import {
  mount
} from '@vue/test-utils';
import SmSelect from '../Select.vue';

describe('Select.vue', () => {
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
    wrapper = mount(SmSelect);
  })
})