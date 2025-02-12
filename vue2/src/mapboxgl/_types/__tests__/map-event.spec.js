import mapEvent from 'vue-iclient-core/types/map-event';
import mapLegends from 'vue-iclient/test/unit/mocks/data/WebMap/map_legends.json';

describe('map-event-mapboxgl', () => {
  const mapTarget = 'mainWebMap';
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
    mapEvent.deleteWebMap(mapTarget);
  });

  it('webmap changeItemVisible', done => {
    const changeItemVisibleSpy = jest.fn();
    const mainWebMap = {
      changeItemVisible: changeItemVisibleSpy,
      getAppreciableLayers: () => [{ id: 'layer1', renderSource: { id: 'layer1' } }],
      cacheLayerIds: ['layer1']
    };
    const webmap2 = {
      changeItemVisible: changeItemVisibleSpy,
      getAppreciableLayers: () => [{ id: 'layer2', renderSource: { id: 'layer2' } }],
      cacheLayerIds: ['layer2']
    };
    mapEvent.setWebMap(mapTarget, mainWebMap);
    mapEvent.setWebMap(mapTarget, webmap2, 'webmap2');
    let webmap = mapEvent.getWebMap('map');
    expect(webmap).toBeUndefined();
    webmap = mapEvent.getWebMap(mapTarget);
    expect(webmap).not.toBeUndefined();
    expect(webmap.getAppreciableLayers().length).toBe(2);
    webmap.changeItemVisible();
    expect(changeItemVisibleSpy).toHaveBeenCalledTimes(2);
    expect(webmap.cacheLayerIds).toEqual(['layer1']);
    done();
  });

  it('webmap setLayersVisible', done => {
    const spyFn = jest.fn();
    const mainWebMap = {
      setLayersVisible: spyFn,
      getAppreciableLayers: () => [{ id: 'layer1', renderSource: { id: 'layer1' } }],
      cacheLayerIds: ['layer1']
    };
    const webmap2 = {
      setLayersVisible: spyFn,
      getAppreciableLayers: () => [{ id: 'layer2', renderSource: { id: 'layer2' } }],
      cacheLayerIds: ['layer2']
    };
    const webmap3 = {
      setLayersVisible: spyFn,
      getAppreciableLayers: () => [
        { id: 'layer1', renderSource: { id: 'layer1' }, reused: true },
        { id: 'layer3', renderSource: { id: 'layer3' } }
      ],
      cacheLayerIds: ['layer1', 'layer3']
    };
    mapEvent.setWebMap(mapTarget, mainWebMap);
    mapEvent.setWebMap(mapTarget, webmap2, 'webmap2');
    mapEvent.setWebMap(mapTarget, webmap3, 'webmap3');
    let webmap = mapEvent.getWebMap('map');
    expect(webmap).toBeUndefined();
    webmap = mapEvent.getWebMap(mapTarget);
    expect(webmap).not.toBeUndefined();
    expect(webmap.getAppreciableLayers().length).toBe(3);
    webmap.setLayersVisible();
    expect(spyFn).toHaveBeenCalledTimes(3);
    expect(webmap.cacheLayerIds).toEqual(['layer1']);
    done();
  });

  it('webmap getAppreciableLayers', done => {
    const mainWebMap = {
      getAppreciableLayers: () => [{ id: 'layer1', renderSource: { id: 'source1' } }]
    };
    const webmap2 = {
      getAppreciableLayers: () => [{ id: 'layer2', renderSource: { id: 'source1' } }]
    };
    mapEvent.setWebMap(mapTarget, mainWebMap);
    mapEvent.setWebMap(mapTarget, webmap2, 'webmap2');
    const webmap = mapEvent.getWebMap(mapTarget);
    const layers = webmap.getAppreciableLayers();
    expect(layers.length).toBe(1);
    expect(layers[0]).toEqual(webmap2.getAppreciableLayers()[0]);
    done();
  });

  it('webmap getLayerList', done => {
    const mainWebMap = {
      getLayerList: () => [
        { id: 'layer1', renderSource: { id: 'source1' }, renderLayers: ['layer1'] },
        { id: 'layer1-label', renderSource: { id: 'source1' }, renderLayers: ['layer1-label'] },
        { id: 'layer5', renderSource: { id: 'source5' } },
        {
          id: 'layer3',
          type: 'group',
          children: [{ id: 'sourceLayer', renderSource: { id: 'source2', sourceLayer: 'sourceLayer2' } }]
        }
      ]
    };
    const webmap2 = {
      getLayerList: () => [
        { id: 'layer1', renderSource: { id: 'source1' }, renderLayers: ['layer1', 'layer1-label'] },
        {
          id: 'layer2',
          renderSource: {},
          type: 'group',
          children: [{ id: 'sourceLayer', renderSource: { id: 'source2', sourceLayer: 'sourceLayer' } }]
        },
        {
          id: 'layer4',
          renderSource: {},
          type: 'group',
          children: [{ id: 'sourceLayer4', renderSource: { id: 'source2', sourceLayer: 'sourceLayer4' } }]
        }
      ]
    };
    mapEvent.setWebMap(mapTarget, mainWebMap);
    mapEvent.setWebMap(mapTarget, webmap2, 'webmap2');
    const webmap = mapEvent.getWebMap(mapTarget);
    const layerList = webmap.getLayerList();
    expect(layerList.length).toBe(4);
    expect(layerList[0]).toEqual(webmap2.getLayerList()[0]);
    done();
  });

  it('webmap getLegendInfo', done => {
    const mainWebMap = {
      getLegendInfo: () => [mapLegends[0]]
    };
    const webmap2 = {
      getLegendInfo: () => [mapLegends[1]]
    };
    mapEvent.setWebMap(mapTarget, mainWebMap);
    mapEvent.setWebMap(mapTarget, webmap2, 'webmap2');
    const webmap = mapEvent.getWebMap(mapTarget);
    const legendList = webmap.getLegendInfo();
    expect(legendList.length).toBe(2);
    expect(legendList[0]).toEqual(mapLegends[1]);
    done();
  });

  it('webmap get ordered LayerList', done => {
    const layerList1 = [
      { id: 'layer1', renderSource: { id: 'source1' }, renderLayers: ['layer1'], visible: true },
      {
        id: 'group2',
        type: 'group',
        visible: true,
        children: [{ id: 'sourceLayer', renderSource: { id: 'source2', sourceLayer: 'sourceLayer2' }, visible: true }]
      }
    ];
    const layerList2 = [
      { id: 'layer3', renderSource: { id: 'source3' }, renderLayers: ['layer3'], visible: true },
      {
        id: 'group4',
        renderSource: {},
        type: 'group',
        visible: true,
        children: [{ id: 'sourceLayer4', renderSource: { id: 'source4', sourceLayer: 'sourceLayer4' }, visible: true }]
      }
    ];
    const mainWebMap = {
      getLayerList: () => layerList1
    };
    const webmap2 = {
      getLayerList: () => layerList2,
      cacheLayerCatalogIds: ['layer3', 'group4', 'sourceLayer4']
    };
    mapEvent.setWebMap(mapTarget, mainWebMap);
    mapEvent.setWebMap(mapTarget, webmap2, 'webmap2');
    const webmap = mapEvent.getWebMap(mapTarget);
    const layerList = webmap.getLayerList();
    expect(layerList.length).toBe(4);
    expect(layerList).toEqual(layerList2.concat(layerList1));
    const OrderedLyerList = layerList1.concat(layerList2);
    mapEvent.setLayerCatalog(mapTarget, OrderedLyerList);
    const newLayerList = webmap.getLayerList();
    expect(newLayerList).toEqual(OrderedLyerList);
    expect(mapEvent.customLayerCatalogCache[mapTarget].length).toEqual(4);
    mapEvent.deleteWebMap(mapTarget, 'webmap2');
    expect(mapEvent.customLayerCatalogCache[mapTarget].length).toEqual(2);
    done();
  });

  it('webmap get ordered AppreciableLayers', done => {
    const mainWebMap = {
      getAppreciableLayers: () => [
        { id: 'layer1', renderSource: { id: 'source1' } },
        { id: 'layer2', renderSource: { id: 'source2' } }
      ]
    };
    mapEvent.setWebMap(mapTarget, mainWebMap);
    const webmap = mapEvent.getWebMap(mapTarget);
    const appreciableLayers1 = webmap.getAppreciableLayers();
    expect(appreciableLayers1[0].id).toBe('layer1');
    const newLayerList = [
      { id: 'layer1', renderSource: { id: 'source1' } },
      { id: 'layer2', renderSource: { id: 'source2' } }
    ];
    mapEvent.setLayerCatalog(mapTarget, newLayerList);
    const appreciableLayers2 = webmap.getAppreciableLayers();
    expect(appreciableLayers2[0].id).toBe('layer2');
    done();
  });

  it('group visible is determined by children', done => {
    const layerList1 = [
      {
        id: 'group1',
        type: 'group',
        visible: false,
        children: [{ id: 'sourceLayer1', renderSource: { id: 'source1', sourceLayer: 'sourceLayer1' }, visible: true }]
      },
      {
        id: 'group2',
        type: 'group',
        visible: true,
        children: [{ id: 'sourceLayer', renderSource: { id: 'source2', sourceLayer: 'sourceLayer2' }, visible: false }]
      },
      {
        id: 'group3',
        type: 'group',
        visible: true,
        children: []
      }
    ];
    const mainWebMap = {
      getLayerList: () => layerList1
    };
    mapEvent.setWebMap(mapTarget, mainWebMap);
    const webmap = mapEvent.getWebMap(mapTarget);
    const layerList = webmap.getLayerList();
    expect(layerList[0].id).toBe('group1');
    expect(layerList[0].visible).toBe(true);
    expect(layerList[1].id).toBe('group2');
    expect(layerList[1].visible).toBe(false);
    expect(layerList[2].id).toBe('group3');
    expect(layerList[2].visible).toBe(true);
    done();
  });

  it('Rearrange LayerList by layerorder', done => {
    const layerList1 = [
      {
        id: '国内航班数据_100',
        type: 'MIGRATION',
        layerOrder: 'top',
        title: '国内航班数据_100',
        renderSource: {},
        renderLayers: ['国内航班数据_100'],
        visible: true
      },
      {
        dataSource: {},
        id: '动态标记图层-1',
        title: '动态标记图层-1',
        renderSource: { id: '动态标记图层-1', type: 'geojson' },
        renderLayers: ['动态标记图层-1'],
        type: 'circle',
        themeSetting: {},
        visible: true,
        layerOrder: 'Top'
      },
      {
        dataSource: {},
        id: 'dataflowcsv_1727660246868',
        title: 'dataflowcsv',
        renderSource: { id: 'dataflowcsv_1727660246868', type: 'geojson' },
        renderLayers: ['dataflowcsv_1727660246868'],
        type: 'circle',
        themeSetting: {},
        visible: true,
        layerOrder: 'auto'
      }
    ];
    const layerList2 = [
      {
        dataSource: {},
        id: '天地图影像',
        title: '天地图影像',
        renderSource: { id: '天地图影像', type: 'raster' },
        renderLayers: ['天地图影像', '天地图影像-tdt-label'],
        type: 'raster',
        themeSetting: {},
        visible: true,
        layerOrder: 'bottom'
      },
      {
        dataSource: { accessType: 'DIRECT', type: 'PORTAL_DATA', serverId: '738100865' },
        id: '中国气象观测站 (1)',
        title: '中国气象观测站 (1)',
        renderSource: { id: '中国气象观测站 (1)', type: 'geojson' },
        renderLayers: ['中国气象观测站 (1)'],
        type: 'circle',
        themeSetting: {
          maxRadius: 12,
          themeField: '区站号',
          customSettings: {},
          minRadius: 6,
          segmentMethod: 'offset',
          segmentCount: 6
        },
        visible: true
      }
    ];
    const mainWebMap = {
      getLayerList: () => layerList1,
      getAppreciableLayers: () => layerList1.slice().reverse(),
      cacheLayerCatalogIds: layerList1.map(item => item.id)
    };
    const webmap2 = {
      getLayerList: () => layerList2,
      getAppreciableLayers: () => layerList2.slice().reverse(),
      cacheLayerCatalogIds: layerList2.map(item => item.id),
      map: {
        fire: jest.fn()
      }
    };
    mapEvent.setWebMap(mapTarget, mainWebMap);
    mapEvent.setWebMap(mapTarget, webmap2, 'webmap2');
    const webmap = mapEvent.getWebMap(mapTarget);
    const layerList = webmap.getLayerList();
    expect(layerList.length).toBe(5);
    expect(layerList[0]).toEqual(layerList1[0]);
    expect(layerList[1]).toEqual(layerList1[1]);
    expect(layerList[2]).toEqual(layerList2[1]);
    expect(layerList[3]).toEqual(layerList1[2]);
    expect(layerList[4]).toEqual(layerList2[0]);
    const layers = webmap.getAppreciableLayers();
    expect(layers.length).toBe(5);
    expect(layers[0]).toEqual(layerList2[0]);
    expect(layers[1]).toEqual(layerList2[1]);
    expect(layers[2]).toEqual(layerList1[2]);
    expect(layers[3]).toEqual(layerList1[1]);
    expect(layers[4]).toEqual(layerList1[0]);
    expect(webmap2.map.fire).toHaveBeenCalledWith('data', { dataType: 'style' });
    const allWebMap = mapEvent.getAllWebMap();
    expect(allWebMap[mapTarget]).not.toBeUndefined();
    done();
  });
});

