import Content from './Content';
import Footer from './Footer';
import Header from './Header';
import Layout from './Layout';
import Sider from './Sider';
import init from 'vue-iclient/src/init';

Layout.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Content.options ? Content.options.name : Content.name, Content);
  Vue.component(Footer.options ? Footer.options.name : Footer.name, Footer);
  Vue.component(Header.options ? Header.options.name : Header.name, Header);
  Vue.component(Layout.options ? Layout.options.name : Layout.name, Layout);
  Vue.component(Sider.options ? Sider.options.name : Sider.name, Sider);
};

export default Layout;
