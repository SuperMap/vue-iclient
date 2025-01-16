import Menu from './Menu';
import MenuItem from './MenuItem';
import SubMenu from './SubMenu';
import init from 'vue-iclient/src/init';

Menu.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Menu.options ? Menu.options.name : Menu.name, Menu);
  Vue.component(MenuItem.options ? MenuItem.options.name : MenuItem.name, MenuItem);
  Vue.component(SubMenu.options ? SubMenu.options.name : SubMenu.name, SubMenu);
};

export default Menu;
