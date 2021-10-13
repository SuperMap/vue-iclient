import {
  mount
} from '@vue/test-utils';
import SmInputNumber from '../InputNumber.vue';
import InputNumber from '../index';

describe('InputNumber.vue', () => {
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
    wrapper = mount(SmInputNumber);
    expect(wrapper.find('.sm-component-input-number').exists()).toBe(true);
  })

  it('render index correctly', () => {
    wrapper = mount(InputNumber)
    expect(wrapper.find('.sm-component-input-number').exists()).toBe(true);
  })

  it('props correctly', () => {
    wrapper = mount({
      template: `<sm-input-number v-model="number" size="large"></sm-input-number>`,
      components: {
        SmInputNumber,
      },
      data() {
        return {
          number: 5
        }
      }
    });
    expect(wrapper.vm.$children[0].value).toBe(5);
  })
})