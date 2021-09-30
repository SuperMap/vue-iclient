import {
  mount
} from '@vue/test-utils';
import SmTable from '../Table.vue';
import Table from '../index';

describe('Table.vue', () => {
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
    wrapper = mount(SmTable);
  })

  it('render index correctly', () => {
    wrapper = mount(Table)
    expect(wrapper.find('.sm-component-table').exists()).toBe(true);
  })
})