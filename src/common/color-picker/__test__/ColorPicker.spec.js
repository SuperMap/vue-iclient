import {
  mount
} from '@vue/test-utils';
import SmColorPicker from '../ColorPicker.vue';

describe('ColorPicker.vue', () => {
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
    wrapper = mount(SmColorPicker);
    expect(wrapper.find('.sm-component-colorpicker').exists()).toBe(true);
    expect(wrapper.find('.sm-component-colorpicker__current').exists()).toBe(true);
  })

  it('has displayPicker work correctly', () => {
    wrapper = mount(SmColorPicker, {
      propsData: {
        value: 'rgba(35, 12.9, 0, 0)',        
      }

    });
      expect(wrapper.vm.displayPicker).toBe(false);
      wrapper.find('.sm-component-colorpicker__current').trigger('click');
      expect(wrapper.vm.displayPicker).toBe(true);
  })

  it('render text correctly', () => {
    wrapper = mount(SmColorPicker, {
      propsData: {
        value: '#fff',
        deleteIcon: true
      }
    });
    wrapper.find('.sm-components-icon-close').trigger('click');
    expect(wrapper.vm.colorValue).toBe('');
    expect(wrapper.vm.colors).toBe('');
    wrapper.vm.documentClick({target: 'button.sm-component-btn'});
  })
})