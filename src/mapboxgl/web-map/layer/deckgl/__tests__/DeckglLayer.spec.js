import { mount, config } from '@vue/test-utils';
import SmDeckglLayer from '../DeckglLayer.vue';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap.js';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded.js';

const data = [
  {
    Age: '29',
    DBH: '21',
    Plan: '1988',
    PlantDate: '1988-07-21 00:00',
    PlantType: 'Tree',
    SiteOrder: '1',
    TreeID: '141565',
    latitude: '37.77596769',
    longitude: '-122.4413967',
    qAddress: '501X Baker St',
    qSiteInfo: 'Sidewalk: Curb side : Cutout',
    qSpecies: 'Myoporum laetum :: Myoporum'
  }
];
const options = {
  data,
  props: {
    extruded: true,
    radius: 55,
    autoHighlight: true,
    upperPercentile: 99,
    coverage: 0.8,
    elevationScale: 400,
    colorRange: [
      [43, 30, 61, 255],
      [56, 60, 101, 255],
      [62, 95, 126, 255]
    ],
    opacity: 0.8,
    lightSettings: {
      lightsPosition: [-122.5, 37.7, 3000, -122.2, 37.9, 3000]
    }
  }
};
describe('DeckglLayer.vue', () => {
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
    wrapper = mount(SmDeckglLayer, {
      propsData: {
        mapTarget: 'map',
        layerType: 'hexagon-layer',
        options
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('change props', async done => {
    const newOptions = {
      data,
      props: {
        elevationScale: 400,
        colorRange: [
          [43, 30, 61, 255],
          [56, 60, 101, 255],
          [62, 95, 126, 255]
        ],
        opacity: 1,
        lightSettings: {
          lightsPosition: [-122.5, 37.7, 3000, -122.2, 37.9, 3000]
        }
      }
    };
    wrapper = mount(SmDeckglLayer, {
      propsData: {
        mapTarget: 'map',
        layerType: 'hexagon-layer'
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      options: newOptions,
      layerType: 'screen-grid-layer'
    });
    expect(wrapper.vm.layerType).toBe('screen-grid-layer');
    done();
  });
});
