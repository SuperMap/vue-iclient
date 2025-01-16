import { mount, config } from '@vue/test-utils';
import SmRasterTileLayer from '../RasterTileLayer.vue';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap.js';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded.js';

describe('SmRasterTileLayer.vue', () => {
  let wrapper;
  let mapWrapper;

  beforeAll(async () => {
    config.mapLoad = false;
    mapWrapper = await createEmptyMap();
  })

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
  })

  it('render', async done => {
    wrapper = mount(SmRasterTileLayer, {
      propsData: {
        mapTarget: 'map',
        layerId: 'myRasterLayer',
        opacity: 0.8,
        visible: true,
        mapUrl: 'www.fakeurl.com/PopulationDistribution'
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });
});
