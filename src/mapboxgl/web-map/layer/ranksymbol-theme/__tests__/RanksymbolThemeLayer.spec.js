import { mount, config } from '@vue/test-utils';
import SmRanksymbolThemeLayer from '../RanksymbolThemeLayer.vue';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap.js';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded.js';

describe('SmRanksymbolThemeLayer.vue', () => {
  let wrapper;
  let mapWrapper;
  const data = [
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
  ];
  const themeOptions = {
    attributions: '',
    themeField: 'CON2009',
    symbolSetting: {
      circleStyle: { fillOpacity: 0.8 },
      fillColor: '#FFA500',
      circleHoverStyle: { fillOpacity: 1 }
    }
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

  it('render', async done => {
    wrapper = mount(SmRanksymbolThemeLayer, {
      propsData: {
        mapTarget: 'map',
        themeOptions,
        data,
        symbolType: 'Circle'
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
    wrapper = mount(SmRanksymbolThemeLayer, {
      propsData: {
        mapTarget: 'map',
        options: themeOptions,
        data,
        symbolType: 'Circle'
      }
    });
    await mapSubComponentLoaded(wrapper);
    const setDataSpy = jest.spyOn(wrapper.vm.viewModel, 'setData');
    const setOptionsSpy = jest.spyOn(wrapper.vm.viewModel, 'setOptions');
    const setLayerNameSpy = jest.spyOn(wrapper.vm.viewModel, 'setLayerName');
    await wrapper.setProps({
      layerName: 'newName',
      data: newData,
      options: {
        themeField: 'CON2009',
        symbolSetting: {
          circleStyle: { fillOpacity: 1 },
          fillColor: '#FFA500',
          circleHoverStyle: { fillOpacity: 0.5 }
        }
      }
    });
    expect(wrapper.vm.mapTarget).toBe('map');
    expect(setDataSpy).toBeCalled();
    expect(setOptionsSpy).toBeCalled();
    expect(setLayerNameSpy).toBeCalled();
    done();
  });
});
