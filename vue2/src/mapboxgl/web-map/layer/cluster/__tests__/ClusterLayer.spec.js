import { mount, config } from '@vue/test-utils';
import SmClusterLayer from '../ClusterLayer.vue';
import CircleStyle from 'vue-iclient-core/controllers/mapboxgl/types/CircleStyle';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap.js';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded.js';

describe('ClusterLayer.vue', () => {
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
          站台: '漠河'
        },
        type: 'Feature'
      }
    ]
  };

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

  it('render default correctly', async done => {
    wrapper = mount(SmClusterLayer, {
      propsData: {
        mapTarget: 'map',
        data: data
      }
    });
    await mapSubComponentLoaded(wrapper);
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
    const clusteredPointStyle = new CircleStyle({
      'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 100, '#f1f075', 750, '#f28cb1'],
      'circle-radius': ['step', ['get', 'point_count'], 10, 80, 20, 600, 50]
    });
    const unclusteredPointStyle = new CircleStyle({
      'circle-color': '#11b4da',
      'circle-stroke-width': 1,
      'circle-stroke-color': '#fff'
    });
    wrapper = mount(SmClusterLayer, {
      propsData: {
        mapTarget: 'map',
        data
      }
    });
    await mapSubComponentLoaded(wrapper);
    const setDataSpy = jest.spyOn(wrapper.vm.viewModel, 'setData');
    await wrapper.setProps({
      data: newData,
      clusteredPointStyle,
      unclusteredPointStyle
    });
    expect(wrapper.vm.viewModel.data).toBe(newData);
    expect(wrapper.vm.mapTarget).toBe('map');
    expect(setDataSpy).toBeCalled();
    done();
  });
});
