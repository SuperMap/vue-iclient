import { mount } from '@vue/test-utils';
import SmAnimateMarkerLayer from '../AnimateMarkerLayer.vue';
import mapEvent from '@types_mapboxgl/map-event';

describe('AnimateMarkerLayer.vue', () => {
  let mapWrapper;
  let wrapper;
  beforeEach(() => {
    jest.resetAllMocks();
    mapEvent.firstMapTargedt = null;
    mapEvent.$options.mapCache = {};
    mapEvent.$options.webMapCache = {};
    mapWrapper = null;
    wrapper = null;
  })

  afterEach(() => {
    if (mapWrapper) {
      mapWrapper.destroy();
    }
    if (wrapper) {
      wrapper.destroy();
    }
  });

  it('render default correctly', () => {
    wrapper = mount(SmAnimateMarkerLayer);
  })
})
