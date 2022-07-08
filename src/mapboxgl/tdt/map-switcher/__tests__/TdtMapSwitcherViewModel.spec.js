import TdtMapSwitcherViewModel from '../TdtMapSwitcherViewModel';

describe('TdtMapSwitcherViewModel', () => {
  let viewModel;

  const mapMockFn = jest.fn().mockImplementation((initLayers, initSources) => {
    const layers = [].concat(initLayers);
    const sources = Object.assign({}, initSources);
    return {
      getStyle: jest.fn(() => {
        return {
          layers: [].concat(layers),
          sources: Object.assign({}, sources)
        };
      }),
      getCRS: jest.fn(() => {
        return {
          epsgCode: 'EPSG:4326'
        };
      }),
      addLayer: jest.fn(layer => {
        layers.push(layer);
      }),
      removeLayer: jest.fn(layerId => {
        const matchIndex = layers.find(item => item.id == layerId);
        layers.splice(matchIndex, 1);
      }),
      addSource: jest.fn((sourceId, sourceData) => {
        sources[sourceId] = sourceData;
      }),
      removeSource: jest.fn((sourceId) => {
        delete sources[sourceId];
      })
    };
  });

  beforeEach(() => {
    viewModel = new TdtMapSwitcherViewModel('1d109683f4d84198e37a38c442d68311');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    viewModel = null;
  });

  it('test addLayer and restLayer', done => {
    const initLayers = [
      {
        id: 'China_4326',
        type: 'raster',
        source: 'China_4326',
        minzoom: 0,
        maxzoom: 22,
        layout: {
          visibility: 'visible'
        }
      }
    ];
    const initSources = {
      China_4326: {
        type: 'raster',
        tiles: ['http://fakeiportal.supermap.io/portalproxy/iserver/services/map-china400/rest/maps/China_4326'],
        tileSize: 256,
        rasterSource: 'iserver',
        prjCoordSys: {
          epsgCode: '4326'
        },
        proxy: null
      }
    };
    viewModel.setMap({
      map: mapMockFn(initLayers, initSources)
    });
    expect(viewModel.map.getStyle().layers).toEqual(initLayers);
    expect(viewModel.map.getStyle().sources).toEqual(initSources);
    viewModel.changeBaseLayer('vec');
    expect(viewModel.map.getStyle().layers).not.toEqual(initLayers);
    expect(viewModel.map.getStyle().sources).not.toEqual(initLayers);
    expect(viewModel.map.getStyle().layers.length).toBe(2);
    expect(viewModel.originMapData).not.toBeNull();
    expect(viewModel.originMapData.layers).toEqual(initLayers);
    expect(viewModel.originMapData.sources).toEqual(initSources);
    viewModel.resetMapData();
    expect(viewModel.map.getStyle().layers).toEqual(initLayers);
    expect(viewModel.map.getStyle().sources).toEqual(initSources);
    expect(viewModel.map.getStyle().layers.length).toBe(1);
    expect(viewModel.originMapData).toBeNull();
    done();
  });
});
