import { mount } from '@vue/test-utils';
import SmLayoutContent from '../Content.vue';
import SmLayoutFooter from '../Footer.vue';
import SmLayoutHeader from '../Header.vue';
import SmLayout from '../Layout.vue';
import Layout from '../index';
import SmLayoutSider from '../Sider.vue';

describe('Layout.vue', () => {
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
      <sm-layout style="margin-bottom: 48px;">
        <sm-layout-header style="background: rgb(125, 188, 234); color: #fff;">Header</sm-layout-header>
        <sm-layout-footer style="background: rgb(125, 188, 234); color: #fff; line-height: 1.5;">Footer</sm-layout-footer>
      </sm-layout>`,
        components: {
          SmLayout,
          SmLayoutHeader,
          SmLayoutFooter
        }
      },
      {
        sync: false
      }
    );
    expect(wrapper.find('.sm-component-layout').exists()).toBe(true);
    expect(wrapper.find('.sm-component-layout-header').exists()).toBe(true);
    expect(wrapper.find('.sm-component-layout-header').element.style.background).toBe('rgb(125, 188, 234)');
    expect(wrapper.find('.sm-component-layout-footer').element.style.lineHeight).toBe('1.5');
  });

  it('render index correctly', () => {
    wrapper = mount(Layout);
    expect(wrapper.find('.sm-component-layout').exists()).toBe(true);
  });

  it('render layout correctly', () => {
    wrapper = mount(
      {
        template: `
        <sm-layout style="background: rgba(16, 142, 233, 1); color: rgb(255, 255, 255); min-height: 120px; line-height: 120px;">
          <sm-layout-sider style="background: #3ba0e9; color: #fff; line-height: 120px;">Sider</sm-layout-sider>
          <sm-layout-content>Content</sm-layout-content>
        </sm-layout>`,
        components: {
          SmLayout,
          SmLayoutContent,
          SmLayoutSider
        }
      },
      {
        sync: false
      }
    );
    const layout = wrapper.find('.sm-component-layout');
    expect(layout.exists()).toBe(true);
    expect(layout.element.style.color).toBe('rgb(255, 255, 255)');
  });
});
