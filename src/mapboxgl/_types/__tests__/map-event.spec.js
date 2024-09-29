import mapEvent from '../map-event';
import mapLegends from 'vue-iclient/test/unit/mocks/data/WebMap/map_legends.json';

describe('map-event-mapboxgl', () => {
  const mapTarget = 'mainWebMap';
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
    mapEvent.$options.deleteWebMap(mapTarget);
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
    mapEvent.$options.setWebMap(mapTarget, mainWebMap);
    mapEvent.$options.setWebMap(mapTarget, webmap2, 'webmap2');
    let webmap = mapEvent.$options.getWebMap('map');
    expect(webmap).toBeUndefined();
    webmap = mapEvent.$options.getWebMap(mapTarget);
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
      getAppreciableLayers: () => [{ id: 'layer1', renderSource: { id: 'layer1' }, reused: true }, { id: 'layer3', renderSource: { id: 'layer3' } }],
      cacheLayerIds: ['layer1', 'layer3']
    };
    mapEvent.$options.setWebMap(mapTarget, mainWebMap);
    mapEvent.$options.setWebMap(mapTarget, webmap2, 'webmap2');
    mapEvent.$options.setWebMap(mapTarget, webmap3, 'webmap3');
    let webmap = mapEvent.$options.getWebMap('map');
    expect(webmap).toBeUndefined();
    webmap = mapEvent.$options.getWebMap(mapTarget);
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
    mapEvent.$options.setWebMap(mapTarget, mainWebMap);
    mapEvent.$options.setWebMap(mapTarget, webmap2, 'webmap2');
    const webmap = mapEvent.$options.getWebMap(mapTarget);
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
    mapEvent.$options.setWebMap(mapTarget, mainWebMap);
    mapEvent.$options.setWebMap(mapTarget, webmap2, 'webmap2');
    const webmap = mapEvent.$options.getWebMap(mapTarget);
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
    mapEvent.$options.setWebMap(mapTarget, mainWebMap);
    mapEvent.$options.setWebMap(mapTarget, webmap2, 'webmap2');
    const webmap = mapEvent.$options.getWebMap(mapTarget);
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
    ]
    const mainWebMap = {
      getLayerList: () => layerList1
    };
    const webmap2 = {
      getLayerList: () => layerList2,
      cacheLayerCatalogIds: ['layer3', 'group4', 'sourceLayer4']
    };
    mapEvent.$options.setWebMap(mapTarget, mainWebMap);
    mapEvent.$options.setWebMap(mapTarget, webmap2, 'webmap2');
    const webmap = mapEvent.$options.getWebMap(mapTarget);
    const layerList = webmap.getLayerList();
    expect(layerList.length).toBe(4);
    expect(layerList).toEqual(layerList2.concat(layerList1));
    const OrderedLyerList = layerList1.concat(layerList2);
    mapEvent.$options.setLayerCatalog(mapTarget, OrderedLyerList);
    const newLayerList = webmap.getLayerList();
    expect(newLayerList).toEqual(OrderedLyerList);
    expect(mapEvent.$options.customLayerCatalogCache[mapTarget].length).toEqual(4);
    mapEvent.$options.deleteWebMap(mapTarget, 'webmap2');
    expect(mapEvent.$options.customLayerCatalogCache[mapTarget].length).toEqual(2);
    done();
  });

  it('webmap get ordered AppreciableLayers', done => {
    const mainWebMap = {
      getAppreciableLayers: () => [
        { id: 'layer1', renderSource: { id: 'source1' } },
        { id: 'layer2', renderSource: { id: 'source2' } }
      ]
    };
    mapEvent.$options.setWebMap(mapTarget, mainWebMap);
    const webmap = mapEvent.$options.getWebMap(mapTarget);
    const appreciableLayers1 = webmap.getAppreciableLayers();
    expect(appreciableLayers1[0].id).toBe('layer1');
    const newLayerList = [
      { id: 'layer1', renderSource: { id: 'source1' } },
      { id: 'layer2', renderSource: { id: 'source2' } }
    ];
    mapEvent.$options.setLayerCatalog(mapTarget, newLayerList);
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
      }
    ];
    const mainWebMap = {
      getLayerList: () => layerList1
    };
    mapEvent.$options.setWebMap(mapTarget, mainWebMap);
    const webmap = mapEvent.$options.getWebMap(mapTarget);
    const layerList = webmap.getLayerList();
    expect(layerList[0].id).toBe('group1');
    expect(layerList[0].visible).toBe(true);
    expect(layerList[1].id).toBe('group2');
    expect(layerList[1].visible).toBe(false);
    done();
  });
});

