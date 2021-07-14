import {
  mount
} from '@vue/test-utils';
import SmSlider from '../Slider.vue';

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
})