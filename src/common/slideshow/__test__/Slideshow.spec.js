import {
  mount
} from '@vue/test-utils';
import SmSlideshow from '../Slideshow.vue';

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
})