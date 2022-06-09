import { mount } from '@vue/test-utils';
import SmVideoPlus from '../../src/mapboxgl/video-plus/VideoPlus';
let url = 'http://fakeurl:8081/test.mp4';
export default function createEmptyMap() {
  const wrapper = mount(SmVideoPlus, {
    propsData: {
      url
    }
  });
  setTimeout(() => {
    wrapper.vm.viewModel.fire('load', { videoPlus: wrapper.vm.viewModel, map: wrapper.vm.viewModel.map });
  }, 2000);
  return wrapper;
}

