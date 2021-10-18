import { mount, createLocalVue } from '@vue/test-utils';
import SmWebMap from '../WebMap.vue';
import mapboxgl from '@libs/mapboxgl/mapbox-gl-enhance.js';
import mapEvent from '@types_mapboxgl/map-event';
import { Icon, Card, Collapse, Button, Spin, message } from 'ant-design-vue';

const localVue = createLocalVue();
localVue.use(Card);
localVue.use(Collapse);
localVue.use(Icon);
localVue.use(Button);
localVue.use(Spin);
localVue.prototype.$message = message;

describe('WebMap.vue', () => {
  let wrapper;
  beforeEach(() => {
    mapEvent.firstMapTarget = null;
    mapEvent.$options.mapCache = {};
    mapEvent.$options.webMapCache = {};
    wrapper = null;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (wrapper) {
      wrapper.destroy();
    }
  });

  it('initial_serverUrl', done => {
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
      },
      stubs: ['SmPan', 'SmScale', 'SmZoom']
    });
    wrapper.vm.$on('load', () => {
      try {
        expect(spy).toBeCalled();
        expect(wrapper.element.id).toEqual('map');
        expect(wrapper.vm.mapId).toBe('123');
        expect(wrapper.vm.serverUrl).toBe('https://fakeiportal.supermap.io/iportal');
        expect(wrapper.vm.panControl.show).toBe(false);
        expect(wrapper.vm.scaleControl.show).toBe(false);
        expect(wrapper.vm.zoomControl.show).toBe(false);
        done();
      } catch (exception) {
        console.log('WebMap' + exception.name + ':' + exception.message);
        expect(false).toBeTruthy();
        spy.mockReset();
        spy.mockRestore();
        done();
      }
    });
  });

  it('initial_Control', done => {
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
    wrapper.vm.$on('load', () => {
      try {
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
      } catch (exception) {
        console.log('WebMap' + exception.name + ':' + exception.message);
        expect(false).toBeTruthy();
        spy.mockReset();
        spy.mockRestore();
        done();
      }
    });
  });
  it('initial_mapObject', done => {
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmWebMap, {
      propsData: {
        mapOptions: {
          container: 'map', // container id
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
    wrapper.vm.$on('load', () => {
      try {
        expect(spy).toBeCalled();
        expect(wrapper.element.id).toEqual('map');
        expect(wrapper.vm.mapOptions.style.layers[0].id).toBe('simple-tiles');
        done();
      } catch (exception) {
        console.log('WebMap' + exception.name + ':' + exception.message);
        expect(false).toBeTruthy();
        spy.mockReset();
        spy.mockRestore();
        done();
      }
    });
  });
  it('initial_markerLayer', done => {
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123456'
      }
    });
    wrapper.vm.$on('load', e => {
      try {
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
      } catch (exception) {
        console.log('WebMap' + exception.name + ':' + exception.message);
        expect(false).toBeTruthy();
        spy.mockReset();
        spy.mockRestore();
        done();
      }
    });
  });
  it('initial_heatLayer', done => {
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '12345678'
      }
    });
    wrapper.vm.$on('load', e => {
      try {
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
      } catch (exception) {
        console.log('WebMap' + exception.name + ':' + exception.message);
        expect(false).toBeTruthy();
        spy.mockReset();
        spy.mockRestore();
        done();
      }
    });
  });

  it('initial_vectorLayer_point', done => {
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '147258369'
      }
    });
    wrapper.vm.$on('load', e => {
      try {
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
      } catch (exception) {
        console.log('WebMap' + exception.name + ':' + exception.message);
        expect(false).toBeTruthy();
        spy.mockReset();
        spy.mockRestore();
        done();
      }
    });
  });

  it('initial_vectorLayer_line', done => {
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '159357852'
      }
    });
    wrapper.vm.$on('load', e => {
      try {
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
      } catch (exception) {
        console.log('WebMap' + exception.name + ':' + exception.message);
        expect(false).toBeTruthy();
        spy.mockReset();
        spy.mockRestore();
        done();
      }
    });
  });

  it('initial_ranksymbolLayer', done => {
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123456789'
      }
    });
    wrapper.vm.$on('load', e => {
      try {
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
      } catch (exception) {
        console.log('WebMap' + exception.name + ':' + exception.message);
        expect(false).toBeTruthy();
        spy.mockReset();
        spy.mockRestore();
        done();
      }
    });
  });

  it('initial_uniqueLayer_polygin', done => {
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '2064629293'
      }
    });
    wrapper.vm.$on('load', e => {
      try {
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
      } catch (exception) {
        console.log('WebMap' + exception.name + ':' + exception.message);
        expect(false).toBeTruthy();
        spy.mockReset();
        spy.mockRestore();
        done();
      }
    });
  });

  it('initial_wmsLayer', done => {
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '4845656956'
      }
    });
    wrapper.vm.$on('load', e => {
      try {
        expect(spy).toBeCalled();
        expect(wrapper.element.id).toEqual('map');
        expect(wrapper.vm.mapId).toBe('4845656956');
        expect(wrapper.vm.serverUrl).toBe('https://fakeiportal.supermap.io/iportal');
        setTimeout(function () {
          done();
        }, 2000);
      } catch (exception) {
        console.log('WebMap' + exception.name + ':' + exception.message);
        expect(false).toBeTruthy();
        spy.mockReset();
        spy.mockRestore();
        done();
      }
    });
  });

  it('initial_wmtsLayer', done => {
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '1016996969'
      }
    });
    wrapper.vm.$on('load', e => {
      try {
        expect(spy).toBeCalled();
        expect(wrapper.element.id).toEqual('map');
        expect(wrapper.vm.mapId).toBe('1016996969');
        expect(wrapper.vm.serverUrl).toBe('https://fakeiportal.supermap.io/iportal');
        setTimeout(function () {
          done();
        }, 2000);
      } catch (exception) {
        console.log('WebMap' + exception.name + ':' + exception.message);
        expect(false).toBeTruthy();
        spy.mockReset();
        spy.mockRestore();
        done();
      }
    });
  });

  it('initial_TiandituLayer', done => {
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '1224625555'
      }
    });
    wrapper.vm.$on('load', e => {
      try {
        expect(spy).toBeCalled();
        expect(wrapper.element.id).toEqual('map');
        expect(wrapper.vm.mapId).toBe('1224625555');
        expect(wrapper.vm.serverUrl).toBe('https://fakeiportal.supermap.io/iportal');
        setTimeout(function () {
          const layers = Object.values(e.map.overlayLayersManager);
          expect(layers.length).toBe(2);
          const tiandituLayer = layers[0];
          expect(tiandituLayer.id).toBe('天地图地形');
          expect(tiandituLayer.type).toBe('raster');
          const labelLayer = layers[1];
          expect(labelLayer.id).toBe('天地图地形-label');
          done();
        }, 2000);
      } catch (exception) {
        console.log('WebMap' + exception.name + ':' + exception.message);
        expect(false).toBeTruthy();
        spy.mockReset();
        spy.mockRestore();
        done();
      }
    });
  });

  it('initial_xyzLayer', done => {
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '7894565555'
      }
    });
    wrapper.vm.$on('load', e => {
      try {
        expect(spy).toBeCalled();
        expect(wrapper.element.id).toEqual('map');
        expect(wrapper.vm.mapId).toBe('7894565555');
        expect(wrapper.vm.serverUrl).toBe('https://fakeiportal.supermap.io/iportal');
        setTimeout(function () {
          const layers = Object.values(e.map.overlayLayersManager);
          expect(layers.length).toBe(1);
          const xyzLayer = layers[0];
          expect(xyzLayer.id).toBe('OpenStreetMap');
          expect(xyzLayer.type).toBe('raster');
          done();
        }, 2000);
      } catch (exception) {
        console.log('WebMap' + exception.name + ':' + exception.message);
        expect(false).toBeTruthy();
        spy.mockReset();
        spy.mockRestore();
        done();
      }
    });
  });

  it('initial_mapboxstyleLayer', done => {
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '8888885555'
      }
    });
    wrapper.vm.$on('load', e => {
      try {
        expect(spy).toBeCalled();
        expect(wrapper.element.id).toEqual('map');
        expect(wrapper.vm.mapId).toBe('8888885555');
        expect(wrapper.vm.serverUrl).toBe('https://fakeiportal.supermap.io/iportal');
        setTimeout(function () {
          done();
        }, 2000);
      } catch (exception) {
        console.log('WebMap' + exception.name + ':' + exception.message);
        expect(false).toBeTruthy();
        spy.mockReset();
        spy.mockRestore();
        done();
      }
    });
  });

  it('initial_migrationLayer', done => {
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '6177878786'
      }
    });
    wrapper.vm.$on('load', e => {
      try {
        expect(spy).toBeCalled();
        expect(wrapper.element.id).toEqual('map');
        expect(wrapper.vm.mapId).toBe('6177878786');
        expect(wrapper.vm.serverUrl).toBe('https://fakeiportal.supermap.io/iportal');
        setTimeout(function () {
          done();
        }, 2000);
      } catch (exception) {
        console.log('WebMap' + exception.name + ':' + exception.message);
        expect(false).toBeTruthy();
        spy.mockReset();
        spy.mockRestore();
        done();
      }
    });
  });
});
