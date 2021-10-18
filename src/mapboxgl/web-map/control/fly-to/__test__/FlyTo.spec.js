import { mount } from '@vue/test-utils';
import SmFlyTo from '../FlyTo.vue';
import SmWebMap from '../../../WebMap.vue';
import mapEvent from '@types_mapboxgl/map-event';
import '@libs/mapboxgl/mapbox-gl-enhance';

describe('FlyTo.vue', () => {
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
    wrapper = mount(SmFlyTo, {
      propsData: {
        data: [
          [103.93303602365336, 33.04646925591396],
          [103.90771770744831, 33.163703206300525],
          [103.93169934861643, 33.25624201104978]
        ],
        flyOptions: {
          duration: 1500,
          zoom: 15,
          pitch: 60
        },
        mapTarget: 'map'
      }
    });
    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
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

  it('no data', done => {
    wrapper = mount(SmFlyTo, {
      propsData: {
        flyOptions: {
          duration: 1500,
          zoom: 15,
          pitch: 60
        },
        mapTarget: 'map'
      }
    });
    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          expect(wrapper.vm.data).toBe(undefined);
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
    const newData = [[103.93303602365336, 33.04646925591396]];
    wrapper = mount(SmFlyTo, {
      propsData: {
        data: [
          [103.93303602365336, 33.04646925591396],
          [103.90771770744831, 33.163703206300525]
        ],
        mapTarget: 'map'
      }
    });
    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          wrapper.setProps({
            data: newData
          });
          expect(wrapper.vm.data).toBe(newData);
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
