import { mount } from '@vue/test-utils';
import '@libs/mapboxgl/mapbox-gl-enhance.js';
import SmVideoPlus from '../../../VideoPlus.vue';
import SmVideoPlusDraw from '../Draw.vue';
import mockVideo from 'video.js';

describe('SmVideoPlusDraw.vue', () => {
  let wrapper;
  let videoPlusWrapper;
  let src = 'http://fakeurl:8081/test.mp4';
  let videoWidth = '1920';
  let videoHeight = '1080';
  beforeEach(() => {
    wrapper = null;
    mockVideo.mockImplementation(e => {
      if (e) {
        return {
          el_: {
            firstChild: {
              id: 'video_id'
            }
          },
          on(type, callback) {
            setTimeout(() => {
              callback();
            }, 1000);
          },
          one() {},
          play() {},
          pause() {},
          currentTime() {},
          getTech() {},
          mergeOptions() {},
          registerTech() {}
        }
      }
    });
    videoPlusWrapper = mount(SmVideoPlus, {
      propsData: {
        videoHeight,
        videoWidth,
        src
      }
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
    if (videoPlusWrapper) {
      videoPlusWrapper.destroy();
    }
  });

  it('render', done => {
    wrapper = mount(SmVideoPlusDraw, {
      propsData: {
        target: "video"
      }
    });
    setTimeout(() => {
      done();
    }, 2000);
  });
});
