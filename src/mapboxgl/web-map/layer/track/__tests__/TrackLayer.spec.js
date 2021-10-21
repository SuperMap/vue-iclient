import { mount } from '@vue/test-utils';
import SmTrackLayer from '../TrackLayer.vue';
import SmWebMap from '../../../WebMap.vue';
import mapEvent from '@types_mapboxgl/map-event';
import '@libs/mapboxgl/mapbox-gl-enhance';

describe('TrackLayer.vue', () => {
  let wrapper;
  let mapWrapper;
  beforeEach(() => {
    mapEvent.firstMapTarget = null;
    mapEvent.$options.mapCache = {};
    mapEvent.$options.webMapCache = {};
    mapWrapper = mount(SmWebMap, {
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
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
    wrapper = mount(SmTrackLayer, {
      propsData: {
        layerId: 'TrackLayer111',
        mapTarget: 'map'
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          expect(wrapper.vm.layerId).toBe('TrackLayer111');
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

  it('set loaderType', done => {
    wrapper = mount(SmTrackLayer, {
      propsData: {
        layerId: 'TrackLayer111',
        mapTarget: 'map'
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          wrapper.setProps({
            loaderType: 'OBJ2'
          });
          expect(wrapper.vm.loaderType).toBe('OBJ2');
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

  it('set url', done => {
    const newUrl = 'fakeurl/data/track-layer/car.obj';
    wrapper = mount(SmTrackLayer, {
      propsData: {
        layerId: 'TrackLayer111',
        mapTarget: 'map'
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          wrapper.setProps({
            url: newUrl
          });
          expect(wrapper.vm.url).toBe(newUrl);
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

  it('set url width loadertype', done => {
    const newUrl = 'fakeurl/data/track-layer/car.obj';
    wrapper = mount(SmTrackLayer, {
      propsData: {
        layerId: 'TrackLayer111',
        mapTarget: 'map',
        loaderType: 'IMAGE'
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          wrapper.setProps({
            url: newUrl
          });
          expect(wrapper.vm.url).toBe(newUrl);
          expect(wrapper.vm.mapTarget).toBe('map');
          setTimeout(() => {
            done();
          }, 2000);
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });

  it('set displayLine', done => {
    wrapper = mount(SmTrackLayer, {
      propsData: {
        layerId: 'TrackLayer111',
        mapTarget: 'map'
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          wrapper.setProps({
            displayLine: 'All'
          });
          expect(wrapper.vm.displayLine).toBe('All');
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

  it('set trackPoints', done => {
    wrapper = mount(SmTrackLayer, {
      propsData: {
        layerId: 'TrackLayer111',
        mapTarget: 'map'
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          wrapper.setProps({
            trackPoints: [
              {
                geometry: {
                  type: 'Point',
                  coordinates: [122, 53]
                },
                properties: {
                  SmID: '1'
                },
                type: 'Feature'
              }
            ]
          });
          expect(wrapper.vm.trackPoints.length).toBe(1);
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

  it('set position', done => {
    wrapper = mount(SmTrackLayer, {
      propsData: {
        layerId: 'TrackLayer111',
        mapTarget: 'map'
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          wrapper.setProps({
            position: {
              prevTimestamp: null,
              currentTimestamp: 1599810915000,
              nextTimestamp: 1599810920000,
              step: 3000
            }
          });
          expect(wrapper.vm.position.step).toBe(3000);
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

  it('set layerStyle', done => {
    wrapper = mount(SmTrackLayer, {
      propsData: {
        layerId: 'TrackLayer111',
        mapTarget: 'map'
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          wrapper.setProps({
            layerStyle: {
              line: {
                paint: { 'line-color': '#13FF13', 'line-width': 20, 'line-opacity': 0.8 },
                layout: { visibility: 'visible' }
              }
            }
          });
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

  it('set direction', done => {
    wrapper = mount(SmTrackLayer, {
      propsData: {
        layerId: 'TrackLayer111',
        mapTarget: 'map'
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          wrapper.setProps({
            direction: { front: 'x', bottom: '-z' }
          });
          expect(wrapper.vm.direction.front).toBe('x');
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

  it('set unit', done => {
    wrapper = mount(SmTrackLayer, {
      propsData: {
        layerId: 'TrackLayer111',
        mapTarget: 'map'
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          wrapper.setProps({
            unit: 'millimeter'
          });
          expect(wrapper.vm.unit).toBe('millimeter');
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

  it('set scale', done => {
    wrapper = mount(SmTrackLayer, {
      propsData: {
        layerId: 'TrackLayer111',
        mapTarget: 'map'
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          wrapper.setProps({
            scale: 5
          });
          expect(wrapper.vm.scale).toBe(5);
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

  it('set followCamera', done => {
    wrapper = mount(SmTrackLayer, {
      propsData: {
        layerId: 'TrackLayer111',
        mapTarget: 'map'
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          wrapper.setProps({
            followCamera: true
          });
          expect(wrapper.vm.followCamera).toBe(true);
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