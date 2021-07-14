import {
  mount
} from '@vue/test-utils';
import SmRasterTileLayer from '../RasterTileLayer.vue';

describe('RasterTileLayer.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  })

  it('render default correctly', () => {
    wrapper = mount(SmRasterTileLayer, {
      propsData: {
        data: []
      }
    });
  })
})
