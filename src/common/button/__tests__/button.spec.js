import {
  mount
} from '@vue/test-utils';
import SmButton from '../Button.vue';
import SmButtonGroup from '../Group.vue';

describe('Button.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  })

  it('render correctly', () => {
    wrapper = mount({
      template: `<div><sm-button>按钮</sm-button></div>`,
      components: {
        SmButton
      }
    })
    expect(wrapper.text()).toBe('按 钮');
  })

  it('button type', () => {

    let wrapper1 = mount({
      template: `<div><sm-button type="primary">主按钮</sm-button></div>`,
      components: {
        SmButton
      }
    })
    expect(wrapper1.find('.sm-component-btn-primary').exists()).toBe(true);
    expect(wrapper1.text()).toBe('主按钮');

    let wrapper2 = mount({
      template: `<div><sm-button type="default">次按钮</sm-button></div>`,
      components: {
        SmButton
      }
    })
    expect(wrapper2.find('.sm-component-btn-default').exists()).toBe(true);
    expect(wrapper2.text()).toBe('次按钮');

    let wrapper3 = mount({
      template: `<div><sm-button type="danger">危险按钮</sm-button></div>`,
      components: {
        SmButton
      }
    })
    expect(wrapper3.find('.sm-component-btn-danger').exists()).toBe(true);
    expect(wrapper3.text()).toBe('危险按钮');

    let wrapper4 = mount({
      template: `<div><sm-button disabled>禁用按钮</sm-button></div>`,
      components: {
        SmButton
      }
    }, {
      propsData: {
        disabled: true
      }
    })
    expect(wrapper4.attributes()).toHaveProperty('disabled')
    expect(wrapper4.text()).toBe('禁用按钮');
    //另一种写法
    // const wrapper4 = mount(SmButton, {
    //   propsData: {
    //     disabled: 'disabled'
    //   }
    // })
    // expect(wrapper4.find('disabled')).toBe('disabled');
    // expect(wrapper4.attributes()).toHaveProperty('disabled')

    let wrapper5 = mount({
      template: `<div><sm-button type="dashed">Dash按钮</sm-button></div>`,
      components: {
        SmButton
      }
    })
    expect(wrapper5.find('.sm-component-btn-dashed').exists()).toBe(true);
    expect(wrapper5.text()).toBe('Dash按钮');

    let wrapper6 = mount({
      template: `<div><sm-button type="link">文字按钮</sm-button></div>`,
      components: {
        SmButton
      }
    })
    expect(wrapper6.find('.sm-component-btn-link').exists()).toBe(true);
    expect(wrapper6.text()).toBe('文字按钮');

    let wrapper7 = mount({
      template: `<div><sm-button loading>loading按钮</sm-button></div>`,
      components: {
        SmButton
      }
    })
    expect(wrapper7.find('.sm-component-btn-loading').exists()).toBe(true);
    expect(wrapper7.text()).toBe('loading按钮');

    let wrapper8 = mount({
      template: `<div><sm-button icon="search"/></div>`,
      components: {
        SmButton
      }
    })
    expect(wrapper8.find('.sm-component-btn-icon-only').exists()).toBe(true);
  })

  it('render buttonGroup', () => {
    wrapper = mount({
      template: `<sm-button-group>
       <sm-button>Cancel</sm-button>
       <sm-button type="primary">
         OK
       </sm-button>
      </sm-button-group>`,
      components: {
        SmButton,
        SmButtonGroup
      }
    })
    expect(wrapper.find('.sm-component-btn-group').exists()).toBe(true);
    expect(wrapper.find('.sm-component-btn').exists()).toBe(true);
  })
})