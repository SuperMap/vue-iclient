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
  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
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
});
