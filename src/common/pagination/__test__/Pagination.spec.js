import {
  mount
} from '@vue/test-utils';
import SmPagination from '../Pagination.vue';
 
describe('Pagination.vue', () => {
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
    wrapper = mount(SmPagination);
  })
})