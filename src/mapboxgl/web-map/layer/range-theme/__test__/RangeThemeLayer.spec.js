import { mount } from '@vue/test-utils';
import SmRangeThemeLayer from '../RangeThemeLayer.vue';
import SmWebMap from '../../../WebMap.vue';
import mapEvent from '@types_mapboxgl/map-event';
import '@libs/mapboxgl/mapbox-gl-enhance';

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
    wrapper = mount(SmRangeThemeLayer, {
      propsData: {
        mapTarget: 'map',
        layerId: 'myRasterLayer',
        data: data,
        mapUrl: 'www.fakeurl.com/PopulationDistribution'
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
    wrapper = mount(SmRangeThemeLayer, {
      propsData: {
        mapTarget: 'map',
        data: data
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          const setDataSpy = jest.spyOn(wrapper.vm.viewModel, 'setData');
          const setLayerNameSpy = jest.spyOn(wrapper.vm.viewModel, 'setLayerName');
          const setOptionsSpy = jest.spyOn(wrapper.vm.viewModel, 'setOptions');
          wrapper.setProps({
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
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });
});
