import { mount } from '@vue/test-utils';
import SmWebMap from '../../../WebMap.vue';
import SmClusterLayer from '../ClusterLayer.vue';
import mapEvent from '@types_mapboxgl/map-event';
import '@libs/mapboxgl/mapbox-gl-enhance';
import CircleStyle from '../../../../_types/CircleStyle';
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

  it('render default correctly', (done) => {
    wrapper = mount(SmClusterLayer, {
      propsData: {
        mapTarget: 'map',
        data: data
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

  it('setData', (done) => {
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
    const clusteredPointStyle = new CircleStyle({
      'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 100, '#f1f075', 750, '#f28cb1'],
      'circle-radius': ['step', ['get', 'point_count'], 10, 80, 20, 600, 50]
    });
    
    const unclusteredPointStyle = new CircleStyle({
      'circle-color': '#11b4da',
      'circle-stroke-width': 1,
      'circle-stroke-color': '#fff'
    });
    wrapper = mount(SmClusterLayer, {
      propsData: {
        mapTarget: 'map',
        data
      }
    });
  
    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          const setDataSpy = jest.spyOn(wrapper.vm.viewModel, 'setData');
          wrapper.setProps({
            data: newData,
            clusteredPointStyle,
            unclusteredPointStyle
          });
          expect(wrapper.vm.viewModel.data).toBe(newData);
          expect(wrapper.vm.mapTarget).toBe('map');
          expect(setDataSpy).toBeCalled();
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
