import {
  mount
} from '@vue/test-utils';
import SmTree from '../Tree.vue';
import Tree from '../index';

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

  it('render index correctly', () => {
    wrapper = mount(Tree)
    expect(wrapper.find('.sm-component-tree').exists()).toBe(true);
  })
})