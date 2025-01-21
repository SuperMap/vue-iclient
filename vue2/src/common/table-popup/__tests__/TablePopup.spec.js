import { mount } from '@vue/test-utils';
import SmTablePopup from '../TablePopup.vue';
import TablePopup from '../TablePopup.vue';

describe('TablePopup.vue', () => {
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
    wrapper = mount(SmTablePopup);
    expect(wrapper.find('.sm-component-table-popup').exists()).toBe(true);
  });

  it('render index correctly', () => {
    wrapper = mount(TablePopup);
    expect(wrapper.find('.sm-component-table-popup').exists()).toBe(true);
  });
});
