import {
  mount
} from '@vue/test-utils';
import SmFillExtrusion from '../FillExtrusion.vue';

describe('FillExtrusion.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  })

  xit('render default correctly', () => {
    wrapper = mount(SmFillExtrusion);
  })
})
