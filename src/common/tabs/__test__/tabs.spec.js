import {
  mount
} from '@vue/test-utils';
import SmTabs from '../Tabs.vue';
import SmTabPane from '../TabPane.vue';

describe('Tabs.vue', () => {
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
    wrapper = mount(SmTabs);
  })

  it('render text correctly', () => {
    wrapper = mount(SmTabPane);
  })
})