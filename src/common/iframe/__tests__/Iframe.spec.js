import {
  mount
} from '@vue/test-utils';
import SmIframe from '../Iframe.vue';
import Iframe from '../index.js';


describe('Iframe.vue', () => {
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
    wrapper = mount({
      template: `
      <sm-iframe style="width:100%; height:600px" src="https://www.test.com/"></sm-iframe>`,
      components: {
        SmIframe
      }
    })
    const ifram = wrapper.find('.sm-component-iframe');
    expect(ifram.exists()).toBe(true);
    expect(ifram.element.src).toBe('https://www.test.com/');
    expect(ifram.element.style.width).toBe('100%');
    expect(ifram.element.style.height).toBe('600px');
  })

  it('index render default', () => {
    wrapper = mount(Iframe)
    expect(wrapper.find('.sm-component-iframe').exists()).toBe(true);
  })
})