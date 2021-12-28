import { mount, config } from '@vue/test-utils';
import SmLabelThemeLayer from '../LabelThemeLayer.vue';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap.js';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded.js';

describe('LabelThemeLayer.vue', () => {
  let wrapper;
  let mapWrapper;
  const features = [
    {
      geometry: {
        type: 'Point',
        coordinates: [122.36999999999999, 53.470000000000006]
      },
      properties: {
        最高七天气温_Num: '29.0',
        平均最低气温_Num: '-47.0',
        海波_Num: '296.0'
      },
      type: 'Feature'
    }
  ];

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
    wrapper = mount(SmLabelThemeLayer, {
      propsData: {
        mapTarget: 'map',
        data: features,
        layerName: 'LabelThemeLayer'
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
    wrapper = mount(SmLabelThemeLayer, {
      propsData: {
        mapTarget: 'map',
        data: features,
        layerName: 'LabelThemeLayer'
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      data: newData,
      options: {
        id: 'newId'
      },
      layerName: 'newName'
    });
    expect(wrapper.vm.data).toBe(newData);
    done();
  });
});
