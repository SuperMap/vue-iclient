import { mount, createLocalVue } from '@vue/test-utils';
import mapEvent from '../map-event';

describe('map-event-mapboxgl', () => {

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it ('webmap', () => {
    const changeItemVisibleSpy = jest.fn();
    const webmap1 = {
      changeItemVisible: changeItemVisibleSpy,
      getAppreciableLayers: () => [{id: 'layer1'}],
      cacheLayerIds: ['layer1']
    }
    const webmap2 = {
      changeItemVisible: changeItemVisibleSpy,
      getAppreciableLayers: () => [{id: 'layer2'}],
      cacheLayerIds: ['layer2']
    }
    const mapTarget = 'webmap1';
    mapEvent.$options.setWebMap(mapTarget, webmap1);
    mapEvent.$options.setWebMap(mapTarget, webmap2, 'webmap2');
    let webmap = mapEvent.$options.getWebMap('map');
    expect(webmap).toBeUndefined();
    webmap = mapEvent.$options.getWebMap(mapTarget);
    expect(webmap).not.toBeUndefined();
    expect(webmap.getAppreciableLayers().length).toBe(2);
    webmap.changeItemVisible();
    expect(changeItemVisibleSpy).toHaveBeenCalledTimes(2);
    expect(webmap.cacheLayerIds).toEqual(['layer1']);
  })
});
