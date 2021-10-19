import { mount } from '@vue/test-utils';
import SmMapvLayer from '../MapvLayer.vue';
import SmWebMap from '../../../WebMap.vue';
import mapEvent from '@types_mapboxgl/map-event';
import '@libs/mapboxgl/mapbox-gl-enhance';
describe('MapvLayer.vue', () => {
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
    wrapper = mount(SmMapvLayer, {
      propsData: {
        mapTarget: 'map'
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
    const newData = {
      type: 'FeatureCollection',
      features: [
        {
          geometry: {
            type: 'Point',
            coordinates: [122.36999999999999, 53.470000000000006]
          },
          properties: {
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
    const newOptions = {
      fillStyle: 'rgba(255, 250, 250, 0.2)',
      coordType: 'bd09mc',
      globalCompositeOperation: 'lighter',
    }
    wrapper = mount(SmMapvLayer, {
      propsData: {
        mapTarget: 'map',
        data: {
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
                SmUserID: '0'
              },
              type: 'Feature'
            }
          ]
        },
        options: {
          fillStyle: 'rgba(255, 250, 250, 0.2)',
          coordType: 'bd09mc',
          globalCompositeOperation: 'lighter',
          size: 1.5,
          animation: {
            stepsRange: {
              start: 0,
              end: 100
            },
            trails: 3,
            duration: 5
          }
        }
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          wrapper.setProps({
            layerId: 'newLayerId',
            data: newData,
            options: newOptions
          });
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
});
