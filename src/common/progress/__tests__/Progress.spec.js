import {
  mount
} from '@vue/test-utils';
import SmProgress from '../Progress.vue';
import Progress from '../index';
 
describe('Progress.vue', () => {
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
    wrapper = mount(SmProgress);
  })

  it('render index correctly', () => {
    wrapper = mount(Progress)
    expect(wrapper.find('.sm-component-progress').exists()).toBe(true);
  })

  it('change percent', () => {
    wrapper = mount(Progress, {
      propsData: {
        percent: '50'
      }
    })
    wrapper.setProps({
      percent: '60'
    })
    expect(wrapper.find('.sm-component-progress-text').text()).toBe('60%');
  })

  it('render circle correctly', async() => {
    wrapper = mount(Progress,{
      propsData: {
        type: 'circle'
      }
    })
    expect(wrapper.find('.sm-component-progress').exists()).toBe(true);
    expect(wrapper.vm.calWidth).toBe(0);
    expect(wrapper.vm.type).toBe('circle');
    await wrapper.setProps({
      propsData: {
        type: 'circle',
        size: 3,
        percent: '50'
      }
    })
    expect(wrapper.vm.calWidth).toBe(3);
  })
})