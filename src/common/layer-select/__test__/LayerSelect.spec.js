import {
  mount
} from '@vue/test-utils';
import SmLayerSelect from '../LayerSelect.vue';
import LayerSelect from '../index';

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

  it('render index correctly', () => {
    wrapper = mount(LayerSelect)
    expect(wrapper.find('.sm-component-select').exists()).toBe(true);
  })
})