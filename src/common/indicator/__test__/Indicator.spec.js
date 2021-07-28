import {
  mount
} from '@vue/test-utils';
import SmIndicator from '../Indicator.vue';
import Indicator from '../index';

describe('Indicator.vue', () => {
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
    wrapper = mount(SmIndicator, {
      propsData: {
        title: "建筑高度",
        unit: "米",
        num: "1588"
      }
    });
    expect(wrapper.find('.sm-component-indicator').exists()).toBe(true);
    expect(wrapper.find('.sm-component-indicator__title').text()).toBe('建筑高度');
    expect(wrapper.find('.sm-component-indicator__unit').text()).toBe('米');
    const numItem = wrapper.findAll('.sm-component-count-to__numItem');
    expect(numItem.length).toBe(5);
    expect(numItem.at(0).text()).toBe('1');
    expect(numItem.at(1).text()).toBe(',');
    expect(numItem.at(2).text()).toBe('5');
    expect(numItem.at(3).text()).toBe('8');
    expect(numItem.at(4).text()).toBe('8');
  })

  it('render index correctly', () => {
    wrapper = mount(Indicator)
    expect(wrapper.find('.sm-component-indicator').exists()).toBe(true);
  })
})