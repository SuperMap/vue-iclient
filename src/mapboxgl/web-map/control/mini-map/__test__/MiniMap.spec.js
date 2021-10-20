import {
  mount
} from '@vue/test-utils';
import SmWebMap from '../../../WebMap.vue';
import SmMiniMap from '../MiniMap.vue';
import mapEvent from '@types_mapboxgl/map-event';

describe('MiniMap.vue', () => {
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
    })
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

  it('render default correctly', (done) => {
    wrapper = mount(SmMiniMap, {
      propsData: {
        mapTarget: 'map'
      }
    });
    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          expect(wrapper.vm.mapTarget).toBe('map');
          setTimeout(() => {
            done()
          }, 1000);
        } catch (exception) {
          console.log("案例失败：" + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  })
})