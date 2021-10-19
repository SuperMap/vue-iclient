import { mount } from '@vue/test-utils';
import SmLabelThemeLayer from '../LabelThemeLayer.vue';
import SmWebMap from '../../../WebMap.vue';
import mapEvent from '@types_mapboxgl/map-event';
import '@libs/mapboxgl/mapbox-gl-enhance';
describe('LabelThemeLayer.vue', () => {
  let wrapper;
  let mapWrapper;
  const features = [
    {
      geometry: {
        type: 'Point',
        coordinates: [122.36999999999999, 53.470000000000006]
      },
      properties: {
        最高七天气温_Num: '29.0',
        平均最低气温_Num: '-47.0',
        海波_Num: '296.0'
      },
      type: 'Feature'
    }
  ];
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
    wrapper = mount(SmLabelThemeLayer, {
      propsData: {
        mapTarget: 'map',
        data: features,
        layerName: 'LabelThemeLayer'
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
    const newData = {
      type: 'FeatureCollection',
      features: [
        {
          geometry: {
            type: 'Point',
            coordinates: [122, 53]
          },
          properties: {
            省份: '黑龙江',
            海拔: '296'
          },
          type: 'Feature'
        }
      ]
    };
    wrapper = mount(SmLabelThemeLayer, {
      propsData: {
        mapTarget: "map",
        data: features,
        layerName: 'LabelThemeLayer'
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          wrapper.setProps({
            data: newData,
            options: {
              id: 'newId'
            },
            layerName: 'newName'
          })
          expect(wrapper.vm.data).toBe(newData);
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
