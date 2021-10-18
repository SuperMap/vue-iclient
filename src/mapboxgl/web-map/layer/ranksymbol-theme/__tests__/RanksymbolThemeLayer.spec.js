import { mount } from '@vue/test-utils';
import SmWebMap from '../../../WebMap.vue';
import SmRanksymbolThemeLayer from '../RanksymbolThemeLayer.vue';
import mapEvent from '@types_mapboxgl/map-event';
import '@libs/mapboxgl/mapbox-gl-enhance';
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
  beforeEach(() => {
    mapEvent.firstMapTarget = null;
    mapEvent.$options.mapCache = {};
    mapEvent.$options.webMapCache = {};
    mapWrapper = mount(SmWebMap, {
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
      }
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    if (wrapper) {
      wrapper.destroy();
    }
    if (mapWrapper) {
      mapWrapper.destroy();
    }
  });

  it('render', done => {
    wrapper = mount(SmRanksymbolThemeLayer, {
      propsData: {
        mapTarget: 'map',
        themeOptions,
        data,
        symbolType: 'Circle'
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          // const setStyleOptionsSpy = jest.spyOn(wrapper.vm.viewModel, 'setStyleOptions');
          expect(wrapper.vm.mapTarget).toBe('map');
          done();
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });

  it('change props', done => {
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

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          const setDataSpy = jest.spyOn(wrapper.vm.viewModel, 'setData');
          const setOptionsSpy = jest.spyOn(wrapper.vm.viewModel, 'setOptions');
          const setLayerNameSpy = jest.spyOn(wrapper.vm.viewModel, 'setLayerName');
          wrapper.setProps({
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
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });
});
