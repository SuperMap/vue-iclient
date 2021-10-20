import { mount, config } from '@vue/test-utils';
import SmWebMap from '../../../WebMap.vue';
import SmDraw from '../Draw.vue';
import mapEvent from '@types_mapboxgl/map-event';
import drawEvent from '@types_mapboxgl/draw-event';
import '@libs/mapboxgl/mapbox-gl-enhance';
import LineStyle from '../../../../_types/LineStyle';
import CircleStyle from '../../../../_types/CircleStyle';
import FillStyle from '../../../../_types/FillStyle';

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
    wrapper = mount(SmDraw, {
      propsData: {
        mapTarget: 'map'
      },
      sync: false
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

  it('start draw', done => {
    wrapper = mount(SmDraw, {
      propsData: {
        mapTarget: 'map',
        collapsed: false
      },
      sync: false
    });
    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          const drawItem = wrapper.find('.sm-component-draw__draw-item');
          expect(drawItem.exists()).toBe(true);
          expect(wrapper.vm.mapTarget).toBe('map');
          drawItem.trigger('click');
          setTimeout(() => {
            done();
          }, 500);
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });

  it('change layerStyle', done => {
    const newLayerStyle = {
      circle: new CircleStyle({
        'circle-radius': 6,
        'circle-color': '#3fb1e3',
        'circle-opacity': 1
      }),
      line: new LineStyle({
        'line-opacity': 1,
        'line-color': '#3fb1e3'
      }),
      fill: new FillStyle({
        'fill-opacity': 0.8,
        'fill-color': '#3fb1e3',
        'fill-translate': [0, 0]
      })
    };
    wrapper = mount(SmDraw, {
      propsData: {
        mapTarget: 'map',
        collapsed: false
      },
      sync: false
    });
    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          wrapper.setProps({
            layerStyle: newLayerStyle
          });
          setTimeout(() => {
            done();
          }, 500);
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });
});
