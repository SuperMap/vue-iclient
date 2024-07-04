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
});

