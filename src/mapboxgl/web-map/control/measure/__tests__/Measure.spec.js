import {
  config,
  mount,
  createLocalVue
} from '@vue/test-utils';
import SmWebMap from '../../../WebMap';
import SmMeasure from '../Measure';
import mapEvent from '@types_mapboxgl/map-event';
import drawEvent from '@types_mapboxgl/draw-event';
import {
  Icon,
  Card,
  Collapse,
  Checkbox,
  Select,
  Spin
} from 'ant-design-vue';

config.stubs.transition = false;
const localVue = createLocalVue();
localVue.use(Card);
localVue.use(Collapse);
localVue.use(Icon);
localVue.use(Checkbox);
localVue.use(Select);
localVue.use(Spin);

jest.mock('@libs/mapbox-gl-draw/mapbox-gl-draw', () => require('@mocks/mapboxgl_draw').MapboxDraw);

describe('mesure', () => {
  let mapWrapper = null;
  let measureWrapper = null;
  beforeEach(() => {
    mapEvent.firstMapTarget = null;
    mapEvent.$options.mapCache = {};
    mapEvent.$options.webMapCache = {};
    mapWrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
      }
    })
  });

  afterEach(() => {
    jest.resetModules();
    if (measureWrapper) {
      measureWrapper.destroy();
    }
    if (mapWrapper) {
      mapWrapper.destroy();
    }
  });

  it('line default', done => {
    measureWrapper = mount(SmMeasure, {
      localVue,
      propsData: {
        mapTarget: 'map',
        mode: 'line',
        position: 'top-left',
        collapsed: false
      },
      sync: false
    });
    mapWrapper.vm.$on('load', () => {
      const spychangeMode = jest.spyOn(measureWrapper.vm, 'changeMeasureMode');
      expect(measureWrapper.vm.mapTarget).toBe('map');
      jest.useFakeTimers();
      measureWrapper.vm.$on('loaded', () => {
        expect(measureWrapper.find('.sm-component-measure').exists()).toBe(true);
        try {
          measureWrapper.find('.sm-component-measure__modeIcon').find('i.sm-components-icon-line').trigger('click');
          jest.runOnlyPendingTimers();
          expect(spychangeMode).toBeCalled();
          let data = {
            lngLat: {
              lng: 137.92559401751038,
              lat: 39.972407560141534
            }
          };
          mapWrapper.vm.map.fire('mousedown', data);
          expect(measureWrapper.vm.viewModel.measureNodes.length).toBe(1);
          let data1 = {
            lngLat: {
              lng: 147.92559401751038,
              lat: 42.972407560141534
            }
          };
          mapWrapper.vm.map.fire('mousemove', data1),
            expect(measureWrapper.vm.viewModel.tipHoverDiv.text).toBe('896.7302 unit.kilometers');

          let e1 = {
            features: [{
              id: '786c3dc0b07c96d1ac0d1b72614a3697',
              type: 'Feature',
              properties: {},
              geometry: {
                coordinates: [
                  [142.93535964243574, 51.313036821416745],
                  [154.00957839243767, 41.405163546980134]
                ],
                type: 'LineString'
              }
            }]
          };
          mapWrapper.vm.map.fire('draw.create', e1);
          done();
        } catch (exception) {
          console.log('measure' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });

  it('line change defaultUnit', done => {
    measureWrapper = mount(SmMeasure, {
      localVue,
      propsData: {
        mapTarget: 'map',
        mode: 'line',
        position: 'top-left',
        collapsed: false,
        distanceDefaultUnit: 'meters',

      },
      sync: false
    });
    done()
    mapWrapper.vm.$on('load', () => {
      measureWrapper.vm.$on('loaded', () => {
        expect(measureWrapper.vm.mapTarget).toBe('map');
        expect(measureWrapper.findAll('.sm-component-select-selection-selected-value').at(0).text()).toBe('meters');
        const spychangeMode = jest.spyOn(measureWrapper.vm.viewModel.draw, 'changeMode');
        jest.useFakeTimers();
        measureWrapper.find('i.sm-components-icon-line').trigger('click');
        try {
          jest.runOnlyPendingTimers();
          expect(spychangeMode).toBeCalled();

          let data = {
            lngLat: {
              lng: 137.92559401751038,
              lat: 39.972407560141534
            }
          };
          mapWrapper.vm.map.fire('mousedown', data);
          expect(measureWrapper.vm.viewModel.measureNodes.length).toBe(1);
          let data1 = {
            lngLat: {
              lng: 147.92559401751038,
              lat: 42.972407560141534
            }
          };
          mapWrapper.vm.map.fire('mousemove', data1),
            expect(measureWrapper.vm.viewModel.tipHoverDiv.text).toBe('896730.1513 unit.meters');
          let e = {
            features: [{
              id: '786c3dc0b07c96d1ac0d1b72614a3697',
              type: 'Feature',
              properties: {},
              geometry: {
                coordinates: [
                  [142.93535964243574, 51.313036821416745],
                  [154.00957839243767, 41.405163546980134]
                ],
                type: 'LineString'
              }
            }]
          };
          mapWrapper.vm.map.fire('draw.create', e);
          done();
        } catch (exception) {
          console.log('measure' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });


  // sm-component-select-selection-selected-value
  it('area default', done => {
    measureWrapper = mount(SmMeasure, {
      localVue,
      propsData: {
        mapTarget: 'map'
      },
      sync: false
    });
    done();
    measureWrapper.vm.$on('loaded', () => {
      try {
        expect(measureWrapper.vm.mapTarget).toBe('map');
        const spychangeMode = jest.spyOn(measureWrapper.vm.viewModel.draw, 'changeMode');
        jest.useFakeTimers();
        measureWrapper.find('i.sm-components-icon-ploygon').trigger('click');
        measureWrapper.vm.$nextTick(() => {
          jest.runOnlyPendingTimers();
          expect(spychangeMode).toBeCalled();
          let data = {
            lngLat: {
              lng: 137.92559401751038,
              lat: 39.972407560141534
            }
          };
          mapWrapper.vm.map.fire('mousedown', data);
          expect(measureWrapper.vm.viewModel.measureNodes.length).toBe(1);
          let data1 = {
            lngLat: {
              lng: 147.92559401751038,
              lat: 42.972407560141534
            }
          };
          mapWrapper.vm.map.fire('mousemove', data1);
          expect(measureWrapper.vm.viewModel.tipHoverDiv.text).toBe('0.0000 unit.squarekilometers');
          mapWrapper.vm.map.fire('mousedown', data1);
          let data2 = {
            lngLat: {
              lng: 149,
              lat: 48
            }
          };
          mapWrapper.vm.map.fire('mousemove', data2);
          expect(measureWrapper.vm.viewModel.tipHoverDiv.text).toBe('203361.7948 unit.squarekilometers');
          let e = {
            features: [{
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
            }]
          };
          mapWrapper.vm.map.fire('draw.create', e);
          done();
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
        mapTarget: 'map',
        distanceDefaultUnit: 'mile',
      },
      sync: false
    });
    done();
    measureWrapper.vm.$on('loaded', () => {
      try {
        expect(measureWrapper.vm.mapTarget).toBe('map');
        const spychangeMode = jest.spyOn(measureWrapper.vm.viewModel.draw, 'changeMode');
        jest.useFakeTimers();
        measureWrapper.find('i.sm-components-icon-ploygon').trigger('click');
        measureWrapper.vm.$nextTick(() => {
          jest.runOnlyPendingTimers();
          expect(spychangeMode).toBeCalled();

          let data = {
            lngLat: {
              lng: 137.92559401751038,
              lat: 39.972407560141534
            }
          };
          mapWrapper.vm.map.fire('mousedown', data);
          expect(measureWrapper.vm.viewModel.measureNodes.length).toBe(1);
          let data1 = {
            lngLat: {
              lng: 147.92559401751038,
              lat: 42.972407560141534
            }
          };
          mapWrapper.vm.map.fire('mousemove', data1);
          expect(measureWrapper.vm.viewModel.tipHoverDiv.text).toBe('0.0000 unit.squarekilometers');
          mapWrapper.vm.map.fire('mousedown', data4);
          let data2 = {
            lngLat: {
              lng: 149,
              lat: 48
            }
          };
          mapWrapper.vm.map.fire('mousemove', data2);
          expect(measureWrapper.vm.viewModel.tipHoverDiv.text).toBe('203361.7948 unit.squarekilometers');

          let e = {
            features: [{
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
            }]
          };
          mapWrapper.vm.map.fire('draw.create', e);
          done()
        });
      } catch (exception) {
        console.log('measure' + exception.name + ':' + exception.message);
        expect(false).toBeTruthy();
        done();
      }
    });
  });
});