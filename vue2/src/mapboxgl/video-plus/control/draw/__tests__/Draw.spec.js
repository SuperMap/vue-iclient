import { mount } from '@vue/test-utils';
import '@libs/mapboxgl/mapbox-gl-enhance.js';
import SmVideoPlusDraw from '../Draw.vue';
import createEmptyVideoPlus from 'vue-iclient/test/unit/createEmptyVideoPlus.js';
import videoPlusSubComponentLoaded from 'vue-iclient/test/unit/videoPlusSubComponentLoaded.js';
import mockVideo from 'video.js';

describe('SmVideoPlusDraw.vue', () => {
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
        }
      }
    });
    videoPlusWrapper = await createEmptyVideoPlus();
  })

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
  })

  it('render', async done => {
    wrapper = mount(SmVideoPlusDraw, {
      propsData: {
        target: "video"
      }
    });
    await videoPlusSubComponentLoaded(wrapper);
    expect(wrapper.vm.target).toBe('video');
    setTimeout(() => {
      done();
    }, 2000);
  });
});
