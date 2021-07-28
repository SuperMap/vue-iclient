import {
  mount
} from '@vue/test-utils';
import SmTreeSelect from '../TreeSelect.vue';
import TreeSelect from '../index';

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

  it('render index correctly', () => {
    wrapper = mount(TreeSelect)
    expect(wrapper.find('.sm-component-select').exists()).toBe(true);
  })
})