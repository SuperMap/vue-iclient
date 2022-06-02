import { mount } from '@vue/test-utils';
import '@libs/mapboxgl/mapbox-gl-enhance.js';
import SmvideoPlus from '../../../videoPlus.vue';
import SmVideoPlusPopup from '../Popup.vue';
import mockVideo from 'video.js';
describe('SmvideoPlusPupup.vue', () => {
  let wrapper;
  let videoMapWrapper;
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
            callback();
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
    videoMapWrapper = mount(SmvideoPlus, {
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
    if (videoMapWrapper) {
      videoMapWrapper.destroy();
    }
  });

  it('render', done => {

    wrapper = mount(SmVideoPlusPopup, {
      propsData: {
        mapTarget: "map",
      }
    });
    setTimeout(() => {
      done();
    }, 2000);
  });
});
