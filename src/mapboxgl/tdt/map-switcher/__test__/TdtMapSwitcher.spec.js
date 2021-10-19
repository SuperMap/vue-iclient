import { mount } from '@vue/test-utils';
import SmTdtMapSwitcher from '../TdtMapSwitcher.vue';
import SmWebMap from '../../../web-map/WebMap.vue';
import mapEvent from '@types_mapboxgl/map-event';
import '@libs/mapboxgl/mapbox-gl-enhance';

describe('TdtMapSwitcher.vue', () => {
  let wrapper;
  let mapWrapper;
  beforeEach(() => {
    mapEvent.firstMapTarget = null;
    mapEvent.$options.mapCache = {};
    mapEvent.$options.webMapCache = {};
    mapWrapper = mount(SmWebMap, {
      propsData: {
        mapOptions: {
          center: [126.64318, 45.74141],
          zoom: 11,
          style: {
            version: 8,
            sources: {
              baseLayer: {
                type: 'raster',
                tiles: [
                  'https://fakeurl/img_w/wmts?tk=1d109683f4d84198e37a38c442d68311&service=WMTS&request=GetTile&version=1.0.0&style=default&tilematrixSet=w&format=tiles&width=256&height=256&layer=img&tilematrix={z}&tilerow={y}&tilecol={x}'
                ],
                tileSize: 256
              },
              labelLayer: {
                type: 'raster',
                tiles: [
                  'https://fakeurl/cia_w/wmts?tk=1d109683f4d84198e37a38c442d68311&service=WMTS&request=GetTile&version=1.0.0&style=default&tilematrixSet=w&format=tiles&width=256&height=256&layer=cia&tilematrix={z}&tilerow={y}&tilecol={x}'
                ],
                tileSize: 256
              }
            },
            layers: [
              {
                id: 'baseLayer',
                type: 'raster',
                source: 'baseLayer',
                minzoom: 0,
                maxzoom: 18
              },
              {
                id: 'labelLayer',
                type: 'raster',
                source: 'labelLayer',
                minzoom: 0,
                maxzoom: 18
              }
            ]
          },
          renderWorldCopies: false
        }
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
    wrapper = mount(SmTdtMapSwitcher, {
      propsData: {
        mapTarget: 'map',
        collapsed: false,
        data: {
          select: 'img',
          label: false,
          tk: '1d109683f4d84198e37a38c442d68311'
        }
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          const tdtItem = wrapper.find('.layer-item.map-item');
          expect(tdtItem.exists()).toBe(true);
          tdtItem.trigger('click');
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

  it('change token', done => {
    wrapper = mount(SmTdtMapSwitcher, {
      propsData: {
        mapTarget: 'map',
        data: {
          select: '',
          label: false,
          tk: '1d109683f4d84198e37a38c442d68311'
        }
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          const newTk = '22309683f4d84198e37a38c442d55555'
          const setTkSpy = jest.spyOn(wrapper.vm.viewModel, 'setTk');
          wrapper.setProps({
            data: {
              tk: newTk
            }
          })
          expect(setTkSpy).toBeCalled();
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
});
