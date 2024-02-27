import { mount, createLocalVue } from '@vue/test-utils';
import '@libs/mapboxgl/mapbox-gl-enhance.js';
import SmVideoPlus from '../VideoPlus.vue';
import mockVideo from 'video.js';

const localVue = createLocalVue();
describe('VideoPlus.vue', () => {
  let wrapper;
  let url = 'http://fakeurl:8081/test.mp4';
  let videoWidth = '1920';
  let videoHeight = '1080';
  beforeEach(() => {
    mockVideo.mockImplementation(e => {
      if (e) {
        return {
          el_: {
            firstChild: {
              id: 'video_id'
            }
          },
          one(type, callback) {
            callback();
          },
          play() {},
          pause() {},
          currentTime() {},
          getTech() {},
          mergeOptions() {},
          registerTech() {}
        }
      }
    });
    wrapper = null;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  });

  it('render', done => {
    wrapper = mount(SmVideoPlus, {
      localVue,
      propsData: {
        videoHeight,
        videoWidth,
        url
      },
      attachToDocument: 'body'
    });
    wrapper.vm.$nextTick();
    setTimeout(() => {
      done();
    }, 2000);
  });

  it('render no url', done => {
    wrapper = mount(SmVideoPlus, {
      localVue,
      propsData: {
        videoHeight,
        videoWidth
      },
      attachToDocument: 'body'
    });
    wrapper.vm.$nextTick();
    setTimeout(() => {
      done();
    }, 2000);
  });

  it('video type flv', done => {
    let url = 'http://fakeurl:8081/test.flv';
    wrapper = mount(SmVideoPlus, {
      localVue,
      propsData: {
        videoHeight,
        videoWidth,
        url
      },
      attachToDocument: 'body'
    });
    wrapper.vm.$nextTick();
    setTimeout(() => {
      expect(wrapper.vm.url).toBe(url);
      done();
    }, 2000);
  });

  it('change size', done => {
    let url = 'http://fakeurl:8081/test.flv';
    wrapper = mount(SmVideoPlus, {
      localVue,
      propsData: {
        videoHeight,
        videoWidth,
        url
      },
      attachToDocument: 'body'
    });
    wrapper.vm.$nextTick();
    setTimeout(() => {
      wrapper.setProps({
        videoHeight: 900,
        url: 'http://fakeurl:8081/test.m3u8',
        videoWidth: 1200,
        play: true
      });
     setTimeout(() => {
      done();
     }, 500);
    }, 2000);
  });

  it('change size error', done => {
    let url = 'http://fakeurl:8081/test.flv';
    wrapper = mount(SmVideoPlus, {
      localVue,
      propsData: {
        videoHeight,
        videoWidth,
        url
      },
      attachToDocument: 'body'
    });
    wrapper.setProps({
      videoHeight: 900,
      videoWidth: 1200,
    });
    setTimeout(() => {
      done();
    }, 2000);
  });
});
