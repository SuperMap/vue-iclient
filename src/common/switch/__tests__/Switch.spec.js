import { mount } from '@vue/test-utils';
import SmSwitch from '../Switch.vue';
import Switch from '../index';

describe('Switch.vue', () => {
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
    wrapper = mount(SmSwitch);
  });

  it('render index correctly', () => {
    wrapper = mount(Switch);
    expect(wrapper.find('.sm-component-switch').exists()).toBe(true);
  });
});
