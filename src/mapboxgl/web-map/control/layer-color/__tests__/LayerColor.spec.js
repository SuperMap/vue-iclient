import { mount } from '@vue/test-utils';
import SmWebMap from '../../../WebMap';
import SmLayerColor from '../index';
import mapEvent from '@types_mapboxgl/map-event';
import '@libs/mapboxgl/mapbox-gl-enhance';

describe('LayerColor.vue', () => {
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
    wrapper = mount(SmLayerColor, {
      propsData: {
        mapTarget: 'map',
        collapsed: false
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

  it('capture', done => {
    wrapper = mount(SmLayerColor, {
      propsData: {
        mapTarget: 'map',
        collapsed: false
      }
    });
    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        wrapper.find('.sm-components-icon-layer-picker').trigger('click');
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

  it('reset', done => {
    wrapper = mount(SmLayerColor, {
      propsData: {
        mapTarget: 'map',
        collapsed: false
      }
    });
    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        wrapper.find('.sm-component-btn-primary').trigger('click');
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
