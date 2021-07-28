import {
  mount
} from '@vue/test-utils';
import SmSlider from '../Slider.vue';
import Slider from '../index';

describe('Slider.vue', () => {
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
    wrapper = mount(SmSlider);
  })

  it('render index correctly', () => {
    wrapper = mount(Slider)
    expect(wrapper.find('.sm-component-slider').exists()).toBe(true);
  })
})