import {
  mount
} from '@vue/test-utils';
import SmDataFlowLayer from '../DataFlowLayer.vue';

describe('DataFlowLayer.vue', () => {
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
    wrapper = mount(SmDataFlowLayer, {
      propsData: {
        serviceUrl: "http://test.com"
      }
    });
  })
})
