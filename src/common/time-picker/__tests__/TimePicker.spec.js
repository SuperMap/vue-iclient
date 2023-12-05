import { mount } from '@vue/test-utils';
import SmTimePicker from '../TimePicker.vue';
import TimePicker from '../index';

describe('TimeLine.vue', () => {
  let wrapper;
  const locale = {
    placeholder: 'Избор на час'
  };
  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  });

  it('render index correctly', () => {
    wrapper = mount(TimePicker);
    expect(wrapper.find('.sm-component-time-picker').exists()).toBe(true);
  });

  it('prop locale should works', () => {
    wrapper = mount({
      template: `
      <sm-time-picker :locale='locale'/>`,
      components: {
        SmTimePicker
      },
      data() {
        return {
          locale: locale
        };
      }
    });
    expect(wrapper.find('.sm-component-time-picker').exists()).toBe(true);
    expect(wrapper.find('.sm-component-time-picker-input').attributes('placeholder')).toBe(locale.placeholder);
  });

  it('prop size is middle', () => {
    wrapper = mount(
      {
        template: `<sm-time-picker size='middle'/>`,
        components: {
          SmTimePicker
        },
      }
    );
    expect(wrapper.find('.sm-component-time-picker-md').exists()).toBe(true);
  });
});
