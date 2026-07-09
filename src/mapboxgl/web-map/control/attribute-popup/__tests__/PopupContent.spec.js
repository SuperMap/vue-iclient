import { mount, config } from '@vue/test-utils';
import PopupContent from '../PopupContent.vue';

const FieldInfoStub = {
  name: 'SmFieldInfo',
  template: '<div class="field-info-stub">{{ infos.length }}</div>',
  props: ['infos', 'attributeStyle']
};

const TextInfoStub = {
  name: 'SmTextInfo',
  template: '<div class="text-info-stub"></div>',
  props: ['infos']
};

const MediaInfoStub = {
  name: 'SmMediaInfo',
  template: '<div class="media-info-stub"></div>',
  props: ['infos']
};

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

  const mountPopupContent = (propsData = {}) => {
    return mount(PopupContent, {
      propsData,
      stubs: {
        FieldInfo: FieldInfoStub,
        TextInfo: TextInfoStub,
        MediaInfo: MediaInfoStub,
        ADivider: { template: '<div class="divider-stub"></div>' }
      }
    });
  };

  it('renders with default props', () => {
    wrapper = mountPopupContent();
    expect(wrapper.find('.sm-attribute-popup-content').exists()).toBeTruthy();
  });

  it('computes attributes from data array', () => {
    wrapper = mountPopupContent({
      data: [
        { title: 'name', value: 'Test' },
        { title: 'age', value: 25 }
      ]
    });
    expect(wrapper.vm.attributes).toEqual({ name: 'Test', age: 25 });
  });

  it('computes popupWidth correctly', () => {
    wrapper = mountPopupContent({
      popupConfig: { width: '500px' }
    });
    expect(wrapper.vm.popupWidth).toEqual({ width: '500px' });
  });

  it('computes popupHeight correctly', () => {
    wrapper = mountPopupContent({
      popupConfig: { height: '400px' }
    });
    expect(wrapper.vm.popupHeight).toEqual({ height: '400px' });
  });

  it('computes attributeStyle correctly', () => {
    wrapper = mountPopupContent({
      popupConfig: {
        keyWordWrap: 'ellipsis',
        valueWordWrap: 'wrap'
      }
    });
    expect(wrapper.vm.attributeStyle.keyStyle).toEqual(
      expect.objectContaining({ overflow: 'hidden', textOverflow: 'ellipsis' })
    );
    expect(wrapper.vm.attributeStyle.valueStyle).toEqual({});
  });

  it('computes ellipsisStyle correctly', () => {
    wrapper = mountPopupContent({
      popupConfig: { keyWordWrap: 'ellipsis' }
    });
    expect(wrapper.vm.ellipsisStyle).toEqual({
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    });
  });

  it('computes maxHeight with height priority', () => {
    wrapper = mountPopupContent({
      popupConfig: { height: '400px', maxHeight: '300px' }
    });
    expect(wrapper.vm.maxHeight).toEqual({ height: '400px' });
  });

  it('computes maxHeight with maxHeight only', () => {
    wrapper = mountPopupContent({
      popupConfig: { maxHeight: '300px' }
    });
    expect(wrapper.vm.maxHeight).toEqual({ maxHeight: '300px' });
  });

  it('computes maxHeight with empty popupConfig', () => {
    wrapper = mountPopupContent({ popupConfig: {} });
    expect(wrapper.vm.maxHeight).toEqual({});
  });

  it('returns empty content when popupInfo has no elements', () => {
    wrapper = mountPopupContent({
      popupInfo: {},
      data: [{ title: 'name', value: 'Test' }]
    });
    expect(wrapper.vm.content).toEqual([]);
    expect(wrapper.text()).toContain('common.noData');
  });

  it('computes content from popupInfo elements and data', () => {
    wrapper = mountPopupContent({
      data: [{ title: 'name', value: 'John' }],
      popupInfo: {
        elements: [{ type: 'FIELD', fieldName: 'name' }]
      }
    });
    const content = wrapper.vm.content;
    expect(content.length).toBe(1);
    expect(content[0].type).toBe('FIELD');
    expect(content[0].infos[0].value).toBe('John');
  });

  it('renders FieldInfo for FIELD content type', () => {
    wrapper = mountPopupContent({
      data: [{ title: 'name', value: 'John' }],
      popupInfo: {
        elements: [{ type: 'FIELD', fieldName: 'name' }]
      }
    });
    expect(wrapper.find('.field-info-stub').exists()).toBe(true);
  });

  it('renders TextInfo for TEXT content type', () => {
    wrapper = mountPopupContent({
      data: [{ title: 'name', value: 'John' }],
      popupInfo: {
        elements: [{ type: 'TEXT', infos: [{ insert: 'Hello {name}' }] }]
      }
    });
    expect(wrapper.find('.text-info-stub').exists()).toBe(true);
  });

  it('renders MediaInfo for IMAGE content type', () => {
    wrapper = mountPopupContent({
      data: [{ title: 'photo', value: 'http://example.com/img.png' }],
      popupInfo: {
        elements: [{ type: 'IMAGE', value: '{photo}', title: 'Photo' }]
      }
    });
    expect(wrapper.find('.media-info-stub').exists()).toBe(true);
  });

  it('renders divider for DIVIDER content type', () => {
    wrapper = mountPopupContent({
      popupInfo: {
        elements: [{ type: 'DIVIDER' }]
      }
    });
    expect(wrapper.find('.sm-divider').exists()).toBe(true);
  });
});
