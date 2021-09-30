import {
  mount
} from '@vue/test-utils';
import SmNav from '../Nav.vue';
import Nav from '../index';

describe('Nav.vue', () => {
  let wrapper;
  let title = {
    text: '导航栏',
    position: 'center',
    href: '',
    target: '_blank'
  };
  let items = [{
      key: 1,
      title: '菜单1'
    },
    {
      key: 2,
      title: '菜单2'
    },
    {
      key: 3,
      title: '菜单3'
    },
    {
      key: 4,
      title: '菜单4'
    },
    {
      key: 5,
      title: '菜单5'
    },
    {
      key: 6,
      title: '菜单6'
    }
  ]
  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  })

  it('render default correctly', () => {
    wrapper = mount(SmNav);
  })

  it('render default correctly', () => {
    wrapper = mount(Nav);
  })

  it('Base props', () => {
    wrapper = mount(SmNav, {
      propsData: {
        title: title,
        items: items
      },
    });
  })
})