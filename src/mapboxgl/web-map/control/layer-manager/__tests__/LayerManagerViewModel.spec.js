import LayerManagerViewModel from '../LayerManagerViewModel';

describe('LayerManagerViewModel', () => {
  let viewModel;
  beforeEach(() => {
    viewModel = new LayerManagerViewModel();
    viewModel.map = {
      addLayer: jest.fn(),
      addSource: jest.fn(),
      getLayer: () => true,
      removeLayer: jest.fn(),
      removeSource: jest.fn(),
      getCRS: () => {
        return {
          epsgCode: 'EPSG:4326'
        };
      },
      getSource: id => {
        if (id === 'iserver-tiles') {
          return true;
        }
        return false;
      },
      getLayer: id => {
        if (id === 'simple-tiles') {
          return true;
        }
        return false;
      },
      getBounds: () => {
        return {
          toArray: () => [
            [0, 0],
            [0, 0]
          ]
        };
      },
      getCenter: () => {
        return {
          toArray: () => [0, 0]
        };
      },
      getZoom: jest.fn(),
      getStyle: () => {
        return {
          layers: []
        };
      },
      overlayLayersManager: {}
    };
  });

  afterEach(() => {
    viewModel = null;
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('addIServerLayer and remove', () => {
    const nodeKey = 'key1';
    const tileUrl = 'http://fake.tileurl';
    const spy = jest.spyOn(viewModel, 'addLayer');
    expect(viewModel.cacheMaps[nodeKey]).toBeUndefined();
    viewModel.addIServerLayer(tileUrl, nodeKey);
    const webmap = viewModel.cacheMaps[nodeKey];
    expect(viewModel.cacheMaps[nodeKey]).toBeTruthy();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(viewModel.map.getZoom).toHaveBeenCalledTimes(1);
    viewModel.addIServerLayer(tileUrl, nodeKey);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(viewModel.map.getZoom).toHaveBeenCalledTimes(2);
    expect(viewModel.cacheMaps[nodeKey]).toEqual(webmap);
    viewModel.removed();
    expect(viewModel.cacheMaps[nodeKey]).toBeUndefined();
  });

  it('addMapStyle and remove', () => {
    const nodeKey = 'key1';
    const mapOptions = {
      style: {
        version: 8,
        sources: {
          'iserver-tiles': {
            type: 'raster',
            tiles: ['https://iserver.supermap.io/iserver/services/map-china400/rest/maps/China'],
            tileSize: 256,
            prjCoordSys: { epsgCode: 3857 },
            rasterSource: 'iserver',
            proxy: null
          }
        },
        layers: [{ id: 'simple-tiles', type: 'raster', source: 'iserver-tiles', minzoom: 0, maxzoom: 22 }]
      }
    };
    const spy = jest.spyOn(viewModel, 'addLayer');
    expect(viewModel.cacheMaps[nodeKey]).toBeUndefined();
    viewModel.addMapStyle(mapOptions, nodeKey);
    const webmap = viewModel.cacheMaps[nodeKey];
    expect(viewModel.cacheMaps[nodeKey]).toBeTruthy();
    expect(spy).toHaveBeenCalledTimes(1);
    viewModel.addMapStyle(mapOptions, nodeKey);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(viewModel.cacheMaps[nodeKey]).toEqual(webmap);
    viewModel.removed();
    expect(viewModel.cacheMaps[nodeKey]).toBeUndefined();
  });

  it('addLayer and remove', () => {
    let nodeKey = 'key1';
    const data = { nodeKey, mapId: 123, serviceUrl: 'http://fakeservice' };
    expect(viewModel.cacheMaps[nodeKey]).toBeUndefined();
    viewModel.addLayer(data);
    expect(viewModel.cacheMaps[nodeKey]).not.toBeUndefined();
    expect(viewModel.readyNext).toBeFalsy();
    viewModel.cacheMaps[nodeKey].triggerEvent('addlayerssucceeded', {});
    expect(viewModel.readyNext).toBeTruthy();
    nodeKey = 'key2';
    data.nodeKey = nodeKey;
    viewModel.readyNext = false;
    viewModel.addLayer(data);
    expect(viewModel.mapQuene.length).toBe(1);
    expect(viewModel.mapQuene[0].nodeKey).toBe(nodeKey);
    data.nodeKey = nodeKey;
    viewModel.readyNext = false;
    viewModel.addLayer(data);
    expect(viewModel.mapQuene.length).toBe(1);
    expect(viewModel.mapQuene[0].nodeKey).toBe(nodeKey);
  });

  it('removeLayerLoop', () => {
    const layers = [
      {
        mapInfo: { serverUrl: 'https://fakeiportal.supermap.io/iportal', mapId: '801571284' },
        title: '民航数据-单值'
      },
      {
        mapInfo: { serverUrl: 'https://fakeiserver.supermap.io/iserver' },
        title: '机场数据'
      },
      {
        mapInfo: {
          mapOptions: {
            style: {
              version: 8,
              sources: {
                'iserver-tiles': {
                  type: 'raster',
                  tiles: ['https://iserver.supermap.io/iserver/services/map-china400/rest/maps/China'],
                  tileSize: 256,
                  prjCoordSys: { epsgCode: 3857 },
                  rasterSource: 'iserver',
                  proxy: null
                }
              },
              layers: [{ id: 'simple-tiles', type: 'raster', source: 'iserver-tiles', minzoom: 0, maxzoom: 22 }]
            }
          }
        }
      }
    ];
    expect(() => {
      viewModel.removeLayerLoop(layers[0]);
    }).not.toThrow();
    expect(() => {
      viewModel.removeLayerLoop(layers[1]);
    }).not.toThrow();
    expect(() => {
      viewModel.removeLayerLoop(layers[2]);
    }).not.toThrow();
  });

  it('layersadded', (done) => {
    let nodeKey = 'key1';
    const data = { nodeKey, mapId: 123, serviceUrl: 'http://fakeservice' };
    expect(viewModel.cacheMaps[nodeKey]).toBeUndefined();
    viewModel.addLayer(data);
    expect(viewModel.cacheMaps[nodeKey]).not.toBeUndefined();
    expect(viewModel.readyNext).toBeFalsy();
    const layersAddedFn = jest.fn();
    viewModel.on('layersadded', layersAddedFn);
    viewModel.cacheMaps[nodeKey].triggerEvent('addlayerssucceeded', {});
    expect(viewModel.readyNext).toBeTruthy();
    expect(layersAddedFn).toHaveBeenCalledTimes(1);
    done();
  });

  it('layersremoved', (done) => {
    const layers = [
      {
        mapInfo: { serverUrl: 'https://fakeiportal.supermap.io/iportal', mapId: '801571284' },
        title: '民航数据-单值'
      }
    ];
    const layersRemovedFn = jest.fn();
    viewModel.on('layersremoved', layersRemovedFn);
    viewModel.removeLayerLoop(layers[0]);
    expect(layersRemovedFn).toHaveBeenCalledTimes(1);
    done();
  });
});

