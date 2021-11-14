import { mount } from '@vue/test-utils';
import SmStep from '../Step.vue';
import Step from '../index';

describe('Step.vue', () => {
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
    wrapper = mount(SmStep);
  });

  it('render index correctly', () => {
    wrapper = mount(Step);
    expect(wrapper.find('.sm-component-steps').exists()).toBe(true);
  });
});
