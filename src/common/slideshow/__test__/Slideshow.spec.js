import {
  mount
} from '@vue/test-utils';
import SmSlideshow from '../Slideshow.vue';
import Slideshow from '../index';

describe('Slideshow.vue', () => {
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
    wrapper = mount(SmSlideshow);
  })

  it('render index correctly', () => {
    wrapper = mount(Slideshow)
    expect(wrapper.find('.sm-component-slideshow').exists()).toBe(true);
  })
})