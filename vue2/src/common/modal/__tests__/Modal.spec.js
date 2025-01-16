import { mount } from '@vue/test-utils';
import SmModal from '../Modal.vue';
import Modal from '../index';

describe('Modal.vue', () => {
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
    wrapper = mount(SmModal);
  });

  it('render default correctly', () => {
    wrapper = mount(Modal);
  });
});
