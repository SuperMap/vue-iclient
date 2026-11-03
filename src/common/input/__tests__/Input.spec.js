import { mount, createLocalVue } from '@vue/test-utils';
import SmInput from '../Input.vue';
import IndexInput from '../index';
import SmInputPassword from '../Password.vue';
import SmInputSearch from '../Search.vue';
import SmInputGroup from '../Group.vue';
import SmTextarea from '../TextArea.vue';
import { Input } from 'ant-design-vue';
const localVue = createLocalVue();
localVue.use(Input);

describe('Input.vue', () => {
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
    wrapper = mount(
      {
        template: `
      <sm-input style="width:160px;" size="middle" placeholder="Basic input"></sm-input>`,
        components: {
          SmInput
        }
      },
      {
        localVue,
        sync: false
      }
    );
    expect(wrapper.find('.sm-component-input').exists()).toBe(true);
    expect(wrapper.find('.sm-component-input').element.placeholder).toBe('Basic input');
  });

  it('render index correctly', () => {
    wrapper = mount(IndexInput);
    expect(wrapper.find('.sm-component-input').exists()).toBe(true);
  });

  it('render search correctly', () => {
    wrapper = mount(
      {
        template: `
      <div>
        <sm-input-search size="middle" placeholder="input search loading deault" loading />
      </div>`,
        components: {
          SmInputSearch
        }
      },
      {
        localVue,
        sync: false
      }
    );
    expect(wrapper.find('.sm-component-input-search').exists()).toBe(true);
    expect(wrapper.find('.sm-component-input').element.placeholder).toBe('input search loading deault');
    expect(wrapper.find('.sm-component-input-search-icon').exists()).toBe(true);
  });

  it('render textarea correctly', () => {
    wrapper = mount(
      {
        template: `
      <sm-textarea placeholder="Basic usage" :rows="4" />`,
        components: {
          SmTextarea
        }
      },
      {
        localVue,
        sync: false
      }
    );
    const textArea = wrapper.find('textarea.sm-component-input');
    expect(textArea.exists()).toBe(true);
    expect(textArea.element.placeholder).toBe('Basic usage');
    expect(textArea.element.rows).toBe(4);
  });

  it('render password correctly', () => {
    wrapper = mount(
      {
        template: `
      <sm-input-password  size="middle" placeholder="input password" />`,
        components: {
          SmInputPassword
        }
      },
      {
        localVue,
        sync: false
      }
    );
    expect(wrapper.find('.sm-component-input-password').exists()).toBe(true);
    expect(wrapper.find('.sm-component-input').element.placeholder).toBe('input password');
  });

  it('render group correctly', () => {
    wrapper = mount(
      {
        template: `
      <div>
        <sm-input-group compact size="middle">
          <sm-input style="width: 20%" default-value="0571" />
          <sm-input style="width: 30%" default-value="26888888" />
        </sm-input-group>
      </div>`,
        components: {
          SmInput,
          SmInputGroup
        }
      },
      {
        localVue
      }
    );
    expect(wrapper.find('.sm-component-input-group').exists()).toBe(true);
  });

  it('converts displayed digits and normalizes emitted values in RTL', async () => {
    document.documentElement.setAttribute('dir', 'rtl');
    wrapper = mount(SmInput, {
      localVue,
      propsData: {
        value: '123',
        placeholder: 'Page 2'
      }
    });

    const input = wrapper.find('.sm-component-input');
    expect(input.element.value).toBe('١٢٣');
    expect(input.element.placeholder).toBe('Page ٢');

    input.element.value = '٤٥٦';
    await input.trigger('input');

    const inputEvent = wrapper.emitted('input').pop()[0];
    const changeEvent = wrapper.emitted('change').pop()[0];
    expect(inputEvent.target.value).toBe('456');
    expect(changeEvent.target.value).toBe('456');
    expect(wrapper.emitted('change.value').pop()[0]).toBe('456');
  });

  it('can disable Arabic digit transformation', () => {
    document.documentElement.setAttribute('dir', 'rtl');
    wrapper = mount(SmInput, {
      localVue,
      propsData: {
        value: '123',
        placeholder: 'Page 2',
        transformArabicNumbers: false
      }
    });

    const input = wrapper.find('.sm-component-input');
    expect(input.element.value).toBe('123');
    expect(input.element.placeholder).toBe('Page 2');
  });
});
