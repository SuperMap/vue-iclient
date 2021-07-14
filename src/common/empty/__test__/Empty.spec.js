import {
  mount
} from '@vue/test-utils';
import SmEmpty from '../Empty.vue';


describe('Empty.vue', () => {
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
    wrapper = mount(SmEmpty, {
      propsData: {
        imageStyle: {height: '20px'}
      }
    });
    expect(wrapper.find('.sm-component-empty-image').element.style.height).toBe('20px');
    expect(wrapper.text()).toBe('No Data');
  })

  it('description can be false', () => {
    wrapper = mount(SmEmpty, {
      propsData: {
        description: false
      }
    });
    expect(wrapper.vm.description).toBe(false);
    expect(wrapper.find('.sm-component-empty-description').exists()).toBe(false);
  })
})