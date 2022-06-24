import { mount } from '@vue/test-utils';
import SmIcon from '../Icon.vue';
import Icon from '../index';

describe('Icon.vue', () => {
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
    wrapper = mount(SmIcon);
    expect(wrapper.find('.sm-component-icon').exists()).toBe(true);
  });

  it('render index correctly', () => {
    wrapper = mount(Icon);
    expect(wrapper.find('.sm-component-icon').exists()).toBe(true);
  });

  it('render icon iconClass correctly', () => {
    wrapper = mount(
      {
        template: `
      <sm-icon iconClass="search" /> `,
        components: {
          SmIcon
        }
      },
      {
        sync: false
      }
    );
    expect(wrapper.find('.sm-component-icon').exists()).toBe(true);
    expect(wrapper.find('i').exists()).toBe(true);
    expect(wrapper.find('i').find('.sm-components-icon-search').exists()).toBe(true);
  });
});
