import {
  toI18n
} from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: `${toI18n('basicComponent.title')}/${toI18n('basicComponent.nav.title')}`,
  id: 'BasicComponents/nav'
};

export const BasicNav = () => ({
  mixins: [theme],
  data() {
    return {
      item: {
        index: 0,
        title: '菜单1'
      },
      title: {
        text: '导航栏',
        position: 'center',
        href: '',
        target: '_blank'
      },
      data: [
        {
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
    };
  },
  methods: {
    changeItem(item, index) {
      this.item.index = index;
      this.item.title = item.title;
    }
  },
  template: `
  <div>
    <sm-nav :items="data" :title="title" style="width: 100%; height: 80px;" @change=changeItem></sm-nav>
    <div style="width: 100%; height: 50px; font-size: 16px"> 
      {{ item.title }} 内容； Index {{ item.index }} 
    </div>
  </div>
  `
});
BasicNav.story = {
  name: toI18n('basicComponent.basic')
};
