import '../../../../../../test/jest.init';
import { config, mount, shallowMount, createLocalVue } from '@vue/test-utils';
import SmWebMap from '../../../WebMap';
import SmMeasure from '../Measure';

import mapEvent from '@types_mapboxgl/map-event';
import { Icon, Card, Collapse, Checkbox, Select, Spin } from 'ant-design-vue';

config.stubs.transition = false;
const localVue = createLocalVue();
localVue.use(Card);
localVue.use(Collapse);
localVue.use(Icon);
localVue.use(Checkbox);
localVue.use(Select);
localVue.use(Spin);

jest.mock('@i18n/_lang', () => require('@mocks/i18n'));
jest.mock('@libs/mapboxgl/mapbox-gl-enhance.js', () => require('@mocks/mapboxgl').mapboxgl);
jest.mock('@mapbox/mapbox-gl-draw', () => require('@mocks/mapboxgl_draw'));
jest.mock('@libs/iclient-mapboxgl/iclient-mapboxgl.min.js', () => require('@mocks/mapboxgl_iclient'));

describe('mesure', () => {
  let mapWrapper;
  let measureWrapper;
  let host = 'test';
  beforeEach(() => {
    mapEvent.firstMapTarget = null;
    mapEvent.$options.mapCache = {};
    mapEvent.$options.webMapCache = {};
    measureWrapper = null;
    mapWrapper = null;
    jest.restoreAllMocks();
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
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (measureWrapper && measureWrapper !== 'undefined') {
      measureWrapper.destroy();
    }
    if (mapWrapper && measureWrapper !== 'undefined') {
      mapWrapper.destroy();
    }
  });

  it('line default', done => {
    mapWrapper.vm.$on('load', () => {
      measureWrapper = mount(SmMeasure, {
        localVue,
        propsData: {
          mapTarget: 'map'
        },
        sync: false
      });
      expect(measureWrapper.vm.mapTarget).toBe('map');
      const spychangeMode = jest.spyOn(measureWrapper.vm, 'changeMeasureMode');
      jest.useFakeTimers();
      measureWrapper.find('i.sm-components-icon-line').trigger('click');
      measureWrapper.vm.$on('loaded', () => {
        try {
          jest.runOnlyPendingTimers();
          expect(spychangeMode).toBeCalled();
          measureWrapper.vm.viewModel.on('measure-finished', measureResult => {
            expect(measureResult.result).toBe('1388.1809');
            done();
          });
          var data = {
            lngLat: { lng: 137.92559401751038, lat: 39.972407560141534 }
          };
          mapWrapper.vm.map.fire('mousedown', data);
          expect(measureWrapper.vm.viewModel.measureNodes.length).toBe(1);
          data = {
            lngLat: { lng: 147.92559401751038, lat: 42.972407560141534 }
          };
          mapWrapper.vm.map.fire('mousemove', data),
          expect(measureWrapper.vm.viewModel.tipHoverDiv.text).toBe('896.7302 unit.kilometers');

          var e = {
            features: [
              {
                id: '786c3dc0b07c96d1ac0d1b72614a3697',
                type: 'Feature',
                properties: {},
                geometry: {
                  coordinates: [[142.93535964243574, 51.313036821416745], [154.00957839243767, 41.405163546980134]],
                  type: 'LineString'
                }
              }
            ]
          };
          mapWrapper.vm.map.fire('draw.create', e);
        } catch (exception) {
          console.log('measure' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });

  // 改变prop后，期望得到的默认单位会变成修改后的即meters,但是得到的还是原来的即kilometers
  it('line change defaultUnit', done => {
    mapWrapper.vm.$on('load', () => {
      measureWrapper = mount(SmMeasure, {
        localVue,
        propsData: {
          mapTarget: 'map'
        },
        sync: false
      });

      measureWrapper.setProps({ distanceDefaultUnit: 'meters' });
      expect(measureWrapper.vm.mapTarget).toBe('map');
      const spychangeMode = jest.spyOn(measureWrapper.vm.viewModel.draw, 'changeMode');
      jest.useFakeTimers();
      measureWrapper.find('i.sm-components-icon-line').trigger('click');
      measureWrapper.vm.$nextTick(() => {
        try {
          jest.runOnlyPendingTimers();
          expect(spychangeMode).toBeCalled();
          measureWrapper.vm.viewModel.on('measure-finished', measureResult => {
            expect(measureResult.result).toBe('1388180.8952');
            done();
          });
          var data = {
            lngLat: { lng: 137.92559401751038, lat: 39.972407560141534 }
          };
          mapWrapper.vm.map.fire('mousedown', data);
          expect(measureWrapper.vm.viewModel.measureNodes.length).toBe(1);
          data = {
            lngLat: { lng: 147.92559401751038, lat: 42.972407560141534 }
          };
          mapWrapper.vm.map.fire('mousemove', data),
          expect(measureWrapper.vm.viewModel.tipHoverDiv.text).toBe('896730.1513 unit.meters');
          // expect(measureWrapper.find('.sm-component-measure__unit.sm-component-measure__default').text()).toBe('米');
          var e = {
            features: [
              {
                id: '786c3dc0b07c96d1ac0d1b72614a3697',
                type: 'Feature',
                properties: {},
                geometry: {
                  coordinates: [[142.93535964243574, 51.313036821416745], [154.00957839243767, 41.405163546980134]],
                  type: 'LineString'
                }
              }
            ]
          };
          mapWrapper.vm.map.fire('draw.create', e);
        } catch (exception) {
          console.log('measure' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });

  it('line mile', done => {
    measureWrapper = mount(SmMeasure, {
      localVue,
      propsData: {
        mapTarget: 'map'
      },
      sync: false
    });
    measureWrapper.vm.$on('loaded', () => {
      try {
        expect(measureWrapper.vm.mapTarget).toBe('map');
        const spychangeMode = jest.spyOn(measureWrapper.vm.viewModel.draw, 'changeMode');
        jest.useFakeTimers();
        measureWrapper.find('i.sm-components-icon-line').trigger('click');
        measureWrapper.vm.$nextTick(() => {
          jest.runOnlyPendingTimers();
          expect(spychangeMode).toBeCalled();
          // change unit
          measureWrapper.find('.ant-select-selection__rendered').trigger('click');

          measureWrapper.vm.$nextTick(() => {
            measureWrapper.find('i.ant-select-arrow-icon').trigger('click');
            measureWrapper.vm.$nextTick(() => {
              measureWrapper
                .findAll('.ant-select-dropdown-menu li')
                .at(1)
                .trigger('click');
              measureWrapper.vm.viewModel.on('measure-finished', measureResult => {
                expect(measureResult.result).toBe('862.5756');
                done();
              });
              var data = {
                lngLat: { lng: 137.92559401751038, lat: 39.972407560141534 }
              };
              mapWrapper.vm.map.fire('mousedown', data);
              expect(measureWrapper.vm.viewModel.measureNodes.length).toBe(1);
              data = {
                lngLat: { lng: 147.92559401751038, lat: 42.972407560141534 }
              };
              mapWrapper.vm.map.fire('mousemove', data),
              expect(measureWrapper.vm.viewModel.tipHoverDiv.text).toBe('557.2023 unit.miles');

              var e = {
                features: [
                  {
                    id: '786c3dc0b07c96d1ac0d1b72614a3697',
                    type: 'Feature',
                    properties: {},
                    geometry: {
                      coordinates: [[142.93535964243574, 51.313036821416745], [154.00957839243767, 41.405163546980134]],
                      type: 'LineString'
                    }
                  }
                ]
              };
              mapWrapper.vm.map.fire('draw.create', e);
            });
          });
        });
      } catch (exception) {
        console.log('measure' + exception.name + ':' + exception.message);
        expect(false).toBeTruthy();
        done();
      }
    });
  });

  it('area default', done => {
    measureWrapper = shallowMount(SmMeasure, {
      localVue,
      propsData: {
        mapTarget: 'map'
      },
      sync: false
    });
    measureWrapper.vm.$on('loaded', () => {
      try {
        expect(measureWrapper.vm.mapTarget).toBe('map');
        const spychangeMode = jest.spyOn(measureWrapper.vm.viewModel.draw, 'changeMode');
        jest.useFakeTimers();
        measureWrapper.find('i.sm-components-icon-polygon').trigger('click');
        measureWrapper.vm.$nextTick(() => {
          jest.runOnlyPendingTimers();
          expect(spychangeMode).toBeCalled();
          measureWrapper.vm.viewModel.on('measure-finished', measureResult => {
            expect(measureResult.result).toBe('1473622.6970');
            done();
          });
          var data = {
            lngLat: { lng: 137.92559401751038, lat: 39.972407560141534 }
          };
          mapWrapper.vm.map.fire('mousedown', data);
          expect(measureWrapper.vm.viewModel.measureNodes.length).toBe(1);
          data = {
            lngLat: { lng: 147.92559401751038, lat: 42.972407560141534 }
          };
          mapWrapper.vm.map.fire('mousemove', data);
          expect(measureWrapper.vm.viewModel.tipHoverDiv.text).toBe('0.0000 unit.squarekilometers');
          mapWrapper.vm.map.fire('mousedown', data);
          data = {
            lngLat: { lng: 149, lat: 48 }
          };
          mapWrapper.vm.map.fire('mousemove', data);
          expect(measureWrapper.vm.viewModel.tipHoverDiv.text).toBe('203361.7948 unit.squarekilometers');
          var e = {
            features: [
              {
                id: 'df9c85399f1f77b19df769345b98f6dd',
                type: 'Feature',
                properties: {},
                geometry: {
                  coordinates: [
                    [
                      [87.38848464248667, 48.80281323462705],
                      [126.93926589247138, 36.451689761316274],
                      [101.62676589247422, 53.169433033115894],
                      [101.62676589247422, 53.169433033115894],
                      [87.38848464248667, 48.80281323462705]
                    ]
                  ],
                  type: 'Polygon'
                }
              }
            ]
          };
          mapWrapper.vm.map.fire('draw.create', e);
        });
      } catch (exception) {
        console.log('measure' + exception.name + ':' + exception.message);
        expect(false).toBeTruthy();
        done();
      }
    });
  });

  it('area mile', done => {
    measureWrapper = mount(SmMeasure, {
      localVue,
      propsData: {
        mapTarget: 'map'
      },
      sync: false
    });
    measureWrapper.vm.$on('loaded', () => {
      try {
        expect(measureWrapper.vm.mapTarget).toBe('map');
        const spychangeMode = jest.spyOn(measureWrapper.vm.viewModel.draw, 'changeMode');
        jest.useFakeTimers();
        measureWrapper.find('i.sm-components-icon-polygon').trigger('click');

        measureWrapper.vm.$nextTick(() => {
          jest.runOnlyPendingTimers();
          expect(spychangeMode).toBeCalled();
          // 分析前修改单位为英里
          measureWrapper.find('.ant-select-selection__rendered').trigger('click');
          measureWrapper.vm.$nextTick(() => {
            measureWrapper.find('i.ant-select-arrow-icon').trigger('click');
            measureWrapper.vm.$nextTick(() => {
              measureWrapper
                .findAll('.ant-select-dropdown-menu li')
                .at(1)
                .trigger('click');

              measureWrapper.vm.viewModel.on('measure-finished', measureResult => {
                expect(measureResult.result).toBe('568818.3610');
                // 得到分析结果后修改单位为千米
                measureWrapper.find('.ant-select-selection__rendered').trigger('click');
                measureWrapper.vm.$nextTick(() => {
                  measureWrapper.find('i.ant-select-arrow-icon').trigger('click');
                  measureWrapper.vm.$nextTick(() => {
                    measureWrapper
                      .findAll('.ant-select-dropdown-menu li')
                      .at(0)
                      .trigger('click');
                    measureWrapper.vm.$nextTick(() => {
                      expect(measureWrapper.vm.viewModel.tipHoverDiv.text).toBe('203361.79475030015 unit.squarekilometers');
                      done();
                    });
                  });
                });
              });

              var data = {
                lngLat: { lng: 137.92559401751038, lat: 39.972407560141534 }
              };
              mapWrapper.vm.map.fire('mousedown', data);
              expect(measureWrapper.vm.viewModel.measureNodes.length).toBe(1);
              data = {
                lngLat: { lng: 147.92559401751038, lat: 42.972407560141534 }
              };
              mapWrapper.vm.map.fire('mousemove', data);
              expect(measureWrapper.vm.viewModel.tipHoverDiv.text).toBe('0.0000 unit.squaremiles');
              mapWrapper.vm.map.fire('mousedown', data);
              data = {
                lngLat: { lng: 149, lat: 48 }
              };
              mapWrapper.vm.map.fire('mousemove', data);
              expect(measureWrapper.vm.viewModel.tipHoverDiv.text).toBe('78497.6528 unit.squaremiles');

              var e = {
                features: [
                  {
                    id: 'df9c85399f1f77b19df769345b98f6dd',
                    type: 'Feature',
                    properties: {},
                    geometry: {
                      coordinates: [
                        [
                          [87.38848464248667, 48.80281323462705],
                          [126.93926589247138, 36.451689761316274],
                          [101.62676589247422, 53.169433033115894],
                          [101.62676589247422, 53.169433033115894],
                          [87.38848464248667, 48.80281323462705]
                        ]
                      ],
                      type: 'Polygon'
                    }
                  }
                ]
              };
              mapWrapper.vm.map.fire('draw.create', e);
            });
          });
        });
      } catch (exception) {
        console.log('measure' + exception.name + ':' + exception.message);
        expect(false).toBeTruthy();
        done();
      }
    });
  });
});
