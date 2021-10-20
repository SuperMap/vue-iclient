import { mount } from '@vue/test-utils';
import SmWebMap from '../../../WebMap.vue';
import SmUniqueThemeLayer from '../UniqueThemeLayer.vue';
import mapEvent from '@types_mapboxgl/map-event';
import '@libs/mapboxgl/mapbox-gl-enhance';
describe('UniqueThemeLayer.vue', () => {
  let wrapper;
  let mapWrapper;
  let data = [
    {
      geometry: {
        type: 'Point',
        coordinates: [122.36999999999999, 53.470000000000006]
      },
      properties: {
        站台: '漠河',
        省份: '黑龙江',
        海拔: '296'
      },
      type: 'Feature'
    }
  ];
  let options = {
    themeField: 'LANDTYPE',
    styleGroups: [
      {
        value: '沼泽',
        style: {
          fillColor: '#2F4F4F'
        }
      },
      {
        value: '缺省风格',
        style: {
          fillColor: '#ABABAB'
        }
      }
    ]
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

  it('render default correctly', (done) => {
    wrapper = mount(SmUniqueThemeLayer, {
      propsData: {
        mapTarget: 'map',
        options: options,
        data: data
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

  it('change props', (done) => {
    let newData = [
      {
        geometry: {
          type: 'Point',
          coordinates: [122.36999999999999, 53.470000000000006]
        },
        properties: {
          海拔: '296'
        },
        type: 'Feature'
      }
    ];
    let newOptions = {
      themeField: 'LANDTYPE',
      styleGroups: [
        {
          value: '缺省风格',
          style: {
            fillColor: '#ABABAB'
          }
        }
      ]
    };
    wrapper = mount(SmUniqueThemeLayer, {
      propsData: {
        mapTarget: 'map',
        options: options,
        data: data
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          wrapper.setProps({
            data: newData,
            options: newOptions
          });
          expect(wrapper.vm.options.styleGroups.length).toBe(1);
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
