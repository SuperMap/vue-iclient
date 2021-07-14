import {
  mount
} from '@vue/test-utils';
import SmTreeSelect from '../TreeSelect.vue';

describe('TreeSelect.vue', () => {
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
    wrapper = mount(SmTreeSelect, {
      propsData: {
        data: {}
      }
    });
  })
})