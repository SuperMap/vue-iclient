import { mount } from '@vue/test-utils';
import SmWebMap from '../../../WebMap';
import SmLayerList from '../LayerList.vue';
import LayerGroup from '../../../LayerGroup.vue';
import LayerList from '../index';
import mockFetch from 'vue-iclient/test/unit/mocks/FetchRequest';
import iportal_serviceProxy from 'vue-iclient/test/unit/mocks/data/iportal_serviceProxy';
import uniqueLayer_point from 'vue-iclient/test/unit/mocks/data/WebMap/uniqueLayer_point';
import layerData from 'vue-iclient/test/unit/mocks/data/layerData';
import webmap3Datas from 'vue-iclient/test/unit/mocks/data/WebMap/webmap3.json';
import flushPromises from 'flush-promises';

describe('LayerList.vue', () => {
  let wrapper;
  let mapWrapper;

  beforeEach(() => {
    wrapper = null;
    mapWrapper = null;
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

  it('render index correctly', () => {
    wrapper = mount(LayerList);
    expect(wrapper.find('div.sm-component-layer-list').exists()).toBe(true);
  });

  it('layerGroupVisibility tile', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_point,
      'https://fakeiportal.supermap.io/iportal/web/datas/676516522/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123':
        layerData
    };
    mockFetch(fetchResource);
    mapWrapper = mount(SmWebMap, {
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123_layerlist'
      }
    });
    const addCallback = function (data) {
      wrapper = mount(SmLayerList, {
        propsData: {
          mapTarget: 'map'
        }
      });
      const callback = jest.fn();
      wrapper.vm.$on('loaded', callback);
      expect(callback.mock.called).toBeTruthy;
      let spylayerVisibility = jest.spyOn(wrapper.vm, 'toggleItemVisibility');
      wrapper.vm.$nextTick(() => {
        expect(wrapper.find('.header-text').exists()).toBe(true);
        wrapper.find('.header-text .sm-components-icon-visible').trigger('click');
        expect(spylayerVisibility).toHaveBeenCalledTimes(1);
        done();
      });
    };
    mapWrapper.vm.viewModel.on({ addlayerssucceeded: addCallback });
  });

  it('layerGroupVisibility vector-tile', async done => {
    const mapOptions = {
      container: 'map',
      style: {
        version: 8,
        sources: {
          'vector-tiles': {
            type: 'vector',
            tiles: [
              'https://fakeiserver.supermap.io//iserver/services/map-beijing/rest/maps/beijingMap/tileFeature.mvt?returnAttributes=true&compressTolerance=-1&width=512&height=512&viewBounds={bbox-epsg-3857}&expands=0:0_2,132_128,138_64,141_32,143_16,145_8,147_4'
            ]
          }
        },
        layers: [
          {
            id: '三级道路L@北京',
            type: 'line',
            source: 'vector-tiles',
            'source-layer': '三级道路L@北京',
            paint: {
              'line-width': {
                base: 1.5,
                stops: [
                  [11, 1],
                  [18, 10]
                ]
              },
              'line-color': 'hsl(0, 0%, 100%)'
            }
          },
          {
            id: '二级道路L@北京',
            type: 'line',
            source: 'vector-tiles',
            'source-layer': '二级道路L@北京',
            paint: {
              'line-width': 4,
              'line-color': 'hsl(230, 24%, 87%)'
            }
          },
          {
            id: '二级道路L@北京1',
            type: 'line',
            source: 'vector-tiles',
            'source-layer': '二级道路L@北京',
            paint: {
              'line-width': 4,
              'line- color': 'hsl(230, 24%, 87%)'
            }
          }
        ]
      }
    };
    mapWrapper = mount(SmWebMap, {
      propsData: {
        style: '{height:"700px"}',
        mapOptions: mapOptions
      }
    });

    const addCallback = function (data) {
      wrapper = mount(SmLayerList, {
        propsData: {
          mapTarget: 'map'
        }
      });
      let spyProperty = jest.spyOn(wrapper.vm.viewModel, 'changeItemVisible');
      const callback = jest.fn();
      wrapper.vm.$on('loaded', callback);
      expect(callback.mock.called).toBeTruthy;
      expect(wrapper.vm.mapTarget).toBe('map');
      wrapper.vm.$nextTick(() => {
        const item = {
          id: 'test',
          visible: true,
          type: 'group',
          children: [
            {
              id: 'test1',
              visible: true,
              type: 'vector',
              renderLayers: ['test1']
            }
          ]
        };
        wrapper.vm.toggleItemVisibility(item, false);
        expect(spyProperty).toHaveBeenCalledTimes(1);
        done();
      });
    };
    mapWrapper.vm.viewModel.on({ addlayerssucceeded: addCallback });
  });

  it('attributes style', () => {
    wrapper = mount(LayerList, {
      propsData: {
        attributes: {
          position: 'top-right',
          style: {
            width: '500px'
          }
        }
      }
    });
    wrapper.vm.displayAttributes = false;
    wrapper.setProps({
      attributes: {
        position: 'left',
        title: '地震数据',
        style: {
          width: '0px'
        }
      }
    });
    expect(wrapper.find('div.sm-component-layer-list').exists()).toBe(true);
    expect(wrapper.vm.attributes.position).toBe('left');
  });

  it('render v3 layers', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': webmap3Datas[0],
      'https://fakeiportal.supermap.io/iportal/web/maps/123': webmap3Datas[1],
      'https://fakeiportal.supermap.io/iportal/web/datas/676516522/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123':
        layerData
    };
    mockFetch(fetchResource);
    mapWrapper = mount(SmWebMap, {
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123_v3'
      }
    });
    const addCallback = async data => {
      wrapper = mount(SmLayerList, {
        propsData: {
          mapTarget: 'map'
        }
      });
      const callback = jest.fn();
      wrapper.vm.$on('loaded', callback);
      expect(callback.mock.called).toBeTruthy;
      let spylayerVisibility = jest.spyOn(wrapper.vm, 'toggleItemVisibility');
      await wrapper.vm.$nextTick();
      wrapper.find('.header-text .sm-components-icon-visible').trigger('click');
      expect(spylayerVisibility).toHaveBeenCalledTimes(1);
      done();
    };
    mapWrapper.vm.viewModel.on({ addlayerssucceeded: addCallback });
    await flushPromises();
  });

  it('render setmap', async done => {
    wrapper = mount(SmLayerList);
    const layerCatalogs = [
      {
        children: [
          {
            dataSource: {
              serverId: '',
              type: ''
            },
            id: 'xingkaihu_C@China',
            title: 'Xingkaihu_C_txt@China_L10-L10',
            type: 'symbol',
            visible: true,
            renderSource: {
              id: 'ms_China_4610_1715416497380_2',
              type: 'vector',
              sourceLayer: 'Xingkaihu_C_txt@China'
            },
            renderLayers: ['xingkaihu_C@China'],
            themeSetting: {},
            CLASS_INSTANCE: {}
          },
          {
            dataSource: {
              serverId: '',
              type: ''
            },
            id: 'xingkaihu_B@China',
            title: 'Xingkaihu_B_txt@China_L10-L10',
            type: 'symbol',
            visible: true,
            renderSource: {
              id: 'ms_China_4610_1715416497380_3',
              type: 'vector',
              sourceLayer: 'Xingkaihu_B_txt@China'
            },
            renderLayers: ['xingkaihu_B@China'],
            themeSetting: {}
          }
        ],
        id: 'ms_group_1715581133212_2',
        title: '未命名分组',
        type: 'group',
        visible: true
      },
      {
        dataSource: {
          serverId: '',
          type: ''
        },
        id: 'ms-background',
        title: 'ms-background',
        type: 'background',
        visible: true,
        renderSource: {},
        renderLayers: ['ms-background'],
        themeSetting: {}
      }
    ];
    let mockOnOptions;
    const webmap = {
      getLayerList: () => layerCatalogs,
      un: jest.fn(),
      on: jest.fn(options => {
        mockOnOptions = options;
      })
    };
    const callback = function () {
      expect(wrapper.find('.header-text  .sm-components-icon-hidden').exists()).toBeTruthy();
      done();
    };
    wrapper.vm.viewModel.on('layersUpdated', callback);
    wrapper.vm.viewModel.setMap({
      webmap
    });
    wrapper.vm.$options.loaded.call(wrapper.vm);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.sourceList).toEqual(wrapper.vm.transformLayerList(layerCatalogs));
    expect(wrapper.find('.header-text  .sm-components-icon-visible').exists()).toBeTruthy();
    wrapper.vm.sourceList[1].visible = false;
    mockOnOptions.layerupdatechanged();
  });

  it('onDrop', async done => {
    wrapper = mount(SmLayerList);
    const layerCatalogs = [
      {
        dataSource: {
          serverId: '',
          type: ''
        },
        id: 'ms-fill',
        title: 'ms-fill',
        type: 'fill',
        visible: true,
        renderSource: {},
        renderLayers: ['ms-fill'],
        themeSetting: {}
      },
      {
        dataSource: {
          serverId: '',
          type: ''
        },
        id: 'ms-background',
        title: 'ms-background',
        type: 'background',
        visible: true,
        renderSource: {},
        renderLayers: ['ms-background'],
        themeSetting: {}
      },
      {
        children: [],
        id: 'ms-group',
        title: '未命名分组',
        type: 'group',
        visible: true
      },
    ];
    let mockOnOptions;
    const webmap = {
      getLayerList: () => layerCatalogs,
      getAppreciableLayers: () => layerCatalogs,
      rectifyLayersOrder: jest.fn(),
      un: jest.fn(),
      on: jest.fn(options => {
        mockOnOptions = options;
      })
    };
    wrapper.vm.viewModel.setMap({
      webmap
    });
    wrapper.vm.$options.loaded.call(wrapper.vm);
    await wrapper.vm.$nextTick();
    const dropToBottom = {
      node: {
        eventKey: 'ms-background',
        pos: '0-1'
      },
      dragNode: {
        eventKey: 'ms-fill'
      },
      dragNodesKeys: ['ms-fill'],
      dropToGap: true,
      dropPosition: 2
    };
    const dropIntoLayer = {
      node: {
        eventKey: 'ms-background',
        pos: '0-0'
      },
      dragNode: {
        eventKey: 'ms-fill'
      },
      dragNodesKeys: ['ms-fill'],
      dropToGap: false,
      dropPosition: 0
    };
    const dropIntoGroup = {
      node: {
        eventKey: 'ms-group',
        pos: '0-3'
      },
      dragNode: {
        eventKey: 'ms-fill'
      },
      dragNodesKeys: ['ms-fill'],
      dropToGap: false,
      dropPosition: 0
    };
    const layerGroupVm = wrapper.find(LayerGroup).vm;
    expect(layerGroupVm.treeData.length).toBe(3);
    expect(layerGroupVm.treeData[0].key).toBe('ms-fill');
    wrapper.vm.onDropHanlder(dropToBottom);
    expect(layerGroupVm.treeData[0].key).toBe('ms-background');
    wrapper.vm.onDropHanlder(dropIntoLayer);
    expect(layerGroupVm.treeData.length).toBe(3);
    wrapper.vm.onDropHanlder(dropIntoGroup);
    expect(layerGroupVm.treeData.length).toBe(2);
    done();
  });

  it('icons hover', async done => {
    wrapper = mount(SmLayerList, {
      propsData: {
        attributes: {
          position: 'top-right',
          style: {
            width: '500px'
          }
        },
        operations: {
          fitBounds: true,
          draggable: false,
          opacity: true
        }
      }
    });
    const layerCatalogs = [
      {
        children: [
          {
            dataSource: {
              serverId: '',
              type: ''
            },
            id: 'xingkaihu_C@China',
            title: 'Xingkaihu_C_txt@China_L10-L10',
            type: 'symbol',
            visible: true,
            renderSource: {
              id: 'ms_China_4610_1715416497380_2',
              type: 'vector',
              sourceLayer: 'Xingkaihu_C_txt@China'
            },
            renderLayers: ['xingkaihu_C@China'],
            themeSetting: {},
            CLASS_INSTANCE: {},
            layerOrder: 'auto'
          },
          {
            dataSource: {
              serverId: '',
              type: ''
            },
            id: 'xingkaihu_B@China',
            title: 'Xingkaihu_B_txt@China_L10-L10',
            type: 'symbol',
            visible: true,
            renderSource: {
              id: 'ms_China_4610_1715416497380_3',
              type: 'vector',
              sourceLayer: 'Xingkaihu_B_txt@China'
            },
            renderLayers: ['xingkaihu_B@China'],
            themeSetting: {},
            layerOrder: 'auto'
          }
        ],
        id: 'ms_group_1715581133212_2',
        title: '未命名分组',
        type: 'group',
        visible: true,
        layerOrder: 'auto'
      },
      {
        dataSource: {
          serverId: '',
          type: ''
        },
        id: 'ms-background',
        title: 'ms-background',
        type: 'background',
        visible: true,
        renderSource: {},
        renderLayers: ['ms-background'],
        themeSetting: {},
        layerOrder: 'auto'
      }
    ];
    let mockOnOptions;
    const webmap = {
      getLayerList: () => layerCatalogs,
      un: jest.fn(),
      on: jest.fn(options => {
        mockOnOptions = options;
      })
    };
    const callback = function () {
      expect(wrapper.find('.header-text  .sm-components-icon-hidden').exists()).toBeTruthy();
      expect(wrapper.find('.header-text  .sm-components-icon-hidden.highlight-icon').exists()).toBeFalsy();
      done();
    };
    wrapper.vm.viewModel.on('layersUpdated', callback);
    wrapper.vm.viewModel.setMap({
      webmap
    });
    wrapper.vm.$options.loaded.call(wrapper.vm);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.sourceList).toEqual(wrapper.vm.transformLayerList(layerCatalogs));
    console.log(wrapper.html());
    expect(wrapper.find('.header-text  .sm-components-icon-visible').exists()).toBeTruthy();
    expect(wrapper.find('.header-text  .sm-components-icon-visible.highlight-icon').exists()).toBeTruthy();
    wrapper.vm.sourceList[1].visible = false;
    mockOnOptions.layerupdatechanged();
  });

  it('treenode textcolor changed', async (done) => {
    wrapper = mount(SmLayerList, {
      propsData: {
        textColor: 'red'
      }
    });
    const layerCatalogs = [
      {
        children: [
          {
            dataSource: {
              serverId: '',
              type: ''
            },
            id: 'xingkaihu_C@China',
            title: 'Xingkaihu_C_txt@China_L10-L10',
            type: 'symbol',
            visible: true,
            renderSource: {
              id: 'ms_China_4610_1715416497380_2',
              type: 'vector',
              sourceLayer: 'Xingkaihu_C_txt@China'
            },
            renderLayers: ['xingkaihu_C@China'],
            themeSetting: {},
            CLASS_INSTANCE: {}
          },
          {
            dataSource: {
              serverId: '',
              type: ''
            },
            id: 'xingkaihu_B@China',
            title: 'Xingkaihu_B_txt@China_L10-L10',
            type: 'symbol',
            visible: true,
            renderSource: {
              id: 'ms_China_4610_1715416497380_3',
              type: 'vector',
              sourceLayer: 'Xingkaihu_B_txt@China'
            },
            renderLayers: ['xingkaihu_B@China'],
            themeSetting: {}
          }
        ],
        id: 'ms_group_1715581133212_2',
        title: '未命名分组',
        type: 'group',
        visible: true
      },
      {
        dataSource: {
          serverId: '',
          type: ''
        },
        id: 'ms-background',
        title: 'ms-background',
        type: 'background',
        visible: true,
        renderSource: {},
        renderLayers: ['ms-background'],
        themeSetting: {}
      }
    ];
    let mockOnOptions;
    const webmap = {
      getLayerList: () => layerCatalogs,
      un: jest.fn(),
      on: jest.fn(options => {
        mockOnOptions = options;
      })
    };
    const callback = function () {
      expect(wrapper.find('.header-text  .sm-components-icon-hidden').exists()).toBeTruthy();
      done();
    };
    wrapper.vm.viewModel.on('layersUpdated', callback);
    wrapper.vm.viewModel.setMap({
      webmap
    });
    wrapper.vm.$options.loaded.call(wrapper.vm);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.sourceList).toEqual(wrapper.vm.transformLayerList(layerCatalogs));
    expect(wrapper.find('.header-text  .sm-components-icon-visible').exists()).toBeTruthy();
    expect(wrapper.find('.header-text  .sm-components-icon-visible.highlight-icon').exists()).toBeTruthy();
    wrapper.vm.sourceList[1].visible = false;
    mockOnOptions.layerupdatechanged();
    let iconNodes = wrapper.findAll('.sm-components-icon-right');
    let iconHtml = '<i class="sm-components-icon-right sm-component-tree-switcher-icon" style="color: rgba(255, 0, 0, 0.69);"></i>';
    expect(iconNodes.at(0).html()).toBe(iconHtml);
    iconNodes.at(0).trigger('click');
    await wrapper.vm.$nextTick();
    let rootTitleNodes = wrapper.findAll('.header-text .add-ellipsis');
    console.log('rootTitleNodes,', rootTitleNodes.length);
    expect(rootTitleNodes.at(0).html()).toBe(`<span class="add-ellipsis" style="color: rgb(255, 0, 0);">未命名分组</span>`);
    wrapper.setProps({ textColor: 'blue' });
    iconNodes = wrapper.findAll('.sm-components-icon-right');
    iconHtml = '<i class="sm-components-icon-right sm-component-tree-switcher-icon" style="color: rgba(0, 0, 255, 0.69);"></i>';
    expect(iconNodes.at(0).html()).toBe(iconHtml);
    rootTitleNodes = wrapper.findAll('.header-text .add-ellipsis');
    expect(rootTitleNodes.at(0).html()).toBe(`<span class="add-ellipsis" style="color: rgb(0, 0, 255);">未命名分组</span>`);
    done();
  });
});
