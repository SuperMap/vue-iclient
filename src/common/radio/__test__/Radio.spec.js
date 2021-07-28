import {
  mount
} from '@vue/test-utils';
import SmRadio from '../Radio.vue';
import Radio from '../index';
 

describe('Radio.vue', () => {
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
    wrapper = mount(SmRadio);
  })

  it('render index correctly', () => {
    wrapper = mount(Radio)
    expect(wrapper.find('.sm-component-radio').exists()).toBe(true);
  })
})