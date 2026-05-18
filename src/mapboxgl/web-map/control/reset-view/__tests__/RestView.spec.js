import { shallowMount } from '@vue/test-utils';
import Reset from '../ResetView.vue';

import mapEvent from 'vue-iclient/src/mapboxgl/_types/map-event';

// 关键：mock MapGetter mixin 里用到的 mapEvent
jest.mock('vue-iclient/src/mapboxgl/_types/map-event', () => ({
  __esModule: true,
  default: {
    $options: {
      getMap: jest.fn(),
      getMapData: jest.fn(),
      getWebMap: jest.fn(),
      getAllMaps: jest.fn()
    },
    $on: jest.fn(),
    $off: jest.fn()
  }
}));

describe('ResetView.vue', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  function factory(overrides = {}) {
    return shallowMount(Reset, {
      stubs: {
        'sm-button': {
          template: '<button class="reset-button" @click="$emit(\'click\')"><slot /></button>'
        }
      },
      ...overrides
    });
  }

  it('click button -> calls viewModel.resetView when map is loaded', async () => {
    const wrapper = factory();

    const resetView = jest.fn();
    wrapper.vm.viewModel = { resetView };

    wrapper.vm.mapNotLoadedTip = jest.fn(() => false);

    await wrapper.find('.reset-button').trigger('click');

    expect(wrapper.vm.mapNotLoadedTip).toHaveBeenCalled();
    expect(resetView).toHaveBeenCalled();
  });

  it('click button -> does not call resetView when mapNotLoadedTip returns true', async () => {
    const wrapper = factory();

    const resetView = jest.fn();
    wrapper.vm.viewModel = { resetView };

    wrapper.vm.mapNotLoadedTip = jest.fn(() => true);

    await wrapper.find('.reset-button').trigger('click');

    expect(wrapper.vm.mapNotLoadedTip).toHaveBeenCalled();
    expect(resetView).not.toHaveBeenCalled();
  });

  it('loadMap -> viewModel.setMap receives { map, webmap, mapTarget, mapData }', () => {
    const wrapper = factory();

    const targetName = 't1';
    const map = { __map: true };
    const webmap = { __webmap: true };
    const mapData = { mapOptions: { center: [0, 0], zoom: 1 } };

    wrapper.vm.mapData = mapData;

    mapEvent.$options.getMap.mockReturnValue(map);
    mapEvent.$options.getWebMap.mockReturnValue(webmap);
    mapEvent.$options.getMapData.mockReturnValue(mapData);

    const setMap = jest.fn();
    wrapper.vm.viewModel = { setMap };

    wrapper.vm.loadMap(targetName);

    expect(setMap).toHaveBeenCalledTimes(1);
    expect(setMap).toHaveBeenCalledWith({
      map,
      webmap,
      mapTarget: targetName,
      mapData
    });

    expect(wrapper.vm.map).toBe(map);
    expect(wrapper.vm.webmap).toBe(webmap);
    expect(wrapper.vm.mapData).toBe(mapData);
  });

  it('loadMap -> does not call viewModel.setMap when setMap is not a function', () => {
    const wrapper = factory();

    mapEvent.$options.getMap.mockReturnValue({ __map: true });
    mapEvent.$options.getWebMap.mockReturnValue({ __webmap: true });
    mapEvent.$options.getMapData.mockReturnValue({ mapOptions: {} });

    wrapper.vm.viewModel = { setMap: null };

    expect(() => wrapper.vm.loadMap('t1')).not.toThrow();
  });
});
