import { mount } from '@vue/test-utils';
import SmUniqueThemeLayer from '../UniqueThemeLayer.vue';
import SmWebMap from '../../../WebMap.vue';
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
  let options = {
    style: {
      shadowBlur: 3,
      shadowColor: '#000000',
      shadowOffsetX: 1,
      shadowOffsetY: 1,
      fillColor: '#FFFFFF'
    },
    isHoverAble: true,
    highlightStyle: {
      stroke: true,
      strokeWidth: 2,
      strokeColor: 'blue',
      fillColor: '#00F5FF',
      fillOpacity: 0.2
    },
    themeField: 'LANDTYPE',
    styleGroups: [
      {
        value: '草地',
        style: {
          fillColor: '#C1FFC1'
        }
      },
      {
        value: '城市',
        style: {
          fillColor: '#CD7054'
        }
      },
      {
        value: '灌丛',
        style: {
          fillColor: '#7CCD7C'
        }
      },
      {
        value: '旱地',
        style: {
          fillColor: '#EE9A49'
        }
      },
      {
        value: '湖泊水库',
        style: {
          fillColor: '#8EE5EE'
        }
      },
      {
        value: '经济林',
        style: {
          fillColor: '#548B54'
        }
      },
      {
        value: '沙漠',
        style: {
          fillColor: '#DEB887'
        }
      },
      {
        value: '水浇地',
        style: {
          fillColor: '#E0FFFF'
        }
      },
      {
        value: '水田',
        style: {
          fillColor: '#388E8E'
        }
      },
      {
        value: '用材林',
        style: {
          fillColor: '#556B2F'
        }
      },
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

  it('render default correctly', () => {
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
});
