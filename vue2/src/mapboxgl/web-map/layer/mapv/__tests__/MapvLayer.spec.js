import { mount, config } from '@vue/test-utils';
import SmMapvLayer from '../MapvLayer.vue';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap.js';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded.js';

describe('MapvLayer.vue', () => {
  let wrapper;
  let mapWrapper;

  beforeAll(async () => {
    config.mapLoad = false;
    mapWrapper = await createEmptyMap();
  });

  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (wrapper) {
      wrapper.destroy();
    }
  });

  afterAll(() => {
    config.mapLoad = true;
    if (mapWrapper) {
      mapWrapper.destroy();
    }
  });

  it('render', async done => {
    wrapper = mount(SmMapvLayer, {
      propsData: {
        mapTarget: 'map'
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('change props', async done => {
    const newData = {
      type: 'FeatureCollection',
      features: [
        {
          geometry: {
            type: 'Point',
            coordinates: [122.36999999999999, 53.470000000000006]
          },
          properties: {
            SmGeometrySize: '16',
            区站号: '50136',
            站台: '漠河',
            省份: '黑龙江',
            海拔: '296'
          },
          type: 'Feature'
        }
      ]
    };
    const newOptions = {
      fillStyle: 'rgba(255, 250, 250, 0.2)',
      coordType: 'bd09mc',
      globalCompositeOperation: 'lighter'
    };
    wrapper = mount(SmMapvLayer, {
      propsData: {
        mapTarget: 'map',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              geometry: {
                type: 'Point',
                coordinates: [122.36999999999999, 53.470000000000006]
              },
              properties: {
                SmID: '1',
                SmX: '1.3622166088372886E7',
                SmY: '7070412.841759119',
                SmLibTileID: '1',
                SmUserID: '0'
              },
              type: 'Feature'
            }
          ]
        },
        options: {
          fillStyle: 'rgba(255, 250, 250, 0.2)',
          coordType: 'bd09mc',
          globalCompositeOperation: 'lighter',
          size: 1.5,
          animation: {
            stepsRange: {
              start: 0,
              end: 100
            },
            trails: 3,
            duration: 5
          }
        }
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      layerId: 'newLayerId',
      data: newData,
      options: newOptions
    });
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });
});
