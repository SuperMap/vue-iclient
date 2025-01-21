import { mount, config } from '@vue/test-utils';
import SmScale from '../Scale.vue';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap.js';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded.js';

describe('Scale.vue', () => {
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
    wrapper = mount(SmScale, {
      propsData: {
        mapTarget: 'map'
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('change props', async done => {
    wrapper = mount(SmScale, {
      propsData: {
        mapTarget: 'map',
        unit: 'imperial',
        maxWidth: 500
      }
    });
    await mapSubComponentLoaded(wrapper);
    wrapper.setProps({
      unit: 'nautical',
      maxWidth: 1000
    });
    expect(wrapper.vm.mapTarget).toBe('map');
    expect(wrapper.find('.sm-component-scale').exists()).toBe(true);
    done();
  });
});
