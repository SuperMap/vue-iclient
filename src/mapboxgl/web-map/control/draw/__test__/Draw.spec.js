import { mount, config } from '@vue/test-utils';
import SmWebMap from '../../../WebMap.vue';
import SmDraw from '../Draw.vue';
import mapEvent from '@types_mapboxgl/map-event';
import drawEvent from '@types_mapboxgl/draw-event';
import '@libs/mapboxgl/mapbox-gl-enhance';

config.stubs.transition = false;
jest.mock('@libs/mapbox-gl-draw/mapbox-gl-draw', () => require('@mocks/mapboxgl_draw').MapboxDraw);
describe('Draw.vue', () => {
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

  it('render default correctly', done => {
    wrapper = mount(
      SmDraw,
      {
        propsData: {
          mapTarget: 'map'
        },
        sync: false
      },
    );
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
});
