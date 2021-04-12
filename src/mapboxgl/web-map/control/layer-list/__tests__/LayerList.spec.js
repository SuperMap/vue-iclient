import {
  mount,
  createLocalVue,
  config
} from '@vue/test-utils';
import SmWebMap from '../../../WebMap';
import SmLayerList from '../LayerList.vue';
import mapEvent from '@types_mapboxgl/map-event';

import {
  Icon,
  Card,
  Collapse,
  Checkbox,
  Spin
} from 'ant-design-vue';

config.stubs.transition = false;
const localVue = createLocalVue();
localVue.use(Card);
localVue.use(Collapse);
localVue.use(Icon);
localVue.use(Checkbox);
localVue.use(Spin);

describe('LayerList.vue', () => {
  let wrapper;
  let mapWrapper;

  beforeEach(() => {
    mapEvent.firstMapTarget = null;
    mapEvent.$options.mapCache = {};
    mapEvent.$options.webMapCache = {};
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

  it('layerGroupVisibility tile', done => {
    mapWrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
      }
    });
    wrapper = mount(SmLayerList, {
      localVue,
      propsData: {
        mapTarget: 'map'
      }
    });
    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        let spylayerVisibility = jest.spyOn(wrapper.vm, 'toggleLayerGroupVisibility');
        try {
          wrapper.findAll('.sm-components-icon-hidden').at(0).trigger('click');
          expect(spylayerVisibility).toHaveBeenCalledTimes(1);
          done();
        } catch (exception) {
          console.log('LayerList_default' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          mapWrapper.destroy();
          done();
        }
      });
    });
  });

  it('layerGroupVisibility vector-tile', done => {
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
                  'https://fakeiserver.supermap.io//iserver/services/map-beijing/rest/maps/beijingMap/tileFeature.mvt?returnAttributes=true&compressTolerance=-1&width=512&height=512&viewBounds={bbox-epsg-3857}&expands=0:0_2,132_128,138_64,141_32,143_16,145_8,147_4'
                ]
              }
            },
            layers: [{
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
        }
      }
    });
    wrapper = mount(SmLayerList, {
      localVue,
      propsData: {
        mapTarget: 'map'
      }
    });
    let spyProperty = jest.spyOn(wrapper.vm.viewModel, 'changeLayerGroupVisibility');
    wrapper.vm.$on('loaded', () => {
      try {
        expect(wrapper.vm.mapTarget).toBe('map');
        wrapper.vm.$nextTick(() => {
          wrapper.find('i.sm-components-icon-visible').trigger('click');
          expect(spyProperty).toHaveBeenCalledWith('vector-tiles', 'visible');
          done();
        });
      } catch (exception) {
        console.log('layerGroupVisibility' + exception.name + ':' + exception.message);
        expect(false).toBeTruthy();
        mapWrapper.destroy();
        done();
      }
    });
  });
});