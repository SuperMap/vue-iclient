import { mount } from '@vue/test-utils';
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
  });

  it('render default correctly', () => {
    wrapper = mount(SmIndicator, {
      propsData: {
        title: '建筑高度',
        unit: '米',
        num: '1588'
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
  });

  it('render index correctly', () => {
    wrapper = mount(Indicator);
    expect(wrapper.find('.sm-component-indicator').exists()).toBe(true);
  });
  it('render default correctly', async () => {
    wrapper = mount(SmIndicator, {
      propsData: {
        title: '建筑高度',
        unit: '米',
        num: '1588'
      }
    });
    expect(wrapper.find('.sm-component-indicator').exists()).toBe(true);
    await wrapper.setProps({
      mode: 'horizontal'
    });
    expect(wrapper.vm.mode).toBe('horizontal');
    expect(wrapper.vm.direction).toBe('row');
  });

  it('change props', async () => {
    wrapper = mount(SmIndicator, {
      propsData: {
        title: '建筑高度',
        unit: '米',
        num: 1232,
        thresholdsStyle: [{ min: 1232, max: 1232, color: 'red' }]
      }
    });
    expect(wrapper.find('.sm-component-indicator').exists()).toBe(true);
    expect(wrapper.find('.sm-component-indicator__num').element.style.color).toBe('red');
    await wrapper.setProps({
      title: '楼房建筑高度',
      unit: '千米',
      num: 15.88
    });
    expect(wrapper.vm.titleData).toBe('楼房建筑高度');
    expect(wrapper.vm.unitData).toBe('千米');
  });

  it('Decimals', () => {
    wrapper = mount(SmIndicator, {
      propsData: {
        title: '建筑高度',
        unit: '米',
        num: '1588.66',
        decimals: 1
      }
    });
    const numItem = wrapper.findAll('.sm-component-count-to__numItem');
    expect(numItem.length).toBe(7);
    expect(numItem.at(0).text()).toBe('1');
    expect(numItem.at(1).text()).toBe(',');
    expect(numItem.at(2).text()).toBe('5');
    expect(numItem.at(3).text()).toBe('8');
    expect(numItem.at(4).text()).toBe('8');
    expect(numItem.at(5).text()).toBe('.');
    expect(numItem.at(6).text()).toBe('7');
  });
  it('changeIndicatorColor', () => {
    wrapper = mount(SmIndicator, {
      propsData: {
        title: '建筑高度',
        unit: '米',
        num: '1588.66',
        decimals: 1
      }
    });
    wrapper.vm.changeIndicatorColor('#f00');
    expect(wrapper.vm.indicatorColorData).toBe('#f00');
  });
  it('click', () => {
    wrapper = mount(SmIndicator, {
      propsData: {
        title: '建筑高度',
        unit: '米',
        num: '1588.66',
        decimals: 1
      }
    });
    wrapper.find('.sm-component-indicator').trigger('click');
    expect(wrapper.emitted().click).toBeTruthy();
  });
});
