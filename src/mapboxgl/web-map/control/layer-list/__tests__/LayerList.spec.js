import { mount, createLocalVue, config } from '@vue/test-utils';
import SmWebMap from '../../../WebMap';
import SmLayerList from '../LayerList.vue';
import mapEvent from '@types_mapboxgl/map-event';

import { Icon, Card, Collapse, Checkbox, Spin } from 'ant-design-vue';
import '../../../../../../test/jest.init';

config.stubs.transition = false;
const localVue = createLocalVue();
localVue.use(Card);
localVue.use(Collapse);
localVue.use(Icon);
localVue.use(Checkbox);
localVue.use(Spin);

jest.mock('@i18n/_lang', () => require('@mocks/i18n'));
jest.mock('@libs/mapbox-gl-draw/mapbox-gl-draw', () => require('@mocks/mapboxgl_draw'));
jest.mock('@libs/mapboxgl/mapbox-gl-enhance.js', () => require('@mocks/mapboxgl').mapboxgl);
jest.mock('@libs/iclient-mapboxgl/iclient-mapboxgl.min.js', () => require('@mocks/mapboxgl_iclient'));
describe('LayerList.vue', () => {
  let wrapper;
  let mapWrapper;
  let host = 'test';
  // var host ="http://iclsvr.supermap.io";

  beforeEach(() => {
    mapEvent.firstMapTarget = null;
    mapEvent.$options.mapCache = {};
    mapEvent.$options.webMapCache = {};
    wrapper = null;
    mapWrapper = null;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
    if (mapWrapper) {
      mapWrapper.destroy();
    }
  });

  it('layerGroupVisibility tile', done => {
    mapWrapper = mount(SmWebMap, {
      propsData: {
        mapOptions: {
          style: {
            version: 8,
            sources: {
              'raster-tiles': {
                type: 'raster',
                tiles: [host + '/iserver/services/map-china400/rest/maps/China/zxyTileImage.png?z={z}&x={x}&y={y}'],
                tileSize: 256
              }
            },
            layers: [
              {
                id: 'simple-tiles',
                type: 'raster',
                source: 'raster-tiles'
              }
            ]
          }
        }
      }
    });

    mapWrapper.vm.$on('load', () => {
      let spyProperty = jest.spyOn(mapWrapper.vm.map, 'setLayoutProperty');
      wrapper = mount(SmLayerList, {
        localVue,
        propsData: {
          mapTarget: 'map'
        }
      });
      wrapper.vm.$nextTick(() => {
        try {
          expect(wrapper.vm.mapTarget).toBe('map');
          wrapper.vm.$nextTick(() => {
            let a = wrapper.find('i.anticon-eye');
            console.log(a);
            wrapper.find('i.anticon-eye').trigger('click');
            expect(spyProperty).toHaveBeenCalledTimes(1);
            mapWrapper.destroy();
            done();
          });
        } catch (exception) {
          console.log('LayerList_default' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          mapWrapper.destroy();
          done();
        }
      });
    });
  });

  /**
   * ignore 原因是mount出来的要素里面没有右侧箭头，没法展开，测试单独点击单个图层前的checkbox。测试的所有图层的显示（眼睛）部分可以跑过
   */
  xit('layerGroupVisibility vector-tile', done => {
    mapWrapper = mount(SmWebMap, {
      propsData: {
        style: '{height:"700px"}',
        mapOptions: {
          container: 'map',
          style: {
            version: 8,
            sources: {
              'vector-tiles': {
                type: 'vector',
                tiles: [
                  host +
                    '/iserver/services/map-beijing/rest/maps/beijingMap/tileFeature.mvt?returnAttributes=true&compressTolerance=-1&width=512&height=512&viewBounds={bbox-epsg-3857}&expands=0:0_2,132_128,138_64,141_32,143_16,145_8,147_4'
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
                    stops: [[11, 1], [18, 10]]
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
        }
      }
    });

    let spyProperty = jest.spyOn(mapWrapper.vm.map, 'setLayoutProperty');
    wrapper = mount(SmLayerList, {
      localVue,
      propsData: {
        mapTarget: 'map'
      }
    });

    wrapper.vm.$on('loaded', () => {
      try {
        expect(wrapper.vm.getMapTarget).toBe('map');
        wrapper.vm.$nextTick(() => {
          // wrapper.vm.layerListViewModel.on("layersUpdated", () => {
          wrapper.find('i.anticon-eye').trigger('click');
          expect(spyProperty).toHaveBeenNthCalledWith(1, '三级道路L@北京', 'visibility', expect.any(String));
          expect(spyProperty).toHaveBeenNthCalledWith(2, '二级道路L@北京', 'visibility', expect.any(String));
          expect(spyProperty).toHaveBeenNthCalledWith(3, '二级道路L@北京1', 'visibility', expect.any(String));
          wrapper.vm.$nextTick(() => {
            wrapper.find('i.header-arrow').trigger('click');
            wrapper.vm.$nextTick(() => {
              let checkInput = wrapper.findAll('input[type="checkbox"]').at(1);
              checkInput.setChecked();
              checkInput.trigger('change');
              expect(spyProperty).toHaveBeenNthCalledWith(4, '二级道路L@北京', 'visibility', expect.any(String));
              expect(spyProperty).toHaveBeenNthCalledWith(5, '二级道路L@北京1', 'visibility', expect.any(String));
              mapWrapper.destroy();
              done();
            });
          });
        });
      } catch (exception) {
        console.log('LayerList_default' + exception.name + ':' + exception.message);
        expect(false).toBeTruthy();
        mapWrapper.destroy();
        done();
      }
    });
  });
});
