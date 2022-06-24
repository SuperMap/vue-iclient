import Avatar from './Avatar';
import init from 'vue-iclient/src/init';

Avatar.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Avatar.options ? Avatar.options.name : Avatar.name, Avatar);
};

export default Avatar;
