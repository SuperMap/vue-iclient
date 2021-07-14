import {
  mount
} from '@vue/test-utils';
import SmLayerSelect from '../LayerSelect.vue';

describe('LayerSelect.vue', () => {
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
    wrapper = mount(SmLayerSelect);
  })
})