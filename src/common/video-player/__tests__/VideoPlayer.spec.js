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
          controlBar: true,
          poster: ''
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
        isFullscreen: false,
        ratio: 'origin',
        options: {
          muted: true,
          loop: false,
          popupToPlay: true,
          autoplay: false,
          controlBar: true,
          poster: ''
        }
      },
      attachToDocument: 'body'
    });
    expect(wrapper.find('.sm-component-video-player').exists()).toBe(true);
    await wrapper.setProps({
      url: 'rtmp://1.fakeurlAA.flv',
      isFullscreen: true,
      ratio: 'full',
      options: {
        muted: true,
        loop: true,
        popupToPlay: false,
        autoplay: true,
        controlBar: true,
        poster:'fake url'
      }
    });
    expect(wrapper.vm.ratio).toBe('full');
    expect(wrapper.vm.isRtmp).toBeTruthy();
    expect(wrapper.vm.isFlv).toBeFalsy();
    expect(wrapper.vm.autoplay).toBeTruthy();
    expect(wrapper.vm.options.loop).toBeTruthy();
    expect(wrapper.vm.options.poster).toBe('fake url');
    expect(wrapper.vm.modalVisible).toBeFalsy();
    const res = wrapper.vm.isMatchVideoUrl('../stest');
    expect(res).toBeTruthy();
    const res1 = wrapper.vm.isMatchVideoUrl('./stest');
    expect(res1).toBeTruthy();
    const res2 = wrapper.vm.isMatchVideoUrl('stest');
    expect(res2).toBeFalsy();
    const res3 = wrapper.vm.isMatchVideoUrl('');
    expect(res3).toBeFalsy();
    const res4 = wrapper.vm.isMatchVideoUrl('http://127.0.0.0:8080/a.png');
    expect(res4).toBeTruthy();

    const res5 = wrapper.vm.isMatchPosterUrl('../stest');
    expect(res5).toBeTruthy();
    const res6 = wrapper.vm.isMatchPosterUrl('./stest');
    expect(res6).toBeTruthy();
    const res7 = wrapper.vm.isMatchPosterUrl('stest');
    expect(res7).toBeFalsy();
    const res8 = wrapper.vm.isMatchPosterUrl('');
    expect(res8).toBeTruthy();
    const res9 = wrapper.vm.isMatchPosterUrl('http://127.0.0.0:8080/a.png');
    expect(res9).toBeTruthy();
  });
  it('clear src when url is empty', async () => {
    wrapper = mount(SmVideoPlayer, {
      localVue,
      propsData: {
        url: 'rtmp://1.fakeurlAA.flv',
        isFullscreen: false,
        ratio: 'origin',
        options: {
          muted: true,
          loop: false,
          popupToPlay: true,
          autoplay: false,
          controlBar: true,
          poster: ''
        }
      },
      attachToDocument: 'body'
    });
    expect(wrapper.find('.sm-component-video-player').exists()).toBe(true);
    expect(wrapper.vm.playerOptions.sources[0].src).toBe('rtmp://1.fakeurlAA.flv');
    expect(wrapper.vm.modalPlayerOptions.sources[0].src).toBe('rtmp://1.fakeurlAA.flv');
    await wrapper.setProps({
      url: ''
    });
    expect(wrapper.vm.playerOptions.sources[0].src).toBe('');
    expect(wrapper.vm.modalPlayerOptions.sources[0].src).toBe('');
  });
});
