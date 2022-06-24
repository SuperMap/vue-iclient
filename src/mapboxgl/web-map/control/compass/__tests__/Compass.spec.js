import { mount, config } from '@vue/test-utils';
import SmCompass from '../Compass.vue';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap.js';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded.js';

describe('Compass.vue', () => {
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
    jest.resetAllMocks();
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
    wrapper = mount(SmCompass, {
      propsData: {
        mapTarget: 'map'
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('change visualizePitch', async done => {
    wrapper = mount(SmCompass, {
      propsData: {
        mapTarget: 'map',
        visualizePitch: true
      }
    });
    await mapSubComponentLoaded(wrapper);
    wrapper.setProps({
      visualizePitch: false
    });
    expect(wrapper.vm.visualizePitch).toBe(false);
    done();
  });

  it('reset', async done => {
    wrapper = mount(SmCompass, {
      propsData: {
        mapTarget: 'map'
      }
    });
    await mapSubComponentLoaded(wrapper);
    wrapper.find('.sm-component-compass__content').trigger('click');
    expect(wrapper.vm.visualizePitch).toBe(false);
    done();
  });
});
