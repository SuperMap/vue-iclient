import {
  mount
} from '@vue/test-utils';
import SmTablePopup from '../TablePopup.vue';

describe('TablePopup.vue', () => {
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
    wrapper = mount(SmTablePopup);
  })
})