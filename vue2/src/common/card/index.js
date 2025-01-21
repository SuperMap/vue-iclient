import Card from './Card';
import Grid from './Grid';
import Meta from './Meta';
import init from 'vue-iclient/src/init';

Card.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Card.options ? Card.options.name : Card.name, Card);
  Vue.component(Grid.options ? Grid.options.name : Grid.name, Grid);
  Vue.component(Meta.options ? Meta.options.name : Meta.name, Meta);
};

export default Card;
