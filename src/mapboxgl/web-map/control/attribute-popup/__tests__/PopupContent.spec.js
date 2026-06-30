import { mount, config } from '@vue/test-utils';
import PopupContent from '../PopupContent.vue';

describe('PopupContent.vue', () => {
  let wrapper;

  beforeEach(() => {
    config.mapLoad = false;
    wrapper = null;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    config.mapLoad = true;
    if (wrapper) {
      wrapper.destroy();
    }
  });

  it('renders with default props', () => {
    wrapper = mount(PopupContent);
    expect(wrapper.find('.sm-attribute-popup-content').exists()).toBeTruthy();
  });

  it('renders with data', () => {
    const data = { name: 'Test', value: 123 };
    wrapper = mount(PopupContent, {
      propsData: { data }
    });
    expect(wrapper.vm.data).toEqual(data);
  });

  it('renders with popupConfig', () => {
    const popupConfig = {
      width: '400px',
      height: '300px'
    };
    wrapper = mount(PopupContent, {
      propsData: { popupConfig }
    });
    expect(wrapper.vm.popupConfig).toEqual(popupConfig);
  });

  it('computes popupWidth correctly', () => {
    wrapper = mount(PopupContent, {
      propsData: {
        popupConfig: { width: '500px' }
      }
    });
    expect(wrapper.vm.popupWidth).toEqual({ width: '500px' });
  });

  it('computes popupHeight correctly', () => {
    wrapper = mount(PopupContent, {
      propsData: {
        popupConfig: { height: '400px' }
      }
    });
    expect(wrapper.vm.popupHeight).toEqual({ height: '400px' });
  });

  it('computes attributeStyle correctly', () => {
    wrapper = mount(PopupContent, {
      propsData: {
        popupConfig: {
          keyWordWrap: 'ellipsis',
          valueWordWrap: 'wrap'
        }
      }
    });
    expect(wrapper.vm.attributeStyle).toBeTruthy();
  });

  it('computes ellipsisStyle correctly', () => {
    wrapper = mount(PopupContent, {
      propsData: {
        popupConfig: {
          keyWordWrap: 'ellipsis'
        }
      }
    });
    expect(wrapper.vm.ellipsisStyle).toBeTruthy();
  });

  it('computes maxHeight with height priority', () => {
    wrapper = mount(PopupContent, {
      propsData: {
        popupConfig: {
          height: '400px',
          maxHeight: '300px'
        }
      }
    });
    expect(wrapper.vm.maxHeight).toEqual({ height: '400px' });
  });

  it('computes maxHeight with maxHeight only', () => {
    wrapper = mount(PopupContent, {
      propsData: {
        popupConfig: {
          maxHeight: '300px'
        }
      }
    });
    expect(wrapper.vm.maxHeight).toEqual({ maxHeight: '300px' });
  });

  it('computes maxHeight with empty popupConfig', () => {
    wrapper = mount(PopupContent, {
      propsData: {
        popupConfig: {}
      }
    });
    expect(wrapper.vm.maxHeight).toEqual({});
  });

  it('renders content with multiple elements', () => {
    const data = {
      features: [
        { properties: { name: 'Item 1', value: 100 } },
        { properties: { name: 'Item 2', value: 200 } }
      ]
    };
    wrapper = mount(PopupContent, {
      propsData: { data }
    });
    expect(wrapper.vm.data).toEqual(data);
  });
});
