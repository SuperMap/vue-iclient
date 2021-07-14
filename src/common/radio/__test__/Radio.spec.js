import {
  mount
} from '@vue/test-utils';
import SmRadio from '../Radio.vue';
 

describe('Radio.vue', () => {
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
    wrapper = mount(SmRadio);
  })
})