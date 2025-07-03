import TdtMapSwitcherViewModel from '../TdtMapSwitcherViewModel';
import * as langUtil from 'vue-iclient/src/common/_lang/index';

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
      removeSource: jest.fn(sourceId => {
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
    let mockOnOptions;
    const webmap = {
      getLayerList: () => layerCatalogs,
      changeItemVisible: jest.fn(),
      un: jest.fn(),
      on: jest.fn(options => {
        mockOnOptions = options;
      })
    };
    viewModel.setMap({
      map: mapMockFn(initLayers, initSources),
      webmap: webmap
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

  it('toggle Label Layer visibility', done => {
    const initLayers = [
      {
        id: '天地图影像底图',
        type: 'raster',
        source: '天地图影像底图',
        minzoom: 0,
        maxzoom: 18
      },
      {
        id: '天地图影像注记',
        type: 'raster',
        source: '天地图影像注记',
        minzoom: 0,
        maxzoom: 18,
        layout: {
          visibility: 'visible'
        }
      }
    ];
    const initSources = {
      天地图影像底图: {
        type: 'raster',
        tiles: [
          'https://t0.tianditu.gov.cn/img_w/wmts?tk=50599c913367188e6c94e872032f4cf1&service=WMTS&request=GetTile&version=1.0.0&style=default&tilematrixSet=w&format=tiles&width=256&height=256&layer=img&tilematrix={z}&tilerow={y}&tilecol={x}',
          'https://t1.tianditu.gov.cn/img_w/wmts?tk=50599c913367188e6c94e872032f4cf1&service=WMTS&request=GetTile&version=1.0.0&style=default&tilematrixSet=w&format=tiles&width=256&height=256&layer=img&tilematrix={z}&tilerow={y}&tilecol={x}',
          'https://t2.tianditu.gov.cn/img_w/wmts?tk=50599c913367188e6c94e872032f4cf1&service=WMTS&request=GetTile&version=1.0.0&style=default&tilematrixSet=w&format=tiles&width=256&height=256&layer=img&tilematrix={z}&tilerow={y}&tilecol={x}',
          'https://t3.tianditu.gov.cn/img_w/wmts?tk=50599c913367188e6c94e872032f4cf1&service=WMTS&request=GetTile&version=1.0.0&style=default&tilematrixSet=w&format=tiles&width=256&height=256&layer=img&tilematrix={z}&tilerow={y}&tilecol={x}',
          'https://t4.tianditu.gov.cn/img_w/wmts?tk=50599c913367188e6c94e872032f4cf1&service=WMTS&request=GetTile&version=1.0.0&style=default&tilematrixSet=w&format=tiles&width=256&height=256&layer=img&tilematrix={z}&tilerow={y}&tilecol={x}',
          'https://t5.tianditu.gov.cn/img_w/wmts?tk=50599c913367188e6c94e872032f4cf1&service=WMTS&request=GetTile&version=1.0.0&style=default&tilematrixSet=w&format=tiles&width=256&height=256&layer=img&tilematrix={z}&tilerow={y}&tilecol={x}',
          'https://t6.tianditu.gov.cn/img_w/wmts?tk=50599c913367188e6c94e872032f4cf1&service=WMTS&request=GetTile&version=1.0.0&style=default&tilematrixSet=w&format=tiles&width=256&height=256&layer=img&tilematrix={z}&tilerow={y}&tilecol={x}',
          'https://t7.tianditu.gov.cn/img_w/wmts?tk=50599c913367188e6c94e872032f4cf1&service=WMTS&request=GetTile&version=1.0.0&style=default&tilematrixSet=w&format=tiles&width=256&height=256&layer=img&tilematrix={z}&tilerow={y}&tilecol={x}'
        ],
        tileSize: 256
      },
      天地图影像注记: {
        type: 'raster',
        tiles: [
          'https://t0.tianditu.gov.cn/cia_w/wmts?tk=50599c913367188e6c94e872032f4cf1&service=WMTS&request=GetTile&version=1.0.0&style=default&tilematrixSet=w&format=tiles&width=256&height=256&layer=cia&tilematrix={z}&tilerow={y}&tilecol={x}',
          'https://t1.tianditu.gov.cn/cia_w/wmts?tk=50599c913367188e6c94e872032f4cf1&service=WMTS&request=GetTile&version=1.0.0&style=default&tilematrixSet=w&format=tiles&width=256&height=256&layer=cia&tilematrix={z}&tilerow={y}&tilecol={x}',
          'https://t2.tianditu.gov.cn/cia_w/wmts?tk=50599c913367188e6c94e872032f4cf1&service=WMTS&request=GetTile&version=1.0.0&style=default&tilematrixSet=w&format=tiles&width=256&height=256&layer=cia&tilematrix={z}&tilerow={y}&tilecol={x}',
          'https://t3.tianditu.gov.cn/cia_w/wmts?tk=50599c913367188e6c94e872032f4cf1&service=WMTS&request=GetTile&version=1.0.0&style=default&tilematrixSet=w&format=tiles&width=256&height=256&layer=cia&tilematrix={z}&tilerow={y}&tilecol={x}',
          'https://t4.tianditu.gov.cn/cia_w/wmts?tk=50599c913367188e6c94e872032f4cf1&service=WMTS&request=GetTile&version=1.0.0&style=default&tilematrixSet=w&format=tiles&width=256&height=256&layer=cia&tilematrix={z}&tilerow={y}&tilecol={x}',
          'https://t5.tianditu.gov.cn/cia_w/wmts?tk=50599c913367188e6c94e872032f4cf1&service=WMTS&request=GetTile&version=1.0.0&style=default&tilematrixSet=w&format=tiles&width=256&height=256&layer=cia&tilematrix={z}&tilerow={y}&tilecol={x}',
          'https://t6.tianditu.gov.cn/cia_w/wmts?tk=50599c913367188e6c94e872032f4cf1&service=WMTS&request=GetTile&version=1.0.0&style=default&tilematrixSet=w&format=tiles&width=256&height=256&layer=cia&tilematrix={z}&tilerow={y}&tilecol={x}',
          'https://t7.tianditu.gov.cn/cia_w/wmts?tk=50599c913367188e6c94e872032f4cf1&service=WMTS&request=GetTile&version=1.0.0&style=default&tilematrixSet=w&format=tiles&width=256&height=256&layer=cia&tilematrix={z}&tilerow={y}&tilecol={x}'
        ],
        tileSize: 256
      }
    };
    const spyOnI18n = jest.spyOn(langUtil, 'geti18n').mockImplementation(() => {
      return {
        tc: (str) => {
          return '天地图影像注记';
        }
      }
    });
    const appreciableLayers = [
      {
        id: '天地图影像底图',
        title: '天地图影像底图',
        type: 'raster',
        visible: true,
        renderSource: {
          id: '天地图影像底图',
          type: 'raster'
        },
        renderLayers: ['天地图影像底图'],
        dataSource: {},
        themeSetting: {},
        layerOrder: 'auto'
      },
      {
        id: '天地图影像注记',
        title: '天地图影像注记',
        type: 'raster',
        visible: true,
        renderSource: {
          id: '天地图影像注记',
          type: 'raster'
        },
        renderLayers: ['天地图影像注记'],
        dataSource: {},
        themeSetting: {},
        layerOrder: 'auto'
      }
    ];
    const webmap = {
      getAppreciableLayers: () => appreciableLayers,
      changeItemVisible: jest.fn(),
      un: jest.fn(),
      on: jest.fn()
    };
    viewModel.setMap({
      map: mapMockFn(initLayers, initSources),
      webmap
    });
    expect(viewModel.map.getStyle().layers).toEqual(initLayers);
    expect(viewModel.map.getStyle().sources).toEqual(initSources);
    viewModel.togglerLabelLayer(true);
    expect(webmap.changeItemVisible.mock.calls).toHaveLength(1);
    expect(webmap.changeItemVisible.mock.calls[0][0]).toEqual(appreciableLayers[1]);
    expect(webmap.changeItemVisible.mock.calls[0][1]).toBe(true);
    expect(spyOnI18n).toBeCalled();
    done();
  });
});

