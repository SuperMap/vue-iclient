import DeckglLayer from './DeckglLayer';
import init from 'vue-iclient/src/init';

DeckglLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(DeckglLayer.options ? DeckglLayer.options.name : DeckglLayer.name, DeckglLayer);
};

export default DeckglLayer;
