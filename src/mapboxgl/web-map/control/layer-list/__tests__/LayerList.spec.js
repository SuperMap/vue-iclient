import { mount } from '@vue/test-utils';
import SmWebMap from '../../../WebMap';
import SmLayerList from '../LayerList.vue';
import LayerList from '../index';
import mockFetch from 'vue-iclient/test/unit/mocks/FetchRequest';
import iportal_serviceProxy from 'vue-iclient/test/unit/mocks/data/iportal_serviceProxy';
import uniqueLayer_point from 'vue-iclient/test/unit/mocks/data/WebMap/uniqueLayer_point';
import layer_v3 from 'vue-iclient/test/unit/mocks/data/WebMap/layer_v3';
import layerData from 'vue-iclient/test/unit/mocks/data/layerData';
import mapboxgl from '@libs/mapboxgl/mapbox-gl-enhance.js';

describe('LayerList.vue', () => {
  let wrapper;
  let mapWrapper;

  const commonMap = {
    map:{
      resize: () => jest.fn(),
      getZoom: () => jest.fn(),
      setZoom: () => jest.fn(),
      setCRS: () => jest.fn(),
      getCenter: () => {
        return {
          lng: 1,
          lat: 2
        };
      },
      setCenter: () => jest.fn(),
      getBearing: () => 2,
      setBearing: () => jest.fn(),
      getPitch: () => 2,
      setPitch: () => jest.fn(),
      getStyle: () => {
        return {
          layers: [{
            id: 1
          }]
        }
      },
      addSource: () => jest.fn(),
      getSource: () => jest.fn(),
      removeSource: jest.fn(),
      triggerRepaint: () => jest.fn(),
      style: jest.fn(),
      getLayer: jest.fn(),
      removeLayer: jest.fn(),
      getCRS: () => {
        return {
          epsgCode: 'EPSG:3857',
          getExtent: () => jest.fn()
        };
      },
      addLayer: () => jest.fn(),
      moveLayer: () => jest.fn(),
      overlayLayersManager: {},
      on: () => { },
      off: () => { },
      fire: () => { },
      setLayoutProperty: () => jest.fn(),
      addStyle: () => jest.fn(),
      remove: () => jest.fn(),
      setRenderWorldCopies: () => jest.fn(),
      setStyle: () => jest.fn(),
      loadImage: function (src, callback) {
        callback(null, { width: 15 });
      },
      addImage: function () { },
      hasImage: function () {
        return false;
      }
    },
    mapparams: {},
    layers: []
  };

  mapboxgl.supermap.WebMapV3 = () => {
    return {
      on: (event, callback) => {
        callback(commonMap);
      }
    }
  }

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
      'https://fakeiportal.supermap.io/iportal/web/datas/676516522/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123': layerData
    };
    mockFetch(fetchResource);
    mapWrapper = mount(SmWebMap, {
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
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
        wrapper.find('.sm-component-layer-list__layer > i').trigger('click');
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
        wrapper.find('.sm-components-icon-partially-visible').trigger('click');
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
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': layer_v3,
      'https://fakeiportal.supermap.io/iportal/web/datas/676516522/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123': layerData
    };
    mockFetch(fetchResource);
    mapWrapper = mount(SmWebMap, {
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
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
        wrapper.find('.sm-component-layer-list__layer > i').trigger('click');
        expect(spylayerVisibility).toHaveBeenCalledTimes(1);
        done();
      });
    };
    mapWrapper.vm.viewModel.on({ addlayerssucceeded: addCallback });
  });
});
