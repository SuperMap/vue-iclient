import { mount } from '@vue/test-utils';
import SmTimeText from '../TimeText.vue';

describe('TimeText.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  });

  it('render', () => {
    wrapper = mount(SmTimeText, {
      propsData: {},
      mocks: {
        $d: (msg) => msg
      }
    });
    expect(wrapper.find('.sm-component-time-text').exists()).toBe(true);
  });
});
