import { mount } from '@vue/test-utils';
import SmLayerManager from '../LayerManager.vue';
import SmWebMap from '../../../WebMap.vue';
import mapEvent from '@types_mapboxgl/map-event';
import '@libs/mapboxgl/mapbox-gl-enhance';

const features = [
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
describe('LayerManager.vue', () => {
  let wrapper;
  let mapWrapper;
  beforeEach(() => {
    mapEvent.firstMapTarget = null;
    mapEvent.$options.mapCache = {};
    mapEvent.$options.webMapCache = {};
    mapWrapper = mount(SmWebMap, {
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '1329428269'
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
    wrapper = mount(SmLayerManager, {
      propsData: {
        defaultExpandAll: true,
        mapTarget: 'map',
        layers: [
          {
            mapInfo: { serverUrl: 'https://fakeiportal.supermap.io/iportal', mapId: '801571284' },
            title: '民航数据-单值'
          }
        ]
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

  it('select layer', done => {
    wrapper = mount(SmLayerManager, {
      propsData: {
        defaultExpandAll: true,
        mapTarget: 'map',
        layers: [
          {
            mapInfo: { serverUrl: 'https://fakeiportal.supermap.io/iportal', mapId: '801571284' },
            title: '民航数据-单值'
          }
        ]
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          // const setStyleOptionsSpy = jest.spyOn(wrapper.vm.viewModel, 'setStyleOptions');
          const treeItem = wrapper.find('.sm-component-tree-treenode-switcher-open');
          expect(treeItem.exists()).toBe(true);
          treeItem.trigger('click');
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
