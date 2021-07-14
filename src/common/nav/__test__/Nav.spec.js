import {
  mount
} from '@vue/test-utils';
import SmNav from '../Nav.vue';
 
describe('Nav.vue', () => {
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
    wrapper = mount(SmNav);
  })
})