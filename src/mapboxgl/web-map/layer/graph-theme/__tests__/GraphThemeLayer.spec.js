import { mount, config } from '@vue/test-utils';
import SmGraphThemeLayer from '../GraphThemeLayer.vue';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap.js';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded.js';

describe('GraphThemeLayer.vue', () => {
  let wrapper;
  let mapWrapper;
  let data = {
    type: 'FeatureCollection',
    features: [
      {
        geometry: {
          type: 'Point',
          coordinates: [122.36999999999999, 53.470000000000006]
        },
        properties: {
          站台: '漠河',
          省份: '黑龙江',
          海拔: '296'
        },
        type: 'Feature'
      }
    ]
  };

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
    wrapper = mount(SmGraphThemeLayer, {
      propsData: {
        mapTarget: 'map',
        chartsType: 'Pie',
        data
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
            coordinates: [122, 53]
          },
          properties: {
            省份: '黑龙江',
            海拔: '296'
          },
          type: 'Feature'
        }
      ]
    };
    wrapper = mount(SmGraphThemeLayer, {
      propsData: {
        mapTarget: 'map',
        chartsType: 'Pie',
        data
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      data: newData,
      chartsType: 'Bar',
      options: {
        id: 'newId'
      },
      layerName: 'newName'
    });
    expect(wrapper.vm.chartsType).toBe('Bar');
    expect(wrapper.vm.data).toBe(newData);
    done();
  });
});
