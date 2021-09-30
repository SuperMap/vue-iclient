import {
  mount
} from '@vue/test-utils';
import SmSpin from '../Spin.vue';
import Spin from '../index';

describe('Spin.vue', () => {
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
    wrapper = mount(SmSpin);
  })

  it('render index correctly', () => {
    wrapper = mount(Spin)
    expect(wrapper.find('.sm-component-spin').exists()).toBe(true);
  })
})