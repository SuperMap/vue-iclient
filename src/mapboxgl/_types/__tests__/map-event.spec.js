import mapEvent from '../map-event';

describe('map-event-mapboxgl', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
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
    const mapTarget = 'mainWebMap';
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

  xit('webmap getAppreciableLayers', done => {
    const mainWebMap = {
      getAppreciableLayers: () => [{ id: 'layer1', renderSource: { id: 'source1' } }]
    };
    const webmap2 = {
      getAppreciableLayers: () => [{ id: 'layer2', renderSource: { id: 'source1' } }]
    };
    const mapTarget = 'mainWebMap';
    mapEvent.$options.setWebMap(mapTarget, mainWebMap);
    mapEvent.$options.setWebMap(mapTarget, webmap2, 'webmap2');
    const webmap = mapEvent.$options.getWebMap(mapTarget);
    expect(webmap.getAppreciableLayers().length).toBe(1);
    done();
  });

  xit('webmap getLayerList', done => {
    const mainWebMap = {
      getLayerList: () => [
        { id: 'layer1', renderSource: { id: 'source1' } },
        { id: 'layer5', renderSource: { id: 'source5' } },
        {
          id: 'layer3',
          type: 'group',
          renderSource: {},
          children: [{ id: 'sourceLayer', renderSource: { id: 'source2', sourceLayer: 'sourceLayer2' } }]
        }
      ]
    };
    const webmap2 = {
      getLayerList: () => [
        { id: 'layer1', renderSource: { id: 'source1' } },
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
    const mapTarget = 'mainWebMap';
    mapEvent.$options.setWebMap(mapTarget, mainWebMap);
    mapEvent.$options.setWebMap(mapTarget, webmap2, 'webmap2');
    const webmap = mapEvent.$options.getWebMap(mapTarget);
    expect(webmap.getLayerList().length).toBe(4);
    done();
  });
});

