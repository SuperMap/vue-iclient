import CollapseCard from './CollapseCard';
import init from 'vue-iclient/src/init';

CollapseCard.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(CollapseCard.options ? CollapseCard.options.name : CollapseCard.name, CollapseCard);
};

export default CollapseCard;
