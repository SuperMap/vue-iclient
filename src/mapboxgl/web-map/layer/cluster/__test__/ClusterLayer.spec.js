import { mount } from '@vue/test-utils';
import SmClusterLayer from '../ClusterLayer.vue';
import SmWebMap from '../../../WebMap.vue';
import mapEvent from '@types_mapboxgl/map-event';
import '@libs/mapboxgl/mapbox-gl-enhance';
describe('ClusterLayer.vue', () => {
  let wrapper;
  let mapWrapper;
  let data = {
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
          SmUserID: '0',
          SmGeometrySize: '16',
          区站号: '50136',
          站台: '漠河',
          省份: '黑龙江',
          海拔: '296',
          平均最低气温: '-47',
          最热七天气温: '29',
          最高气温: '33',
          最低气温: '-53',
          年均降雨: '366.1',
          年均降雨_Num: '366.1',
          最低气温_Num: '-53.0',
          最高气温_Num: '33.0',
          最高七天气温_Num: '29.0',
          平均最低气温_Num: '-47.0',
          海波_Num: '296.0'
        },
        type: 'Feature'
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
    wrapper = mount(SmClusterLayer, {
      propsData: {
        mapTarget: 'map',
        data
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

  it('setData', () => {
    let newData = {
      type: 'FeatureCollection',
      features: [
        {
          geometry: {
            type: 'Point',
            coordinates: [122, 53]
          },
          properties: {
            SmID: '1'
          },
          type: 'Feature'
        }
      ]
    };
    wrapper = mount(SmClusterLayer, {
      propsData: {
        data: {}
      }
    });
    wrapper.vm.$on('load', e => {
      wrapper.setProps({
        data: newData
      });
      expect(wrapper.vm.viewModel.data).toBe(newData);
    });
  });
});
