import { mount, createLocalVue } from '@vue/test-utils';
import SmNcpMap from '../NcpMap.vue';
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

describe('NcpMap.vue', () => {
  let wrapper;
  beforeEach(() => {
    mapEvent.firstMapTarget = null;
    mapEvent.$options.mapCache = {};
    mapEvent.$options.NcpMapCache = {};
    wrapper = null;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (wrapper) {
      wrapper.destroy();
    }
  });

  it('initial_mapOptions', done => {
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmNcpMap, {
      propsData: {
        mapOptions: {
          container: 'map',
          center: {
            lng: 104.93846582803894,
            lat: 33.37080662210445
          },
          zoom: 3,
          bearing: 0,
          pitch: 0,
          interactive: true,
          style: {
            version: 8,
            sources: {
              中国地图: {
                type: 'raster',
                tiles: [
                  'https://maptiles.supermapol.com/iserver/services/map_China/rest/maps/China_Dark/zxyTileImage.png?z={z}&x={x}&y={y}'
                ],
                tileSize: 256
              }
            },
            layers: [
              {
                id: '中国地图',
                source: '中国地图',
                type: 'raster',
                minzoom: 0,
                maxzoom: 22
              }
            ]
          },
          rasterTileSize: 256,
          preserveDrawingBuffer: true
        },
        dataOptions: {
          name: '全省确诊人数',
          proxyUrl: '',
          url: ''
        }
      }
    });
    wrapper.vm.$on('load', () => {
      try {
        expect(spy).toBeCalled();
        expect(wrapper.element.id).toEqual('map');
        done();
      } catch (exception) {
        console.log('NcpMap' + exception.name + ':' + exception.message);
        expect(false).toBeTruthy();
        spy.mockReset();
        spy.mockRestore();
        done();
      }
    });
  });
});
