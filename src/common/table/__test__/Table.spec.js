import {
  mount
} from '@vue/test-utils';
import SmTable from '../Table.vue';

describe('Table.vue', () => {
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
    wrapper = mount(SmTable);
  })
})