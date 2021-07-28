import {
  mount
} from '@vue/test-utils';
import SmBreadcrumb from '../Breadcrumb.vue';
import Breadcrumb from '../index';
import SmBreadcrumbItem from '../BreadcrumbItem.vue';
import SmBreadcrumbSeparator from '../BreadcrumbSeparator.vue';

describe('Breadcrumb.vue', () => {
  let wrapper;
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  const div = global.document.createElement('div');
  global.document.body.appendChild(div);
  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
    errorSpy.mockReset();
  })

  it('warns on non-sm-breadcrumb-item and non-Breadcrumb.Separator children', () => {
    wrapper = mount({
      template: `
      <sm-breadcrumb>
        <div>foo</div>
      </sm-breadcrumb>`,
      components: {
        SmBreadcrumb,
      },
    },
    { attachTo: div }
  )
    expect(errorSpy.mock.calls).toHaveLength(1);
    expect(errorSpy.mock.calls[0][0]).toMatch(
      "Warning: [antdv: Breadcrumb] Only accepts Breadcrumb.Item and Breadcrumb.Separator as it's children",
    );
  });

  it('render breadcrumb correctly', () => {
    wrapper = mount({
      template: `
      <sm-breadcrumb>
        <sm-breadcrumb-item>xxx</sm-breadcrumb-item>
        <sm-breadcrumb-item>yyy</sm-breadcrumb-item>
      </sm-breadcrumb>`,
      components: {
        SmBreadcrumb,
        SmBreadcrumbItem,
      },
    },
    { attachTo: div }
    );
    expect(errorSpy).not.toHaveBeenCalled();
    expect(wrapper.find('.sm-component-breadcrumb').exists()).toBe(true);
    let breadcrumbItem = wrapper.findAll('.sm-component-breadcrumb-link');
    expect(breadcrumbItem.length).toBe(2);
    expect(breadcrumbItem.at(0).text()).toBe('xxx');
    expect(breadcrumbItem.at(1).text()).toBe('yyy');
    let breadcrumbSeparator = wrapper.findAll('.sm-component-breadcrumb-separator');
    expect(breadcrumbSeparator.length).toBe(2);
    expect(breadcrumbSeparator.at(0).text()).toBe('/');
    expect(breadcrumbSeparator.at(1).text()).toBe('/');
  })

  it('render index correctly', () => {
    wrapper = mount(Breadcrumb)
    expect(wrapper.find('.sm-component-breadcrumb').exists()).toBe(true);
  })

  it('should render a menu', () => {
    const routes = [
      {
        path: 'index',
        breadcrumbName: 'home',
      },
      {
        path: 'first',
        breadcrumbName: 'first',
        children: [
          {
            path: '/general',
            breadcrumbName: 'General',
          },
          {
            path: '/layout',
            breadcrumbName: 'Layout',
          },
          {
            path: '/navigation',
            breadcrumbName: 'Navigation',
          },
        ],
      },
      {
        path: 'second',
        breadcrumbName: 'second',
      },
    ];
    wrapper = mount(SmBreadcrumb, {
      propsData: { routes }
    });
    expect(errorSpy).not.toHaveBeenCalled();
    expect(wrapper.find('.sm-component-breadcrumb').exists()).toBe(true);
    let breadcrumbItem = wrapper.findAll('.sm-component-breadcrumb-link');
    expect(breadcrumbItem.length).toBe(3);
    expect(breadcrumbItem.at(0).text()).toBe('home');
    expect(breadcrumbItem.at(1).text()).toBe('first');
    expect(breadcrumbItem.at(2).text()).toBe('second');
    let breadcrumbSeparator = wrapper.findAll('.sm-component-breadcrumb-separator');
    expect(breadcrumbSeparator.length).toBe(3);
    expect(breadcrumbSeparator.at(0).text()).toBe('/');
    expect(breadcrumbSeparator.at(1).text()).toBe('/');
    expect(breadcrumbSeparator.at(2).text()).toBe('/');
    let breadcrumbLink = wrapper.findAll('a');
    expect(breadcrumbLink.length).toBe(2);
    expect(breadcrumbLink.at(0).attributes('href')).toBe('#/index');
    expect(breadcrumbLink.at(1).attributes('href')).toBe('#/index/first');



  });

  it('should support custom separator', () => {
    wrapper = mount({
      template: `
      <sm-breadcrumb>
        <span slot="separator" style="color: red">***</span>
        <sm-breadcrumb-item />
        <sm-breadcrumb-item>xxx</sm-breadcrumb-item>
        <sm-breadcrumb-item>yyy</sm-breadcrumb-item>
      </sm-breadcrumb>`,
      components: {
        SmBreadcrumb,
        SmBreadcrumbItem,
      },
    },
    { 
      attachTo: div,
      slot: {
        separator: SmBreadcrumbSeparator
      }
      }
    );
    expect(errorSpy).not.toHaveBeenCalled();
    expect(wrapper.find('.sm-component-breadcrumb').exists()).toBe(true);
    let breadcrumbSeparator = wrapper.findAll('.sm-component-breadcrumb-separator');
    expect(breadcrumbSeparator.length).toBe(2);
    expect(breadcrumbSeparator.at(0).text()).toBe('***');
    expect(breadcrumbSeparator.at(1).text()).toBe('***');
  })
})