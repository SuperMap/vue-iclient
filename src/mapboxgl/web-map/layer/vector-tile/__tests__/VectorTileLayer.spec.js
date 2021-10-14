import {
  mount,
} from '@vue/test-utils';
import SmWebMap from '../../../WebMap.vue';
import SmVectorTileLayer from '../VectorTileLayer.vue';
import mapEvent from '@types_mapboxgl/map-event';
import '@libs/mapboxgl/mapbox-gl-enhance';
describe('VectorTileLayer.vue', () => {
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

  it('render', (done) => {
    wrapper = mount(SmVectorTileLayer, {
      propsData: {
        mapTarget: "map",
        styleOptions: 'https://fakeiportal.supermap.io/vectorstyles.json'
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          expect(wrapper.vm.mapTarget).toBe('map');
          done()
        } catch (exception) {
          console.log("案例失败：" + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });

  it('change styleOptions', (done) => {
    wrapper = mount(SmVectorTileLayer, {
      propsData: {
        mapTarget: "map",
        styleOptions: 'https://fakeiportal.supermap.io/vectorstyles.json'
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          const setStyleOptionsSpy = jest.spyOn(wrapper.vm.viewModel, 'setStyleOptions');
          wrapper.setProps({
            styleOptions: 'https://fakeiportal.supermap.io/newvectorstyles.json'
          })
          expect(setStyleOptionsSpy).toBeCalled();
          done()
        } catch (exception) {
          console.log("案例失败：" + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });
});