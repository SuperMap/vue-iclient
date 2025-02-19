import { mount, config } from '@vue/test-utils';
import SmGeojsonLayer from '../GeojsonLayer.vue';
import CircleStyle from 'vue-iclient-core/controllers/mapboxgl/_types/CircleStyle';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap.js';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded.js';

let data = {
  type: 'FeatureCollection',
  features: [
    {
      geometry: {
        type: 'Point',
        coordinates: [122.36999999999999, 53.470000000000006]
      },
      properties: {
        最低气温_Num: '-53.0',
        最高气温_Num: '33.0',
        最高七天气温_Num: '29.0',
        平均最低气温_Num: '-47.0',
        海波_Num: '296.0'
      },
      type: 'Feature'
    }
  ]
};

describe('GeojsonLayer.vue', () => {
  let wrapper;
  let mapWrapper;
  let layerStyle = new CircleStyle();

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
    let data = JSON.stringify(data);
    wrapper = mount(SmGeojsonLayer, {
      propsData: {
        mapTarget: 'map',
        layerStyle: layerStyle,
        data: data
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('geojson layerStyle', async done => {
    let data = JSON.stringify(data);
    wrapper = mount(SmGeojsonLayer, {
      propsData: {
        mapTarget: 'map',
        layerStyle: layerStyle,
        data: data
      }
    });
    await mapSubComponentLoaded(wrapper);
    const getSourceSpy = jest.spyOn(wrapper.vm.map, 'getSource');
    const setLayoutPropertySpy = jest.spyOn(wrapper.vm.map, 'setLayoutProperty');
    wrapper.vm.viewModel.setData(data);
    wrapper.vm.viewModel.setLayerStyle(layerStyle);
    expect(getSourceSpy).toBeCalled();
    expect(setLayoutPropertySpy).toBeCalled();
    done();
  });

  it('geojson setdata', async done => {
    let data = JSON.stringify(data);
    wrapper = mount(SmGeojsonLayer, {
      propsData: {
        mapTarget: 'map',
        layerStyle: layerStyle,
        data: data
      }
    });
    await mapSubComponentLoaded(wrapper);
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
    await wrapper.setProps({ data: newData });
    wrapper.vm.$nextTick();
    expect(wrapper.vm.data).toBe(newData);
    done();
  });
});
