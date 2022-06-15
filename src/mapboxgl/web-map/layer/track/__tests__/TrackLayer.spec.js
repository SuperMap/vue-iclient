import { mount, config } from '@vue/test-utils';
import SmTrackLayer from '../TrackLayer.vue';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap.js';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded.js';

jest.mock('three/examples/jsm/loaders/GLTFLoader', () => require('@mocks/GLTFLoader'));
jest.mock('wwobjloader2', () => require('@mocks/OBJLoader2'));

describe('TrackLayer.vue', () => {
  let wrapper;
  let mapWrapper;
  const url = 'fakeurl/data/track-layer/track.obj';
  const trackPoints = [
    {
      geometry: {
        type: 'Point',
        coordinates: [122, 53]
      },
      properties: {
        SmID: '1',
        timestamp: 1599810915000
      },
      type: 'Feature'
    },
    {
      geometry: {
        type: 'Point',
        coordinates: [122, 53]
      },
      properties: {
        SmID: '2',
        timestamp: 1599810916000
      },
      type: 'Feature'
    },
    {
      geometry: {
        type: 'Point',
        coordinates: [122, 53]
      },
      properties: {
        SmID: '3',
        timestamp: 1599810917000
      },
      type: 'Feature'
    }
  ];

  beforeAll(async () => {
    config.mapLoad = false;
    mapWrapper = await createEmptyMap();
  })

  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (wrapper) {
      wrapper.destroy();
    }
  });

  afterAll(() => {
    config.mapLoad = true;
    if (mapWrapper) {
      mapWrapper.destroy();
    }
  })

  it('render', async done => {
    wrapper = mount(SmTrackLayer, {
      propsData: {
        layerId: 'TrackLayer111',
        mapTarget: 'map',
        loaderType: 'OBJ2',
        url,
        position: {
          prevTimestamp: 1564454554445,
          currentTimestamp: 1599810900000,
          nextTimestamp: 1599810920000,
          step: 3000
        }
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.loaderType).toBe('OBJ2');
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('set loaderType', async done => {
    wrapper = mount(SmTrackLayer, {
      propsData: {
        layerId: 'TrackLayer111',
        mapTarget: 'map'
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      loaderType: 'OBJ2'
    });
    expect(wrapper.vm.loaderType).toBe('OBJ2');
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('set empty loaderType', async done => {
    wrapper = mount(SmTrackLayer, {
      propsData: {
        layerId: 'TrackLayer111',
        mapTarget: 'map',
        loaderType: 'OBJ2'
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      loaderType: ''
    });
    expect(wrapper.vm.loaderType).toBe('');
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('set url', async done => {
    const newUrl = 'fakeurl/data/track-layer/car.obj';
    wrapper = mount(SmTrackLayer, {
      propsData: {
        layerId: 'TrackLayer111',
        mapTarget: 'map'
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      url: newUrl
    });
    expect(wrapper.vm.url).toBe(newUrl);
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('set empty url', async done => {
    const newUrl = 'fakeurl/data/track-layer/car.obj';
    wrapper = mount(SmTrackLayer, {
      propsData: {
        layerId: 'TrackLayer111',
        mapTarget: 'map',
        url: newUrl
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      url: ''
    });
    expect(wrapper.vm.url).toBe('');
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('set url width loadertype', async done => {
    const newUrl = 'fakeurl/data/track-layer/car.obj';
    wrapper = mount(SmTrackLayer, {
      propsData: {
        layerId: 'TrackLayer111',
        mapTarget: 'map',
        loaderType: 'IMAGE'
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      url: newUrl
    });
    expect(wrapper.vm.url).toBe(newUrl);
    expect(wrapper.vm.mapTarget).toBe('map');
    setTimeout(() => {
      done();
    }, 2000);
  });

  it('set displayLine', async done => {
    wrapper = mount(SmTrackLayer, {
      propsData: {
        layerId: 'TrackLayer111',
        mapTarget: 'map'
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      displayLine: 'All'
    });
    expect(wrapper.vm.displayLine).toBe('All');
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('set trackPoints', async done => {
    wrapper = mount(SmTrackLayer, {
      propsData: {
        layerId: 'TrackLayer111',
        mapTarget: 'map'
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
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
    const setTrackPointsFn = jest.spyOn(wrapper.vm.viewModel, 'setTrackPoints');
    await wrapper.setProps({ trackPoints: undefined });
    expect(setTrackPointsFn).toHaveBeenCalled();
    done();
  });

  it('set matchCurrentPosition position', async done => {
    const newUrl = 'fakeurl/data/track-layer/car.obj';
    wrapper = mount(SmTrackLayer, {
      propsData: {
        layerId: 'TrackLayer111',
        mapTarget: 'map',
        position: {
          prevTimestamp: 1564454554445,
          currentTimestamp: 1599810900000,
          nextTimestamp: 1599810920000,
          step: 3000
        }
        // trackPoints
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      loaderType: 'OBJ2',
      url: newUrl,
      direction: { front: 'x', bottom: '-z' },
      position: {
        prevTimestamp: 1574454554445,
        currentTimestamp: 1599810915000,
        nextTimestamp: 1599810920000,
        step: 3000
      }
    });
    expect(wrapper.vm.position.step).toBe(3000);
    done();
  });

  it('addImageLayer', async done => {
    const newUrl = 'fakeurl/data/track-layer/car.obj';
    wrapper = mount(SmTrackLayer, {
      propsData: {
        layerId: 'TrackLayer111',
        mapTarget: 'map',
        position: {
          prevTimestamp: 1564454554445,
          currentTimestamp: 1599810900000,
          nextTimestamp: 1599810920000,
          step: 3000
        }
        // trackPoints
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      loaderType: 'IMAGE',
      url: newUrl,
      position: {
        prevTimestamp: 1574454554445,
        currentTimestamp: 1599810915000,
        nextTimestamp: 1599810920000,
        step: 3000
      }
    });
    expect(wrapper.vm.position.step).toBe(3000);
    setTimeout(() => {
      done();
    }, 1000);
  });

  it('set matchNextPosition position', async done => {
    wrapper = mount(SmTrackLayer, {
      propsData: {
        layerId: 'TrackLayer111',
        mapTarget: 'map',
        position: {
          prevTimestamp: 1564454554445,
          currentTimestamp: 1599810900000,
          nextTimestamp: 1599810920000,
          step: 3000
        },
        trackPoints: [
          {
            geometry: {
              type: 'Point',
              coordinates: [122, 53]
            },
            properties: {
              SmID: '1',
              timestamp: 1599810914000
            },
            type: 'Feature'
          },
          {
            geometry: {
              type: 'Point',
              coordinates: [122, 53]
            },
            properties: {
              SmID: '2',
              timestamp: 1599810916000
            },
            type: 'Feature'
          },
          {
            geometry: {
              type: 'Point',
              coordinates: [122, 53]
            },
            properties: {
              SmID: '3',
              timestamp: 1599810917000
            },
            type: 'Feature'
          }
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      position: {
        prevTimestamp: 1574454554445,
        currentTimestamp: 1599810915000,
        nextTimestamp: 1599810920000,
        step: 3000
      }
    });
    expect(wrapper.vm.position.step).toBe(3000);
    done();
  });

  it('set layerStyle', async done => {
    wrapper = mount(SmTrackLayer, {
      propsData: {
        layerId: 'TrackLayer111',
        mapTarget: 'map'
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      layerStyle: {
        line: {
          paint: { 'line-color': '#13FF13', 'line-width': 20, 'line-opacity': 0.8 },
          layout: { visibility: 'visible' }
        }
      }
    });
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('set direction', async done => {
    wrapper = mount(SmTrackLayer, {
      propsData: {
        layerId: 'TrackLayer111',
        mapTarget: 'map'
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      direction: { front: 'x', bottom: '-z' }
    });
    expect(wrapper.vm.direction.front).toBe('x');
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('set unit', async done => {
    wrapper = mount(SmTrackLayer, {
      propsData: {
        layerId: 'TrackLayer111',
        mapTarget: 'map'
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      unit: 'millimeter'
    });
    expect(wrapper.vm.unit).toBe('millimeter');
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('set scale', async done => {
    wrapper = mount(SmTrackLayer, {
      propsData: {
        layerId: 'TrackLayer111',
        mapTarget: 'map'
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      scale: 5
    });
    expect(wrapper.vm.scale).toBe(5);
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('set fitBounds', async done => {
    wrapper = mount(SmTrackLayer, {
      propsData: {
        layerId: 'TrackLayer111',
        mapTarget: 'map'
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      fitBounds: true
    });
    expect(wrapper.vm.fitBounds).toBe(true);
    done();
  });

  it('set followCamera', async done => {
    wrapper = mount(SmTrackLayer, {
      propsData: {
        layerId: 'TrackLayer111',
        mapTarget: 'map'
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      followCamera: true
    });
    expect(wrapper.vm.followCamera).toBe(true);
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('set direction front -x bottom x', async done => {
    const newUrl = 'fakeurl/data/track-layer/car.obj';
    wrapper = mount(SmTrackLayer, {
      propsData: {
        layerId: 'TrackLayer111',
        mapTarget: 'map',
        position: {
          prevTimestamp: 1564454554445,
          currentTimestamp: 1599810900000,
          nextTimestamp: 1599810920000,
          step: 3000
        }
        // trackPoints
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      loaderType: 'OBJ2',
      url: newUrl,
      direction: { front: '-x', bottom: 'x' },
      position: {
        prevTimestamp: 1574454554445,
        currentTimestamp: 1599810915000,
        nextTimestamp: 1599810920000,
        step: 3000
      }
    });
    expect(wrapper.vm.position.step).toBe(3000);
    expect(wrapper.vm.direction.front).toBe('-x');
    done();
  });

  it('set direction front y bottom -x', async done => {
    const newUrl = 'fakeurl/data/track-layer/car.obj';
    wrapper = mount(SmTrackLayer, {
      propsData: {
        layerId: 'TrackLayer111',
        mapTarget: 'map',
        position: {
          prevTimestamp: 1564454554445,
          currentTimestamp: 1599810900000,
          nextTimestamp: 1599810920000,
          step: 3000
        }
        // trackPoints
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      loaderType: 'OBJ2',
      url: newUrl,
      direction: { front: 'y', bottom: '-x' },
      position: {
        prevTimestamp: 1574454554445,
        currentTimestamp: 1599810915000,
        nextTimestamp: 1599810920000,
        step: 3000
      }
    });
    expect(wrapper.vm.position.step).toBe(3000);
    expect(wrapper.vm.direction.front).toBe('y');
    done();
  });

  it('set direction front -y bottom x', async done => {
    const newUrl = 'fakeurl/data/track-layer/car.obj';
    wrapper = mount(SmTrackLayer, {
      propsData: {
        layerId: 'TrackLayer111',
        mapTarget: 'map',
        position: {
          prevTimestamp: 1564454554445,
          currentTimestamp: 1599810900000,
          nextTimestamp: 1599810920000,
          step: 3000
        }
        // trackPoints
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      loaderType: 'OBJ2',
      url: newUrl,
      direction: { front: '-y', bottom: 'y' },
      position: {
        prevTimestamp: 1574454554445,
        currentTimestamp: 1599810915000,
        nextTimestamp: 1599810920000,
        step: 3000
      }
    });
    expect(wrapper.vm.position.step).toBe(3000);
    expect(wrapper.vm.direction.front).toBe('-y');
    done();
  });

  it('set direction front z bottom -y', async done => {
    const newUrl = 'fakeurl/data/track-layer/car.obj';
    wrapper = mount(SmTrackLayer, {
      propsData: {
        layerId: 'TrackLayer111',
        mapTarget: 'map',
        position: {
          prevTimestamp: 1564454554445,
          currentTimestamp: 1599810900000,
          nextTimestamp: 1599810920000,
          step: 3000
        }
        // trackPoints
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      loaderType: 'OBJ2',
      url: newUrl,
      direction: { front: 'z', bottom: '-y' },
      position: {
        prevTimestamp: 1574454554445,
        currentTimestamp: 1599810915000,
        nextTimestamp: 1599810920000,
        step: 3000
      }
    });
    expect(wrapper.vm.position.step).toBe(3000);
    expect(wrapper.vm.direction.front).toBe('z');
    done();
  });

  it('set direction front -z bottom z', async done => {
    const newUrl = 'fakeurl/data/track-layer/car.obj';
    wrapper = mount(SmTrackLayer, {
      propsData: {
        layerId: 'TrackLayer111',
        mapTarget: 'map',
        position: {
          prevTimestamp: 1564454554445,
          currentTimestamp: 1599810900000,
          nextTimestamp: 1599810920000,
          step: 3000
        }
        // trackPoints
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      loaderType: 'OBJ2',
      url: newUrl,
      direction: { front: '-z', bottom: 'z' },
      position: {
        prevTimestamp: 1574454554445,
        currentTimestamp: 1599810915000,
        nextTimestamp: 1599810920000,
        step: 3000
      }
    });
    expect(wrapper.vm.position.step).toBe(3000);
    expect(wrapper.vm.direction.front).toBe('-z');
    done();
  });
});
