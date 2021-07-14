import {
  mount
} from '@vue/test-utils';
import SmProgress from '../Progress.vue';
 
describe('Progress.vue', () => {
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
    wrapper = mount(SmProgress);
  })
})