import { mount } from '@vue/test-utils';
import SmInputNumber from '../InputNumber.vue';
import InputNumber from '../index';

describe('InputNumber.vue', () => {
  let wrapper;
  let previousDirection;

  beforeEach(() => {
    wrapper = null;
    previousDirection = document.documentElement.getAttribute('dir');
    document.documentElement.setAttribute('dir', 'ltr');
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
    if (previousDirection === null) {
      document.documentElement.removeAttribute('dir');
    } else {
      document.documentElement.setAttribute('dir', previousDirection);
    }
  });

  it('render default correctly', () => {
    wrapper = mount(SmInputNumber);
    expect(wrapper.find('.sm-component-input-number').exists()).toBe(true);
  });

  it('render index correctly', () => {
    wrapper = mount(InputNumber);
    expect(wrapper.find('.sm-component-input-number').exists()).toBe(true);
  });

  it('props correctly', () => {
    wrapper = mount({
      template: `<sm-input-number v-model="number" size="large"></sm-input-number>`,
      components: {
        SmInputNumber
      },
      data() {
        return {
          number: 5
        };
      }
    });
    expect(wrapper.vm.$children[0].value).toBe(5);
  });

  it('converts displayed digits and normalizes input in RTL', async () => {
    document.documentElement.setAttribute('dir', 'rtl');
    wrapper = mount(SmInputNumber, {
      propsData: {
        value: 123
      }
    });

    const input = wrapper.find('input');
    expect(input.element.value).toBe('١٢٣');

    input.element.value = '٤٥٦';
    await input.trigger('input');

    expect(wrapper.emitted('change').pop()[0]).toBe(456);
  });

  it('normalizes Arabic digits before invoking a custom parser', () => {
    document.documentElement.setAttribute('dir', 'rtl');
    const parser = jest.fn(value => Number(value));
    wrapper = mount(SmInputNumber, {
      propsData: {
        parser
      }
    });

    expect(wrapper.vm.extralProps.parser('١٢٣')).toBe(123);
    expect(parser).toHaveBeenCalledWith('123');
  });

  it('can disable Arabic digit transformation', () => {
    document.documentElement.setAttribute('dir', 'rtl');
    wrapper = mount(SmInputNumber, {
      propsData: {
        value: 123,
        transformArabicNumbers: false
      }
    });

    expect(wrapper.find('input').element.value).toBe('123');
  });
});
