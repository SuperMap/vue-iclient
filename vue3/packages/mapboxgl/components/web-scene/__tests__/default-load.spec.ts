import { flushPromises, mount } from '@vue/test-utils';
import { vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  managers: [] as Array<{
    check: ReturnType<typeof vi.fn>;
    handleDataChange: ReturnType<typeof vi.fn>;
    removeAll: ReturnType<typeof vi.fn>;
  }>,
  webSceneViewModels: [] as Array<{
    emitInstanceDidLoad: (viewer: unknown) => void;
    off: ReturnType<typeof vi.fn>;
    removeInputAction: ReturnType<typeof vi.fn>;
  }>
}));

vi.mock('vue-iclient-core/utils/scene', () => {
  class LayerManager {
    check = vi.fn().mockResolvedValue(undefined);
    handleDataChange = vi.fn().mockResolvedValue(undefined);
    removeAll = vi.fn().mockResolvedValue(undefined);

    constructor() {
      mocks.managers.push(this);
    }
  }

  return { LayerManager };
});

vi.mock('vue-iclient-controllers-mapboxgl/src/WebSceneViewModel', () => {
  class WebSceneViewModel {
    private listeners = new Map<string, Array<(event: unknown) => void>>();
    off = vi.fn((event: string, listener: (event: unknown) => void) => {
      this.listeners.set(event, (this.listeners.get(event) || []).filter(item => item !== listener));
    });
    removeInputAction = vi.fn();

    constructor() {
      mocks.webSceneViewModels.push({
        emitInstanceDidLoad: viewer => {
          for (const listener of this.listeners.get('instancedidload') || []) {
            listener({ instance: { viewer } });
          }
        },
        off: this.off,
        removeInputAction: this.removeInputAction
      });
    }

    on(event: string, listener: (event: unknown) => void) {
      this.listeners.set(event, [...(this.listeners.get(event) || []), listener]);
    }
  }

  return { default: WebSceneViewModel };
});

vi.mock('vue-iclient-core/types/scene-event', () => ({
  default: {
    setScene: vi.fn(),
    deleteScene: vi.fn()
  }
}));

import WebScene from '../webscene.vue';

const restDataLayer = (defaultLoad: unknown) => ({
  id: 'rest-data-layer',
  name: 'REST data layer',
  type: 'data',
  defaultLoad,
  config: {
    type: 'rest',
    url: 'https://example.com/iserver/services/data',
    datasourceName: 'World',
    datasetName: 'Countries'
  }
});

async function mountAndLoadScene(layers: unknown[]) {
  const wrapper = mount(WebScene, {
    props: {
      options: {},
      layers
    }
  });
  mocks.webSceneViewModels[mocks.webSceneViewModels.length - 1]?.emitInstanceDidLoad({});
  await flushPromises();
  return wrapper;
}

describe('SmWebScene configured layers', () => {
  beforeEach(() => {
    mocks.managers.length = 0;
    mocks.webSceneViewModels.length = 0;
  });

  it('loads only layers with top-level defaultLoad set to true', async () => {
    const wrapper = await mountAndLoadScene([
      { ...restDataLayer(true), id: 'rest-data-layer-enabled' },
      restDataLayer(false),
      {
        ...restDataLayer(undefined),
        id: 'rest-data-layer-without-default',
        config: { ...restDataLayer(true).config, defaultLoad: true }
      },
      { ...restDataLayer('true'), id: 'rest-data-layer-with-string-default' }
    ]);

    expect(mocks.managers[0].check).toHaveBeenCalledTimes(1);
    expect(mocks.managers[0].check).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'rest-data-layer-enabled', defaultLoad: true }),
      true
    );
    wrapper.unmount();
  });

  it('loads a layer when enabled later and unloads it when disabled', async () => {
    const wrapper = await mountAndLoadScene([restDataLayer(false)]);
    const manager = mocks.managers[0];

    await wrapper.setProps({ layers: [restDataLayer(true)] });
    await flushPromises();

    expect(manager.check).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'rest-data-layer' }), true);

    await wrapper.setProps({ layers: [restDataLayer(false)] });
    await flushPromises();

    expect(manager.check).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'rest-data-layer' }), false);
    expect(manager.check).toHaveBeenCalledTimes(2);
    wrapper.unmount();
  });
});
