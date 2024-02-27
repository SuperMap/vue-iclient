import TrackLayerViewModel from '../TrackLayerViewModel.ts';

jest.mock('three/examples/jsm/loaders/GLTFLoader', () => require('@mocks/GLTFLoader'));
jest.mock('wwobjloader2', () => require('@mocks/OBJLoader2'));

describe('TrackLayerViewModel.ts', () => {
  const option = {
    direction: undefined,
    displayLine: undefined,
    fitBounds: true,
    followCamera: undefined,
    layerId: undefined,
    layerStyle: undefined,
    loaderType: 'OBJ2',
    mapTarget: undefined,
    position: {
      currentTimestamp: 1599810915000,
      nextTimestamp: null,
      prevTimestamp: 1599810915000,
      step: 3000
    },
    scale: '1',
    trackPoints: [
      {
        geometry: {
          coordinates: [0, 0],
          type: 'Point'
        },
        properties: {
          timestamp: 1640051713987
        },
        type: 'Feature'
      }
    ],
    unit: 'millimeter',
    url: './static/templates/car/car.obj'
  };

  it('set url to add layer and IMAGE type from mapsource', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const nextOption = {
      ...option,
      loaderType: 'IMAGE',
      followCamera: true
    };
    const viewModel = new TrackLayerViewModel(nextOption);
    viewModel.map = {
      loadImage: (a, b) => {
        let error;
        if (a.indexOf('error') > -1) {
          error = 'loadImage faild';
        } else {
          error = false;
        }
        b(error);
      },
      hasImage: () => undefined,
      project: () => {
        return {
          x: 500,
          y: 300
        };
      },
      getBearing: () => jest.fn(),
      getSource: () => {
        return {
          setData: () => jest.fn()
        };
      },
      easeTo: () => jest.fn()
    };
    const spy = jest.spyOn(viewModel.map, 'getSource');
    viewModel.setUrl('http://test/error');
    expect(errorSpy.mock.calls).toHaveLength(1);
    expect(errorSpy.mock.calls[0][0]).toMatch('loadImage faild');
    errorSpy.mockRestore();
    viewModel.setUrl('http://test');
    expect(spy).toHaveBeenCalled();
  });

  it('set url to add layer with line data and IMAGE type from maploadimage', () => {
    const nextOption = {
      ...option,
      loaderType: 'IMAGE',
      followCamera: true,
      displayLine: 'All'
    };
    const viewModel = new TrackLayerViewModel(nextOption);
    viewModel.map = {
      loadImage: (a, b) => {
        b(false);
      },
      hasImage: () => undefined,
      getBearing: () => jest.fn(),
      getSource: () => undefined,
      easeTo: () => jest.fn(),
      addImage: () => jest.fn(),
      addLayer: () => jest.fn(),
      getLayer: () => jest.fn(),
      addSource: () => jest.fn()
    };
    const spy = jest.spyOn(viewModel.map, 'addLayer');
    viewModel.setUrl('http://test');
    expect(spy).toHaveBeenCalled();
  });

  it('set url to add layer with line data and OBJ2 type and map has image', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const nextOption = {
      ...option,
      loaderType: 'OBJ2',
      fitBounds: false,
      unit: 'centimeter'
    };
    const viewModel = new TrackLayerViewModel(nextOption);
    viewModel.map = {
      getBearing: () => jest.fn(),
      addLayer: layer => {
        const map = {
          getCanvas: () => jest.fn(),
          triggerRepaint: () => jest.fn(),
          getSource: () => {
            return {
              setData: () => jest.fn()
            };
          }
        };
        layer.onAdd(map);
        layer.render();
      },
      getLayer: () => undefined,
      getCRS: () => {
        return {
          extent: [512, 1024, 1536, 2048]
        };
      },
      getZoom: () => 1,
      setZoom: () => jest.fn(),
      setCenter: () => jest.fn(),
      getCanvas: () => {
        return {
          width: 2
        }
      }
    };
    const spy = jest.spyOn(viewModel.map, 'addLayer');
    const timestampInfo = {
      currentTimestamp: 1640051713987,
      nextTimestamp: 1640051713990,
      prevTimestamp: 1640051713987,
      step: 3000
    };
    viewModel.setPosition(timestampInfo);
    expect(errorSpy.mock.calls).toHaveLength(1);
    expect(errorSpy.mock.calls[0][0]).toMatch('An error happened');
    errorSpy.mockRestore();
    expect(spy).toHaveBeenCalled();
  });

  it('set url to add layer with line data and GLTF type and map has image', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const nextOption = {
      ...option,
      loaderType: 'GLTF'
    };
    const viewModel = new TrackLayerViewModel(nextOption);
    viewModel.map = {
      getBearing: () => jest.fn(),
      addLayer: layer => {
        const map = {
          getCanvas: () => jest.fn(),
          getSource: () => {
            return {
              setData: () => jest.fn()
            };
          },
        };
        layer.onAdd(map);
      },
      getLayer: () => undefined,
      getCRS: () => {
        return {
          extent: [512, 1024, 1536, 2048]
        };
      },
      getZoom: () => 1,
      getCanvas: () => {
        return {
          width: 2
        }
      }
    };
    const spy = jest.spyOn(viewModel.map, 'addLayer');
    const timestampInfo = {
      currentTimestamp: 1640051713987,
      nextTimestamp: 1640051713990,
      prevTimestamp: 1640051713987,
      step: 3000
    };
    viewModel.setPosition(timestampInfo);
    expect(errorSpy.mock.calls).toHaveLength(1);
    expect(errorSpy.mock.calls[0][0]).toMatch('An error happened');
    errorSpy.mockRestore();
    expect(spy).toHaveBeenCalled();
  });

  it('request animation frame', () => {
    const nextOption = {
      ...option,
      trackPoints: [
        {
          geometry: {
            coordinates: [0, 0],
            type: 'Point'
          },
          properties: {
            timestamp: 1640051713980
          },
          type: 'Feature'
        },
        {
          geometry: {
            coordinates: [0, 1],
            type: 'Point'
          },
          properties: {
            timestamp: 1640051713987
          },
          type: 'Feature'
        }
      ]
    };
    const viewModel = new TrackLayerViewModel(nextOption);
    const timestampInfo = {
      currentTimestamp: 1640051713980,
      nextTimestamp: 1640051713990,
      prevTimestamp: 1640051713980,
      step: 3000
    };
    viewModel.setPosition(timestampInfo);
    expect(viewModel.animationFrameId).not.toBeNull();
  });

  it('add Track line Layer rotate(-x,x)', () => {
    const nextOption = {
      ...option,
      loaderType: 'OBJ2',
      direction: {
        front: '-x',
        bottom: 'x'
      }
    };
    const viewModel = new TrackLayerViewModel(nextOption);
    viewModel.map = {
      getBearing: () => jest.fn(),
      addLayer: () => jest.fn(),
      getSource: () => undefined,
      addSource: () => jest.fn(),
      getLayer: () => undefined
    };
    const spy = jest.spyOn(viewModel.map, 'addLayer');
    const timestampInfo = {
      currentTimestamp: 1640051713987,
      nextTimestamp: 1640051713990,
      prevTimestamp: 1640051713987,
      step: 3000
    };
    viewModel.setPosition(timestampInfo);
    expect(spy).toHaveBeenCalled();
  });

  it('add Track line Layer rotate(y,-x)', () => {
    const nextOption = {
      ...option,
      loaderType: 'OBJ2',
      direction: {
        front: 'y',
        bottom: '-x'
      }
    };
    const viewModel = new TrackLayerViewModel(nextOption);
    viewModel.map = {
      getBearing: () => jest.fn(),
      addLayer: () => jest.fn(),
      getSource: () => undefined,
      addSource: () => jest.fn(),
      getLayer: () => undefined
    };
    const spy = jest.spyOn(viewModel.map, 'addLayer');
    const timestampInfo = {
      currentTimestamp: 1640051713987,
      nextTimestamp: 1640051713990,
      prevTimestamp: 1640051713987,
      step: 3000
    };
    viewModel.setPosition(timestampInfo);
    expect(spy).toHaveBeenCalled();
  });

  it('add Track line Layer rotate(-y,y)', () => {
    const nextOption = {
      ...option,
      loaderType: 'OBJ2',
      direction: {
        front: '-y',
        bottom: 'y'
      }
    };
    const viewModel = new TrackLayerViewModel(nextOption);
    viewModel.map = {
      getBearing: () => jest.fn(),
      addLayer: () => jest.fn(),
      getSource: () => undefined,
      addSource: () => jest.fn(),
      getLayer: () => undefined
    };
    const spy = jest.spyOn(viewModel.map, 'addLayer');
    const timestampInfo = {
      currentTimestamp: 1640051713987,
      nextTimestamp: 1640051713990,
      prevTimestamp: 1640051713987,
      step: 3000
    };
    viewModel.setPosition(timestampInfo);
    expect(spy).toHaveBeenCalled();
  });

  it('add Track line Layer rotate(z,-y)', () => {
    const nextOption = {
      ...option,
      loaderType: 'OBJ2',
      direction: {
        front: 'z',
        bottom: '-y'
      }
    };
    const viewModel = new TrackLayerViewModel(nextOption);
    viewModel.map = {
      getBearing: () => jest.fn(),
      addLayer: () => jest.fn(),
      getSource: () => undefined,
      addSource: () => jest.fn(),
      getLayer: () => undefined
    };
    const spy = jest.spyOn(viewModel.map, 'addLayer');
    const timestampInfo = {
      currentTimestamp: 1640051713987,
      nextTimestamp: 1640051713990,
      prevTimestamp: 1640051713987,
      step: 3000
    };
    viewModel.setPosition(timestampInfo);
    expect(spy).toHaveBeenCalled();
  });

  it('add Track line Layer rotate(-z,z)', () => {
    const nextOption = {
      ...option,
      loaderType: 'OBJ2',
      direction: {
        front: '-z',
        bottom: 'z'
      }
    };
    const viewModel = new TrackLayerViewModel(nextOption);
    viewModel.map = {
      getBearing: () => jest.fn(),
      addLayer: () => jest.fn(),
      getSource: () => undefined,
      addSource: () => jest.fn(),
      getLayer: () => undefined
    };
    const spy = jest.spyOn(viewModel.map, 'addLayer');
    const timestampInfo = {
      currentTimestamp: 1640051713987,
      nextTimestamp: 1640051713990,
      prevTimestamp: 1640051713987,
      step: 3000
    };
    viewModel.setPosition(timestampInfo);
    expect(spy).toHaveBeenCalled();
  });

  it('to reset lineData', () => {
    const viewModel = new TrackLayerViewModel(option);
    viewModel.reset();
    expect(viewModel.lineData).toEqual([]);
  });
});
