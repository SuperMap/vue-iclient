import { mount, createLocalVue } from '@vue/test-utils';
import '@libs/mapboxgl/mapbox-gl-enhance.js';
import SmVideoPlus from '../VideoPlus.vue';
import mockVideo from 'video.js';

const localVue = createLocalVue();
describe('VideoPlus.vue', () => {
  let wrapper;
  let src = 'http://fakeurl:8081/test.mp4';
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
        src
      },
      attachToDocument: 'body'
    });
    wrapper.vm.$nextTick();
    setTimeout(() => {
      done();
    }, 2000);
  });

  it('video type flv', done => {
    let src = 'http://fakeurl:8081/test.flv';
    wrapper = mount(SmVideoPlus, {
      localVue,
      propsData: {
        videoHeight,
        videoWidth,
        src
      },
      attachToDocument: 'body'
    });
    wrapper.vm.$nextTick();
    setTimeout(() => {
      expect(wrapper.vm.src).toBe(src);
      done();
    }, 2000);
  });
});
