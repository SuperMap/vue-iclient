import { mount, config } from '@vue/test-utils';
import SmLayerColor from '../LayerColor';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap.js';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded.js';

describe('LayerColor.vue', () => {
  let wrapper;
  let mapWrapper;

  beforeAll(async () => {
    config.mapLoad = false;
    mapWrapper = await createEmptyMap();
  })

  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (wrapper) {
      wrapper.destroy();
    }
  });

  afterAll(() => {
    config.mapLoad = true;
    if (mapWrapper) {
      mapWrapper.destroy();
    }
  })

  it('render default correctly', async done => {
    wrapper = mount(SmLayerColor, {
      propsData: {
        mapTarget: 'map',
        collapsed: false
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('capture', async done => {
    wrapper = mount(SmLayerColor, {
      propsData: {
        mapTarget: 'map',
        collapsed: false
      }
    });
    await mapSubComponentLoaded(wrapper);
    wrapper.find('.sm-components-icon-layer-picker').trigger('click');
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('reset', async done => {
    wrapper = mount(SmLayerColor, {
      propsData: {
        mapTarget: 'map',
        collapsed: false
      }
    });
    await mapSubComponentLoaded(wrapper);
    wrapper.find('.sm-component-btn-primary').trigger('click');
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });
});
