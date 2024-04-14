import { mount } from '@vue/test-utils';
import SmWebMap from '../../../WebMap';
import SmMeasure from '../Measure';
import mockFetch from 'vue-iclient/test/unit/mocks/FetchRequest';
import uniqueLayer_point from 'vue-iclient/test/unit/mocks/data/WebMap/uniqueLayer_point';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded.js';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap';

jest.mock('@libs/mapbox-gl-draw/mapbox-gl-draw', () => require('@mocks/mapboxgl_draw').MapboxDraw);

describe('measure', () => {
  let mapWrapper;
  let measureWrapper;

  beforeEach(async () => {
    mapWrapper = await createEmptyMap();
  });

  afterEach(() => {
    jest.resetAllMocks();
    if (measureWrapper) {
      measureWrapper.destroy();
    }
    if (mapWrapper) {
      mapWrapper.destroy();
    }
  });

  it('line default', async done => {
    measureWrapper = mount(SmMeasure, {
      propsData: {
        mapTarget: 'map',
        mode: 'line',
        position: 'top-left',
        collapsed: false
      }
    });
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_point
    };
    mockFetch(fetchResource);
    const spychangeMode = jest.spyOn(measureWrapper.vm, 'changeMeasureMode');
    expect(measureWrapper.vm.mapTarget).toBe('map');
    await mapSubComponentLoaded(measureWrapper);
    jest.useFakeTimers();
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
        features: [
          {
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
          }
        ]
      };
      mapWrapper.vm.map.fire('draw.create', e1);
      done();
    } catch (exception) {
      console.log('measure' + exception.name + ':' + exception.message);
      expect(false).toBeTruthy();
      done();
    }
  });

  it('line change defaultUnit',async done => {
    measureWrapper = mount(SmMeasure, {
      propsData: {
        mapTarget: 'map',
        mode: 'line',
        position: 'top-left',
        collapsed: false,
        distanceDefaultUnit: 'kilometers'
      },
      sync: false
    });
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_point
    };
    mockFetch(fetchResource);
    expect(measureWrapper.vm.mapTarget).toBe('map');
    await mapSubComponentLoaded(measureWrapper);
    jest.useFakeTimers();
    expect(measureWrapper.vm.mapTarget).toBe('map');
    expect(measureWrapper.findAll('.sm-component-select-selection-selected-value').at(0).text()).toBe('kilometers');
    const spychangeMode = jest.spyOn(measureWrapper.vm.viewModel.draw, 'changeMode');
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
      mapWrapper.vm.map.fire('mousedown', data1);
      expect(measureWrapper.vm.viewModel.tipHoverDiv.text).toBe('896.7302 unit.kilometers');
      let data2 = {
        lngLat: {
          lng: 157.92559401751038,
          lat: 49.972407560141534
        }
      };
      mapWrapper.vm.map.fire('mousemove', data2);
      expect(measureWrapper.vm.viewModel.measureNodes.length).toBe(2);
      expect(measureWrapper.vm.viewModel.tipHoverDiv.text).toBe('1986.8538 unit.kilometers');
      await measureWrapper.setProps({
        mapTarget: 'map',
        mode: 'line',
        position: 'top-left',
        collapsed: false,
        distanceDefaultUnit: 'meters'
      })
      expect(measureWrapper.vm.distanceDefaultUnit).toBe('meters');
      expect(measureWrapper.vm.viewModel.tipHoverDiv.text).toBe('1986.8538 unit.kilometers');
      let e = {
        features: [
          {
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
          }
        ]
      };
      mapWrapper.vm.map.fire('draw.create', e);
      await measureWrapper.vm.clear();
      expect(measureWrapper.vm.viewModel.measureNodes.length).toBe(0);
      done();
    } catch (exception) {
      console.log('measure' + exception.name + ':' + exception.message);
      expect(false).toBeTruthy();
      done();
    }
  });

  it('area default', async done => {
    measureWrapper = mount(SmMeasure, {
      propsData: {
        mapTarget: 'map',
        areaDefaultUnit: 'meters'
      },
      sync: false
    });
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_point
    };
    mockFetch(fetchResource);
    await mapSubComponentLoaded(measureWrapper);
    try {
      expect(measureWrapper.vm.mapTarget).toBe('map');
      await measureWrapper.setProps({
        mapTarget: 'map',
        areaDefaultUnit: 'kilometers'
      })
      expect(measureWrapper.vm.activeAreaUnit).toBe('kilometers');
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
        done();
      });
    } catch (exception) {
      console.log('measure' + exception.name + ':' + exception.message);
      expect(false).toBeTruthy();
      done();
    }
  });
});
