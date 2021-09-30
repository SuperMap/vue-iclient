import {
  mount
} from '@vue/test-utils';
import SmText from '../Text.vue';

describe('Text.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  })

  it('render text correctly', () => {
    wrapper = mount({
      template: `<div><sm-text title="文本"/></div>`,
      components: {
        SmText
      }
    })
    expect(wrapper.text()).toBe('文本');
    expect(wrapper.find('.sm-component-text').exists()).toBe(true);
  })

  xit('text fontStyle', () => {
    wrapper = mount({
      template: `<div><sm-text title="北京北京" :fontStyle="{ fontSize: '18px', lineHeight: '18px', fontWeight: '700', textAlign: 'center' }"/></div>`,
      components: {
        SmText
      }
    })
    expect(wrapper.text()).toBe('北京北京');
    expect(wrapper.find('div.sm-component-text').attributes()).toHaveProperty('style', "font-size: 18px; line-height: 18px; font-weight: 700; justify-content: center; background: rgb(255, 255, 255);")
  })

  it('text href', () => {
    wrapper = mount({
      template: `<div><sm-text title="文本" href='http://www.baidu.com' target='_blank'/></div>`,
      components: {
        SmText
      }
    })
    expect(wrapper.text()).toBe('文本');
    expect(wrapper.find('a.sm-component-text__href').exists()).toBe(true);
    expect(wrapper.find('a.sm-component-text__href').attributes()).toHaveProperty('href', 'http://www.baidu.com');
    expect(wrapper.find('a.sm-component-text__href').attributes()).toHaveProperty('target', '_blank');
  })

  it('text timing()', () => {
    wrapper = mount(SmText, {
      propsData: {
        title: "文本"
      }
    })
    const getDataSpy = jest.spyOn(wrapper.vm, 'getData');
    expect(wrapper.text()).toBe('文本');
    expect(wrapper.find('.sm-component-text').exists()).toBe(true);
    wrapper.vm.timing();
    expect(getDataSpy).toBeCalled();
  })
})