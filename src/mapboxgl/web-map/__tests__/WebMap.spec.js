import { mount, createLocalVue, config } from '@vue/test-utils';
import SmWebMap from '../WebMap.vue';
import mapboxgl from '@libs/mapboxgl/mapbox-gl-enhance.js';
import { message } from 'ant-design-vue';
import mockFetch from 'vue-iclient/test/unit/mocks/FetchRequest';
import iportal_serviceProxy from 'vue-iclient/test/unit/mocks/data/iportal_serviceProxy';
import uniqueLayer_point from 'vue-iclient/test/unit/mocks/data/WebMap/uniqueLayer_point';
import layerData from 'vue-iclient/test/unit/mocks/data/layerData';
import markerLayer from 'vue-iclient/test/unit/mocks/data/WebMap/markerLayer';
import markerData from 'vue-iclient/test/unit/mocks/data/WebMap/markerData';
import heatLayer from 'vue-iclient/test/unit/mocks/data/WebMap/heatLayer';
import chart_content from 'vue-iclient/test/unit/mocks/data/WebMap/chart_content';
import vectorLayer_point from 'vue-iclient/test/unit/mocks/data/WebMap/vectorLayer_point.json';
import vectorLayer_line from 'vue-iclient/test/unit/mocks/data/WebMap/vectorLayer_line.json';
import ranksymbolLayer from 'vue-iclient/test/unit/mocks/data/WebMap/ranksymbolLayer.json';
import uniqueLayer_polygon from 'vue-iclient/test/unit/mocks/data/WebMap/uniqueLayer_polygon.json';
import wmsLayer from 'vue-iclient/test/unit/mocks/data/WebMap/wmsLayer.json';
import wmtsLayer from 'vue-iclient/test/unit/mocks/data/WebMap/wmtsLayer.json';
import { wmtsCapabilitiesText } from 'vue-iclient/test/unit/mocks/data/CapabilitiesText.js';
import tiandituLayer from 'vue-iclient/test/unit/mocks/data/WebMap/tiandituLayer.json';
import xyzLayer from 'vue-iclient/test/unit/mocks/data/WebMap/xyzLayer.json';
import mapboxstyleLayer from 'vue-iclient/test/unit/mocks/data/WebMap/mapboxstyleLayer.json';
import migrationLayer from 'vue-iclient/test/unit/mocks/data/WebMap/migrationLayer.json';
import flushPromises from 'flush-promises';
import mapWrapperLoaded from 'vue-iclient/test/unit/mapWrapperLoaded.js';

const localVue = createLocalVue();
localVue.prototype.$message = message;

document.getElementsByClassName = () => {
  return [
    {
      style: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10
      }
    }
  ];
};

describe('WebMap.vue', () => {
  let wrapper;

  beforeAll(() => {
    config.mapLoad = false;
  });

  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    if (wrapper) {
      wrapper.destroy();
    }
  });

  afterAll(() => {
    config.mapLoad = true;
  });

  it('initial_serverUrl', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_point,
      'https://fakeiportal.supermap.io/iportal/web/datas/676516522/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123': layerData
    };
    mockFetch(fetchResource);
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
      },
      stubs: ['SmPan', 'SmScale', 'SmZoom']
    });
    await mapWrapperLoaded(wrapper);
    expect(spy).toBeCalled();
    expect(wrapper.element.id).toEqual('map');
    expect(wrapper.vm.mapId).toBe('123');
    expect(wrapper.vm.serverUrl).toBe('https://fakeiportal.supermap.io/iportal');
    expect(wrapper.vm.panControl.show).toBe(false);
    expect(wrapper.vm.scaleControl.show).toBe(false);
    expect(wrapper.vm.zoomControl.show).toBe(false);
    done();
  });

  it('initial_Control', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal1.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_point,
      'https://fakeiportal.supermap.io/iportal/web/datas/676516522/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123': layerData
    };
    mockFetch(fetchResource);
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmWebMap, {
      localVue,
      stubs: ['SmPan', 'SmScale', 'SmZoom'],
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123',
        panControl: {
          show: true,
          position: 'top-left'
        },
        scaleControl: {
          show: true,
          position: 'bottom-right'
        },
        zoomControl: {
          show: true,
          position: 'top-left',
          showZoomSlider: false
        }
      }
    });
    await mapWrapperLoaded(wrapper);
    expect(spy).toBeCalled();
    expect(wrapper.element.id).toEqual('map');
    expect(wrapper.vm.serverUrl).toBe('https://fakeiportal.supermap.io/iportal');
    expect(wrapper.vm.mapId).toBe('123');
    expect(wrapper.vm.panControl.show).toBe(true);
    expect(wrapper.vm.scaleControl.position).toBe('bottom-right');
    expect(wrapper.vm.zoomControl.showZoomSlider).toBe(false);
    expect(wrapper.find('.sm-component-pan').exists()).toBe(false);
    expect(wrapper.element.outerHTML).toContain('pan');
    expect(wrapper.element.outerHTML).toContain('zoom');
    expect(wrapper.element.outerHTML).toContain('scale');
    done();
  });

  it('initial_mapObject', async done => {
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmWebMap, {
      propsData: {
        mapOptions: {
          container: 'map',
          style: {
            version: 8,
            sources: {
              'raster-tiles': {
                attribution: 'attribution',
                type: 'raster',
                tiles: [
                  'https://fakeiserver.supermap.io/iserver/services/map-china400/rest/maps/China/zxyTileImage.png?z={z}&x={x}&y={y}'
                ],
                tileSize: 256
              }
            },
            layers: [
              {
                id: 'simple-tiles',
                type: 'raster',
                source: 'raster-tiles',
                minzoom: 0,
                maxzoom: 22
              }
            ]
          },
          center: [120.143, 30.236],
          zoom: 3
        }
      }
    });
    await mapWrapperLoaded(wrapper);
    expect(spy).toBeCalled();
    expect(wrapper.element.id).toEqual('map');
    expect(wrapper.vm.mapOptions.style.layers[0].id).toBe('simple-tiles');
    done();
  });

  it('initial_markerLayer', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123456/map.json': markerLayer,
      'https://fakeiportal.supermap.io/iportal/web/datas/123456/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123456': markerData
    };
    mockFetch(fetchResource);
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123456'
      }
    });
    wrapper.vm.$on('load', callback);
    await mapWrapperLoaded(wrapper);
    function callback(e) {
      expect(spy).toBeCalled();
      expect(wrapper.element.id).toEqual('map');
      expect(wrapper.vm.mapId).toBe('123456');
      expect(wrapper.vm.serverUrl).toBe('https://fakeiportal.supermap.io/iportal');
      const layers = Object.values(e.map.overlayLayersManager);
      expect(layers.length).toBe(2);
      const markerLayer = layers[1];
      expect(markerLayer.type).toBe('symbol');
      expect(markerLayer.layout['icon-image']).toBe(
        'http://fakeiportal/iportal/apps/dataviz/static/imgs/markers/ktv_red.png'
      );
      done();
    }
  });

  it('initial_heatLayer', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/12345678/map.json': heatLayer,
      'https://fakeiportal.supermap.io/iportal/web/datas/1920557079/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=12345678': chart_content
    };
    mockFetch(fetchResource);
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '12345678'
      }
    });
    wrapper.vm.$on('load', callback);
    await mapWrapperLoaded(wrapper);
    function callback(e) {
      expect(spy).toBeCalled();
      expect(wrapper.element.id).toEqual('map');
      expect(wrapper.vm.mapId).toBe('12345678');
      expect(wrapper.vm.serverUrl).toBe('https://fakeiportal.supermap.io/iportal');
      const layers = Object.values(e.map.overlayLayersManager);
      expect(layers.length).toBe(2);
      const heatLayer = layers[1];
      expect(heatLayer.type).toBe('heatmap');
      expect(heatLayer.paint['heatmap-radius']).toBe(30);
      done();
    }
  });

  it('initial_vectorLayer_point', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/147258369/map.json': vectorLayer_point,
      'https://fakeiportal.supermap.io/iportal/web/datas/1920557079/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=147258369': chart_content
    };
    mockFetch(fetchResource);
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '147258369'
      }
    });
    wrapper.vm.$on('load', callback);
    await mapWrapperLoaded(wrapper);
    function callback(e) {
      expect(spy).toBeCalled();
      expect(wrapper.element.id).toEqual('map');
      expect(wrapper.vm.mapId).toBe('147258369');
      expect(wrapper.vm.serverUrl).toBe('https://fakeiportal.supermap.io/iportal');
      const layers = Object.values(e.map.overlayLayersManager);
      expect(layers.length).toBe(2);
      const vectorLayerPoint = layers[1];
      expect(vectorLayerPoint.type).toBe('circle');
      expect(vectorLayerPoint.paint['circle-radius']).toBe(6);
      done();
    }
  });

  it('initial_vectorLayer_line', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/159357852/map.json': vectorLayer_line,
      'https://fakeiportal.supermap.io/iportal/web/datas/1920557079/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=159357852': chart_content
    };
    mockFetch(fetchResource);
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '159357852'
      }
    });
    wrapper.vm.$on('load', callback);
    await mapWrapperLoaded(wrapper);
    function callback(e) {
      expect(spy).toBeCalled();
      expect(wrapper.element.id).toEqual('map');
      expect(wrapper.vm.mapId).toBe('159357852');
      expect(wrapper.vm.serverUrl).toBe('https://fakeiportal.supermap.io/iportal');
      const layers = Object.values(e.map.overlayLayersManager);
      expect(layers.length).toBe(2);
      const vectorLayerLine = layers[1];
      expect(vectorLayerLine.type).toBe('line');
      expect(vectorLayerLine.paint['line-width']).toBe(7);
      done();
    }
  });

  it('initial_ranksymbolLayer', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123456789/map.json': ranksymbolLayer,
      'https://fakeiportal.supermap.io/iportal/web/datas/676516522/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123456789': chart_content
    };
    mockFetch(fetchResource);
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123456789'
      }
    });
    wrapper.vm.$on('load', callback);
    await mapWrapperLoaded(wrapper);
    function callback(e) {
      expect(spy).toBeCalled();
      expect(wrapper.element.id).toEqual('map');
      expect(wrapper.vm.mapId).toBe('123456789');
      expect(wrapper.vm.serverUrl).toBe('https://fakeiportal.supermap.io/iportal');
      setTimeout(function () {
        const layers = Object.values(e.map.overlayLayersManager);
        expect(layers.length).toBe(3);
        const vectorLayerPoint = layers[1];
        expect(vectorLayerPoint.type).toBe('circle');
        expect(vectorLayerPoint.paint['circle-radius'].length).toBeGreaterThan(0);
        const labelLayer = layers[2];
        expect(labelLayer.type).toBe('symbol');
        expect(labelLayer.paint['text-color']).toBe('#333');
        expect(labelLayer.layout['text-field']).toBe('{机场}');
        done();
      }, 2000);
    }
  });

  it('initial_uniqueLayer_polygon', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/2064629293/map.json': uniqueLayer_polygon,
      'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=2064629293': chart_content
    };
    mockFetch(fetchResource);
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '2064629293'
      }
    });
    wrapper.vm.$on('load', callback);
    await mapWrapperLoaded(wrapper);
    function callback(e) {
      expect(spy).toBeCalled();
      expect(wrapper.element.id).toEqual('map');
      expect(wrapper.vm.mapId).toBe('2064629293');
      expect(wrapper.vm.serverUrl).toBe('https://fakeiportal.supermap.io/iportal');
      const layers = Object.values(e.map.overlayLayersManager);
      expect(layers.length).toBe(3);
      const vectorLayerPoint = layers[1];
      const id = vectorLayerPoint.id;
      expect(vectorLayerPoint.type).toBe('fill');
      expect(vectorLayerPoint.paint['fill-color'].length).toBeGreaterThan(0);
      const strokeLayer = layers[2];
      expect(strokeLayer.id).toBe(`${id}-strokeLine`);
      expect(strokeLayer.type).toBe('line');
      expect(strokeLayer.paint['line-color']).toBe('#ffffff');
      done();
    }
  });

  it('initial_wmsLayer', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/4845656956/map.json': wmsLayer
    };
    mockFetch(fetchResource);
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '4845656956'
      }
    });
    await mapWrapperLoaded(wrapper);
    expect(spy).toBeCalled();
    expect(wrapper.element.id).toEqual('map');
    expect(wrapper.vm.mapId).toBe('4845656956');
    expect(wrapper.vm.serverUrl).toBe('https://fakeiportal.supermap.io/iportal');
    setTimeout(function () {
      done();
    }, 2000);
  });

  it('initial_wmtsLayer', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/1016996969/map.json': wmtsLayer,
      'http://support.supermap.com.cn:8090/iserver/services/map-china400/wmts100?REQUEST=GetCapabilities&SERVICE=WMTS&VERSION=1.0.0': wmtsCapabilitiesText
    };
    mockFetch(fetchResource);
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '1016996969'
      }
    });
    await mapWrapperLoaded(wrapper);
    expect(spy).toBeCalled();
    expect(wrapper.element.id).toEqual('map');
    expect(wrapper.vm.mapId).toBe('1016996969');
    expect(wrapper.vm.serverUrl).toBe('https://fakeiportal.supermap.io/iportal');
    setTimeout(function () {
      done();
    }, 2000);
  });

  it('initial_TiandituLayer', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/1224625555/map.json': tiandituLayer
    };
    mockFetch(fetchResource);
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '1224625555'
      }
    });
    wrapper.vm.$on('load', callback);
    await mapWrapperLoaded(wrapper);
    function callback(e) {
      expect(spy).toBeCalled();
      expect(wrapper.element.id).toEqual('map');
      expect(wrapper.vm.mapId).toBe('1224625555');
      expect(wrapper.vm.serverUrl).toBe('https://fakeiportal.supermap.io/iportal');
      const layers = Object.values(e.map.overlayLayersManager);
      expect(layers.length).toBe(2);
      const tiandituLayer = layers[0];
      expect(tiandituLayer.id).toBe('天地图地形');
      expect(tiandituLayer.type).toBe('raster');
      const labelLayer = layers[1];
      expect(labelLayer.id).toBe('天地图地形-label');
      done();
    }
  });

  it('initial_xyzLayer', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/7894565555/map.json': xyzLayer
    };
    mockFetch(fetchResource);
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '7894565555'
      }
    });
    wrapper.vm.$on('load', callback);
    await mapWrapperLoaded(wrapper);
    function callback(e) {
      expect(spy).toBeCalled();
      expect(wrapper.element.id).toEqual('map');
      expect(wrapper.vm.mapId).toBe('7894565555');
      expect(wrapper.vm.serverUrl).toBe('https://fakeiportal.supermap.io/iportal');
      const layers = Object.values(e.map.overlayLayersManager);
      expect(layers.length).toBe(1);
      const xyzLayer = layers[0];
      expect(xyzLayer.id).toBe('OpenStreetMap');
      expect(xyzLayer.type).toBe('raster');
      done();
    }
  });

  it('initial_mapboxstyleLayer', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/8888885555/map.json': mapboxstyleLayer
    };
    mockFetch(fetchResource);
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '8888885555'
      }
    });
    await mapWrapperLoaded(wrapper);
    expect(spy).toBeCalled();
    expect(wrapper.element.id).toEqual('map');
    expect(wrapper.vm.mapId).toBe('8888885555');
    expect(wrapper.vm.serverUrl).toBe('https://fakeiportal.supermap.io/iportal');
    setTimeout(function () {
      done();
    }, 2000);
  });

  xit('initial_migrationLayer', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/6177878786/map.json': migrationLayer,
      'https://fakeiportal.supermap.io/iportal/web/datas/516597759/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=6177878786': layerData,
      'https://fakeiportal.supermap.io/iportal/web/datas/516597759/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': layerData,
      'https://www.supermapol.com/web/datas/516597759/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': layerData
    };
    mockFetch(fetchResource);
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmWebMap, {
      localVue,
      // propsData: {
      //   serverUrl: 'https://fakeiportal.supermap.io/iportal',
      //   mapId: '6177878786'
      // }
      propsData: {
        mapId: migrationLayer,
        serverUrl: 'https://fakeiportal.supermap.io/iportal'
      }
    });
    await mapWrapperLoaded(wrapper);
    expect(spy).toBeCalled();
    expect(wrapper.element.id).toEqual('map');
    // expect(wrapper.vm.mapId).toBe('6177878786');
    // expect(wrapper.vm.serverUrl).toBe('https://fakeiportal.supermap.io/iportal');
    await flushPromises();
    done();
  });

  xit('initial-rangeLayer-point', async done => {
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '5785858575'
      }
    });
    await mapWrapperLoaded(wrapper);
    expect(spy).toBeCalled();
    expect(wrapper.vm.mapId).toBe('5785858575');
    expect(wrapper.vm.serverUrl).toBe('https://fakeiportal.supermap.io/iportal');
    const layers = Object.values(e.map.overlayLayersManager);
    console.log('layers', layers);
    expect(layers.length).toBe(2);
    const rangeLayerPoint = layers[1];
    const id = rangeLayerPoint.id;
    expect(id).toBe('RANGE-北京市轨道交通站点(9)-0');
    expect(rangeLayerPoint.type).toBe('circle');
    expect(rangeLayerPoint.paint['circle-radius']).toBe(8);
    expect(rangeLayerPoint.paint['circle-color'].length).toBeGreaterThan(0);
    setTimeout(function () {
      done();
    }, 2000);
  });

  it('setProps', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal1.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_point,
      'https://fakeiportal1.supermap.io/iportal/web/maps/1234/map.json': uniqueLayer_point,
      'https://fakeiportal.supermap.io/iportal/web/datas/676516522/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123': layerData
    };
    mockFetch(fetchResource);
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmWebMap, {
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
      }
    });
    await mapWrapperLoaded(wrapper);
    expect(spy).toBeCalled();
    wrapper.setProps({
      mapId: '1234',
      serverUrl: 'https://fakeiportal1.supermap.io/iportal',
      withCredentials: false,
      mapOptions: {
        zoom: 5,
        center: [0, 0],
        crs: 'EPSG:4326',
        maxBounds: [
          [0, 0],
          [180, 180]
        ],
        minZoom: 2,
        maxZoom: 18,
        renderWorldCopies: true,
        bearing: 0,
        pitch: 5,
        style: { diff: true, layers: [] }
      }
    });
    await flushPromises();
    wrapper.vm.$nextTick();
    expect(wrapper.vm.mapId).toBe('1234');
    expect(wrapper.vm.serverUrl).toBe('https://fakeiportal1.supermap.io/iportal');
    expect(wrapper.vm.withCredentials).toBe(false);
    expect(wrapper.vm.mapOptions.zoom).toBe(5);
    expect(wrapper.vm.mapOptions.center[0]).toBe(0);
    expect(wrapper.vm.mapOptions.center[1]).toBe(0);
    expect(wrapper.vm.mapOptions.minZoom).toBe(2);
    expect(wrapper.vm.mapOptions.maxZoom).toBe(18);
    expect(wrapper.vm.mapOptions.renderWorldCopies).toBe(true);
    expect(wrapper.vm.mapOptions.bearing).toBe(0);
    done();
  });
});
