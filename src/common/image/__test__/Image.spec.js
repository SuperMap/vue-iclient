import {
  mount
} from '@vue/test-utils';
import SmImage from '../Image.vue';


describe('Image.vue', () => {
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
    wrapper = mount({
      template: `
      <sm-image
        style="width:200px"
        src="https://test.png"
      />`,
      components: {
        SmImage,
      }
    },
    {
      sync: false,
    }
  )
    expect( wrapper.find('.sm-component-image').element.style.width).toBe('200px');
  })
})