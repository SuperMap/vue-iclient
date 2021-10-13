import {
  mount
} from '@vue/test-utils';
import SmAvatar from '../Avatar.vue';
import Avatar from '../index';

describe('SmAvatar.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  })

  it('Render correctly', () => {
    const wrapper = mount(SmAvatar, {
      slots: {
        default: ['testString']
      }
    });
    const children = wrapper.findAll('.sm-component-avatar-string');
    expect(children.length).toBe(1);
    expect(children.at(0).text()).toBe('testString');
  });

  it('render index correctly', () => {
    wrapper = mount(Avatar)
    expect(wrapper.find('.sm-component-avatar').exists()).toBe(true);
  })

  it('should render props defalut correctly', () => {
    const wrapper = mount(SmAvatar, {
      propsData: {
        src: 'http://test.url',
        size: 'small',
        icon: 'user'
      },
      attachTo: 'body',
    });
    const children = wrapper.findAll('.sm-component-avatar');
    expect(children.length).toBe(1);
    expect(wrapper.props().src).toBe('http://test.url');
    expect(wrapper.props().size).toBe('small');
    expect(wrapper.props().icon).toBe('user');
  });

  it('should render props in components correctly', () => {
    const div = global.document.createElement('div');
    global.document.body.appendChild(div);
    wrapper = mount({
      template: `
      <sm-avatar size="large" shape="square" src="http://test.url">
        SmAvatar
      </sm-avatar>`,
      components: {
        SmAvatar,
      },
    }, {
      attachTo: div
    })
    expect(wrapper.find('.sm-component-avatar-square').exists()).toBe(true);
    expect(wrapper.find('.sm-component-avatar-lg').exists()).toBe(true);
    expect(wrapper.find('.sm-component-avatar-image').exists()).toBe(true);
    expect(wrapper.find('img').exists()).toBe(true);
    expect(wrapper.find('img').attributes('src')).toBe('http://test.url');
    global.document.body.removeChild(div);
  });

  it('this.$slot.icon', () => {
    const div = global.document.createElement('div');
    global.document.body.appendChild(div);
    wrapper = mount({
      template: `
      <sm-avatar iconClass="sm-components-icon-search">
        SmAvatar
      </sm-avatar>`,
      components: {
        SmAvatar,
      },
    }, {
      attachTo: div
    })
    expect(wrapper.find('.sm-component-avatar-icon').exists()).toBe(true);
    expect(wrapper.find('i').exists()).toBe(true);
    expect(wrapper.find('i').find('.sm-components-icon-search').exists()).toBe(true);
    global.document.body.removeChild(div);
  });
})