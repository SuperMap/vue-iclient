import {
  mount
} from '@vue/test-utils';
import SmClusterLayer from '../ClusterLayer.vue';

describe('ClusterLayer.vue', () => {
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
    wrapper = mount(SmClusterLayer, {
      propsData: {
        data: {}        
      }
    });
  })
})
