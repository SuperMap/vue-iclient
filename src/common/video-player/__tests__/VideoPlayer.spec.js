import {
  mount, createLocalVue
} from '@vue/test-utils';
import SmVideoPlayer from '../VideoPlayer.vue';
const localVue = createLocalVue();
import { message } from 'ant-design-vue';
localVue.prototype.$message = message;
describe('VideoPlayer.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  })

  it('render', () => {
    wrapper = mount(SmVideoPlayer, {
      localVue,
      propsData: {
        url: 'fakeurl.mp4'
      }
    })
    expect(wrapper.find('.sm-component-video-player').exists()).toBe(true);
  })
})