import { mount, config } from '@vue/test-utils';
import SmVectorTileLayer from '../VectorTileLayer.vue';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap.js';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded.js';

describe('VectorTileLayer.vue', () => {
  let wrapper;
  let mapWrapper;

  beforeAll(async () => {
    config.mapLoad = false;
    mapWrapper = await createEmptyMap();
  });

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
  });

  it('render', async done => {
    wrapper = mount(SmVectorTileLayer, {
      propsData: {
        mapTarget: 'map',
        styleOptions: 'https://fakeiportal.supermap.io/vectorstyles.json'
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('change styleOptions', async done => {
    wrapper = mount(SmVectorTileLayer, {
      propsData: {
        mapTarget: 'map',
        styleOptions: 'https://fakeiportal.supermap.io/vectorstyles.json'
      }
    });
    await mapSubComponentLoaded(wrapper);
    const setStyleOptionsSpy = jest.spyOn(wrapper.vm.viewModel, 'setStyleOptions');
    await wrapper.setProps({
      styleOptions: 'https://fakeiportal.supermap.io/newvectorstyles.json'
    });
    expect(setStyleOptionsSpy).toBeCalled();
    done();
  });
});
