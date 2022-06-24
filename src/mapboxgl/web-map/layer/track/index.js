import TrackLayer from './TrackLayer';
import init from 'vue-iclient/src/init';

TrackLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(TrackLayer.options ? TrackLayer.options.name : TrackLayer.name, TrackLayer);
};

export default TrackLayer;
