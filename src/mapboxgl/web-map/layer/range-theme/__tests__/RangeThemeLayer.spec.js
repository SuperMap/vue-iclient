import { mount, config } from '@vue/test-utils';
import SmRangeThemeLayer from '../RangeThemeLayer.vue';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap.js';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded.js';

let data = [
  {
    geometry: {
      type: 'Point',
      coordinates: [122.36999999999999, 53.470000000000006]
    },
    properties: {
      SmID: '1',
      SmX: '1.3622166088372886E7',
      SmY: '7070412.841759119',
      SmLibTileID: '1'
    },
    type: 'Feature'
  }
];

describe('RangeThemeLayer.vue', () => {
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
    wrapper = mount(SmRangeThemeLayer, {
      propsData: {
        mapTarget: 'map',
        layerId: 'myRasterLayer',
        data: data,
        mapUrl: 'www.fakeurl.com/PopulationDistribution'
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('change props', async done => {
    let newData = [
      {
        geometry: {
          type: 'Point',
          coordinates: [122.36999999999999, 53.470000000000006]
        },
        properties: {
          SmID: '1',
          SmX: '1.3622166088372886E7',
          SmY: '7070412.841759119',
          SmLibTileID: '1'
        },
        type: 'Feature'
      }
    ];
    wrapper = mount(SmRangeThemeLayer, {
      propsData: {
        mapTarget: 'map',
        data: data
      }
    });
    await mapSubComponentLoaded(wrapper);
    const setDataSpy = jest.spyOn(wrapper.vm.viewModel, 'setData');
    const setLayerNameSpy = jest.spyOn(wrapper.vm.viewModel, 'setLayerName');
    const setOptionsSpy = jest.spyOn(wrapper.vm.viewModel, 'setOptions');
    await wrapper.setProps({
      layerName: 'myRangeThemeLayer',
      data: newData,
      options: {
        highlightStyle: {
          stroke: true,
          strokeWidth: 4,
          strokeColor: 'blue',
          fillColor: '#00EEEE',
          fillOpacity: 0.8
        }
      }
    });
    expect(setDataSpy).toBeCalled();
    expect(setLayerNameSpy).toBeCalled();
    expect(setOptionsSpy).toBeCalled();
    done();
  });
});
