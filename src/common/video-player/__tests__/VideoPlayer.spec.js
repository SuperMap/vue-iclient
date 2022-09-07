import { mount, createLocalVue } from '@vue/test-utils';
import SmVideoPlayer from '../VideoPlayer.vue';
const localVue = createLocalVue();
import { message } from 'ant-design-vue';
localVue.prototype.$message = message;
import mockVideo from 'video.js';

describe('VideoPlayer.vue', () => {
  let wrapper;
  let pauseStub;
  let loadStub;
  beforeEach(() => {
    const videojs = (videoObj, videoOptions, cb) => {
     const res = {
        el_: {
          firstChild: {
            id: 'video_id'
          }
        },
        volume() {},
        muted() {},
        on() {},
        one() {},
        play() {},
        pause() {},
        currentTime() {},
        getTech() {},
        mergeOptions() {},
        registerTech() {}
      }
      cb.apply(res);
      return res;
    }
    mockVideo.mockImplementation(videojs);
    pauseStub = jest.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    loadStub = jest.spyOn(window.HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
    wrapper = null;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
    pauseStub.mockRestore();
    loadStub.mockRestore();
  });

  it('render', async done => {
    wrapper = mount(SmVideoPlayer, {
      localVue,
      propsData: {
        // url: 'fakeurl.mp4',
        options: {
          muted: true,
          loop: false,
          popupToPlay: false,
          autoplay: false,
          controlBar: true
        }
      },
      attachToDocument: 'body'
    });
    expect(wrapper.find('.sm-component-video-player').exists()).toBe(true);
    wrapper.vm.$on('instance-loaded', player => {
      expect(player).not.toBeUndefined();
      done();
    });
    await wrapper.vm.$nextTick();
  });

  it('change props', async () => {
    wrapper = mount(SmVideoPlayer, {
      localVue,
      propsData: {
        url: 'fakeurl.mp4',
        options: {
          muted: true,
          loop: false,
          popupToPlay: false,
          autoplay: false,
          controlBar: true
        }
      },
      attachToDocument: 'body'
    });
    expect(wrapper.find('.sm-component-video-player').exists()).toBe(true);
    await wrapper.setProps({
      url: 'rtmp://1.fakeurlAA.flv',
      options: {
        muted: true,
        loop: true,
        popupToPlay: true,
        autoplay: true,
        controlBar: true
      }
    });
    expect(wrapper.vm.isRtmp).toBeTruthy();
    expect(wrapper.vm.isFlv).toBeFalsy();
    expect(wrapper.vm.autoplay).toBeTruthy();
    expect(wrapper.vm.options.loop).toBeTruthy();
    expect(wrapper.vm.modalVisible).toBeFalsy();
  });
});
