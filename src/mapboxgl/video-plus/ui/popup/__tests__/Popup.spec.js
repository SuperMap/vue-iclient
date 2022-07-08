import { mount } from '@vue/test-utils';
import '@libs/mapboxgl/mapbox-gl-enhance.js';
import SmVideoPlusPopup from '../Popup.vue';
import createEmptyVideoPlus from 'vue-iclient/test/unit/createEmptyVideoPlus.js';
import videoPlusSubComponentLoaded from 'vue-iclient/test/unit/videoPlusSubComponentLoaded.js';
import mockVideo from 'video.js';
describe('SmvideoPlusPupup.vue', () => {
  let wrapper;
  let videoPlusWrapper;

  beforeEach(() => {
    wrapper = null;
  });

  beforeAll(async () => {
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
            }, 0);
          },
          one() {},
          play() {},
          pause() {},
          currentTime() {},
          getTech() {},
          mergeOptions() {},
          registerTech() {}
        };
      }
    });
    videoPlusWrapper = await createEmptyVideoPlus();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (wrapper) {
      wrapper.destroy();
    }
  });

  afterAll(() => {
    if (videoPlusWrapper) {
      videoPlusWrapper.destroy();
    }
  });

  it('render', async done => {

    wrapper = mount(SmVideoPlusPopup, {
      propsData: {
        mapTarget: "map",
      }
    });
    await videoPlusSubComponentLoaded(wrapper);
    setTimeout(() => {
      done();
    }, 2000);
  });

  it('change props', async done => {

    wrapper = mount(SmVideoPlusPopup, {
      propsData: {
        mapTarget: "map",
      }
    });
    await videoPlusSubComponentLoaded(wrapper);
    setTimeout(() => {
      wrapper.setProps({
        coordinate: [500, 500],
        show: false
      })
      setTimeout(() => {
        done();
      }, 500);
    }, 2000);
  });
});
