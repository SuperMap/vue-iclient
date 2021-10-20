import { mount } from '@vue/test-utils';
import SmLayerManager from '../LayerManager.vue';
import SmWebMap from '../../../WebMap.vue';
import mapEvent from '@types_mapboxgl/map-event';
import '@libs/mapboxgl/mapbox-gl-enhance';

const layers = [
  {
    mapInfo: { serverUrl: 'https://fakeiportal.supermap.io/iportal', mapId: '801571284' },
    title: '民航数据-单值'
  },
  {
    mapInfo: { serverUrl: 'https://fakeiserver.supermap.io/iserver' },
    title: '机场数据'
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
        collapse: false,
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
          const treeItem = wrapper.find('.sm-component-tree-checkbox');
          expect(treeItem.exists()).toBe(true);
          treeItem.trigger('click');
          wrapper.vm.$nextTick();
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

  it('change layers', done => {
    const newLayers = [
      {
        mapInfo: { serverUrl: 'https://fakeiportal.supermap.io/iportal222', mapId: '801571284' },
        title: '民航数据-单值'
      },
      {
        mapInfo: { serverUrl: 'https://fakeiportal.supermap.io/iportal1111', mapId: '6666666666' },
        title: '民航数据'
      }
    ];
    wrapper = mount(SmLayerManager, {
      propsData: {
        defaultExpandAll: true,
        collapse: false,
        mapTarget: 'map',
        layers
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          wrapper.setProps({
            layers: newLayers
          });
          expect(wrapper.vm.layers.length).toBe(2);
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
