import {
  mount
} from '@vue/test-utils';
import SmLabelThemeLayer from '../LabelThemeLayer.vue';

describe('LabelThemeLayer.vue', () => {
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
    wrapper = mount(SmLabelThemeLayer, {
      propsData: {
        layerName: 'China',
        data: []
      }
    });
  })
})
