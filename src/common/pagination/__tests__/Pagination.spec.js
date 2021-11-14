import { mount } from '@vue/test-utils';
import SmPagination from '../Pagination.vue';
import Pagination from '../index';

describe('Pagination.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  });

  it('render default correctly', () => {
    wrapper = mount(SmPagination);
    expect(wrapper.find('.sm-component-pagination').exists()).toBe(true);
  });

  it('render index correctly', () => {
    wrapper = mount(Pagination);
    expect(wrapper.find('.sm-component-pagination').exists()).toBe(true);
  });
});
