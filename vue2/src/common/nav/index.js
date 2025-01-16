import Nav from './Nav';
import init from 'vue-iclient/src/init';

Nav.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Nav.options ? Nav.options.name : Nav.name, Nav);
};

export default Nav;
