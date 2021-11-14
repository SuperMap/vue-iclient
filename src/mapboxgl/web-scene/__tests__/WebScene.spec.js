import { mount } from '@vue/test-utils';
import SmWebScene from '../WebScene.vue';

describe('WebScene.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  });

  it('render default correctly', () => {
    wrapper = mount(SmWebScene);
  });
});
