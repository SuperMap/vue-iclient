import { mount, config } from '@vue/test-utils';
import SmHeatmapLayer from '../HeatmapLayer.vue';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap.js';

describe('HeatmapLayer.vue', () => {
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
          SmID: '1',
          SmX: '1.3622166088372886E7',
          SmY: '7070412.841759119',
          SmLibTileID: '1',
          SmUserID: '0',
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

  beforeAll(async () => {
    config.mapLoad = false;
    mapWrapper = await createEmptyMap();
  })

  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (mapWrapper) {
      mapWrapper.destroy();
    }
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

  it('render', done => {
    wrapper = mount(SmHeatmapLayer, {
      propsData: {
        mapTarget: 'map',
        data
      }
    });
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('setData', async done => {
    let newData = {
      type: 'FeatureCollection',
      features: [
        {
          geometry: {
            type: 'Point',
            coordinates: [122, 53]
          },
          properties: {
            SmID: '1'
          },
          type: 'Feature'
        }
      ]
    };
    wrapper = mount(SmHeatmapLayer, {
      propsData: {
        data: {}
      }
    });
    await wrapper.setProps({
      data: newData,
      layerStyle: {}
    });
    expect(wrapper.vm.viewModel.data).toBe(newData);
    done();
  });
});
