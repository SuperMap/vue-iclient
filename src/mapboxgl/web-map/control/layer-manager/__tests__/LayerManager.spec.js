import { mount } from '@vue/test-utils';
import SmLayerManager from '../LayerManager.vue';
import SmWebMap from '../../../WebMap.vue';
import iportal_serviceProxy from 'vue-iclient/test/unit/mocks/data/iportal_serviceProxy';
import uniqueLayer_point from 'vue-iclient/test/unit/mocks/data/WebMap/uniqueLayer_point';
import layerData from 'vue-iclient/test/unit/mocks/data/layerData';
import mockFetch from 'vue-iclient/test/unit/mocks/FetchRequest';
import flushPromises from 'flush-promises';
import mapWrapperLoaded from 'vue-iclient/test/unit/mapWrapperLoaded.js';

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
    const fetchresource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_point,
      'https://fakeiportal.supermap.io/iportal/web/datas/676516522/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123': layerData
    };
    mockFetch(fetchresource);
    mapWrapper = mount(SmWebMap, {
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
      }
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (wrapper) {
      wrapper.destroy();
    }
    if (mapWrapper) {
      mapWrapper.destroy();
    }
  });

  it('render', async done => {
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
    const callback = jest.fn();
    wrapper.vm.$on('loaded', callback);
    await mapWrapperLoaded(mapWrapper);
    await flushPromises();
    expect(callback.mock.called).toBeTruthy;
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('select layer', async done => {
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
    const callback = jest.fn();
    wrapper.vm.$on('loaded', callback);
    await mapWrapperLoaded(mapWrapper);
    await flushPromises();
    expect(callback.mock.called).toBeTruthy;
    const treeItem = wrapper.find('.sm-component-tree-checkbox');
    expect(treeItem.exists()).toBe(true);
    treeItem.trigger('click');
    wrapper.vm.$nextTick();
    treeItem.trigger('click');
    done();
  });

  it('change layers', async done => {
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
    const callback = jest.fn();
    wrapper.vm.$on('loaded', callback);
    await mapWrapperLoaded(mapWrapper);
    await flushPromises();
    expect(callback.mock.called).toBeTruthy;
    wrapper.setProps({
      layers: newLayers
    });
    expect(wrapper.vm.layers.length).toBe(2);
    done();
  });
});
