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
      }
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
    expect(viewModel.cacheIServerMaps[nodeKey]).toBeUndefined();
    viewModel.addIServerLayer(tileUrl, nodeKey);
    expect(viewModel.cacheIServerMaps[nodeKey]).toBeTruthy();
    expect(viewModel.map.addLayer).toHaveBeenCalledTimes(1);
    viewModel.addIServerLayer(tileUrl, nodeKey);
    expect(viewModel.map.addLayer).toHaveBeenCalledTimes(1);
    viewModel.removed();
    expect(viewModel.cacheIServerMaps[nodeKey]).toBeUndefined();
  });

  it('addMapStyle and remove', () => {
    const nodeKey = 'key1';
    const style = {
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
    };
    expect(viewModel.cacheIServerMaps[nodeKey]).toBeUndefined();
    viewModel.addMapStyle(style, nodeKey);
    expect(viewModel.cacheIServerMaps[nodeKey]).toEqual([{ layerId: 'simple-tiles', sourceId: 'iserver-tiles' }]);
    expect(viewModel.map.addLayer).toHaveBeenCalledTimes(1);
    viewModel.addMapStyle(style, nodeKey);
    expect(viewModel.map.addLayer).toHaveBeenCalledTimes(1);
    viewModel.removed();
    expect(viewModel.cacheIServerMaps[nodeKey]).toBeUndefined();
    viewModel.addMapStyle({}, nodeKey);
    expect(viewModel.cacheIServerMaps[nodeKey]).toEqual([]);
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
  })
});
