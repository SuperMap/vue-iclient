import { mount } from '@vue/test-utils';
import '@libs/mapboxgl/mapbox-gl-enhance.js';
import SmVideoLayer from '../VideoLayer.vue';
import CircleStyle from 'vue-iclient-core/controllers/mapboxgl/_types/CircleStyle';
import createEmptyVideoPlus from 'vue-iclient/test/unit/createEmptyVideoPlus.js';
import videoPlusSubComponentLoaded from 'vue-iclient/test/unit/videoPlusSubComponentLoaded.js';
import mockVideo from 'video.js';

let data = {
  type: 'FeatureCollection',
  features: [
    {
      geometry: {
        type: 'Point',
        coordinates: [122, 53]
      },
      properties: {
        最低气温_Num: '-53.0',
        最高气温_Num: '33.0'
      },
      type: 'Feature'
    }
  ]
};

describe('SmVideoLayer.vue', () => {
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
    wrapper = mount(SmVideoLayer, {
      propsData: {
        target: 'video',
        layerStyle: new CircleStyle(),
        data: data
      }
    });
    await videoPlusSubComponentLoaded(wrapper);
    setTimeout(() => {
      done();
    }, 2000);
  });

  it('change props', async done => {
    wrapper = mount(SmVideoLayer, {
      propsData: {
        target: 'video',
        layerStyle: new CircleStyle(),
        paint: {
          'circle-blur': 1
        },
        layout: {
          visibility: true
        },
        data: data
      }
    });
    let newData = {
      type: 'FeatureCollection',
      features: [
        {
          geometry: {
            type: 'Point',
            coordinates: [200, 200]
          },
          properties: {
            SmID: '1'
          },
          type: 'Feature'
        }
      ]
    };
    await wrapper.setProps({
      data: newData,
      paint: {
        'circle-color': 'red'
      },
      layerStyle: {
        paint: {
          'circle-stroke-color': 'yellow'
        },
        layout: {
          'circle-sort-key': 1
        }
      },
      layout: {
        visibility: false
      }
    });
    wrapper.vm.$nextTick();
    setTimeout(() => {
      done();
    }, 2000);
  });
});
