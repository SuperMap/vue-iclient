import Breadcrumb from './Breadcrumb';
import BreadcrumbItem from './BreadcrumbItem';
import BreadcrumbSeparator from './BreadcrumbSeparator';
import init from 'vue-iclient/src/init';

Breadcrumb.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Breadcrumb.options ? Breadcrumb.options.name : Breadcrumb.name, Breadcrumb);
  Vue.component(BreadcrumbItem.options ? BreadcrumbItem.options.name : BreadcrumbItem.name, BreadcrumbItem);
  Vue.component(BreadcrumbSeparator.options ? BreadcrumbSeparator.options.name : BreadcrumbSeparator.name, BreadcrumbSeparator);
};

export default Breadcrumb;
