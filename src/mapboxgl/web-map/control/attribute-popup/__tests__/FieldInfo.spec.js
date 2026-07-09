import { mount, config } from '@vue/test-utils';
import FieldInfo from '../FieldInfo.vue';

describe('FieldInfo.vue', () => {
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

  it('renders field name and value', () => {
    wrapper = mount(FieldInfo, {
      propsData: {
        infos: [
          { fieldName: 'name', fieldCaption: 'Name Label', value: 'Test Value' }
        ]
      }
    });
    expect(wrapper.find('.name').text()).toBe('Name Label');
    expect(wrapper.find('.value').text()).toBe('Test Value');
  });

  it('renders without caption, uses fieldName', () => {
    wrapper = mount(FieldInfo, {
      propsData: {
        infos: [
          { fieldName: 'Name', value: 'Test Value' }
        ]
      }
    });
    expect(wrapper.find('.name').text()).toBe('Name');
  });

  it('renders with empty value', () => {
    wrapper = mount(FieldInfo, {
      propsData: {
        infos: [
          { fieldName: 'Name', value: '' }
        ]
      }
    });
    expect(wrapper.find('.sm-component-field-info-text').text()).toBe('');
  });

  it('renders with null value', () => {
    wrapper = mount(FieldInfo, {
      propsData: {
        infos: [
          { fieldName: 'Name', value: null }
        ]
      }
    });
    expect(wrapper.find('.sm-component-field-info-text').text()).toBe('');
  });

  it('renders multiple fields', () => {
    wrapper = mount(FieldInfo, {
      propsData: {
        infos: [
          { fieldName: 'name', value: 'John' },
          { fieldName: 'age', value: 25 }
        ]
      }
    });
    const items = wrapper.findAll('.item');
    expect(items.length).toBe(2);
    expect(items.at(0).find('.name').text()).toBe('name');
    expect(items.at(1).find('.name').text()).toBe('age');
  });

  it('renders with attributeStyle', () => {
    wrapper = mount(FieldInfo, {
      propsData: {
        infos: [
          { fieldName: 'Name', value: 'Value' }
        ],
        attributeStyle: {
          keyStyle: { color: 'red' },
          valueStyle: { color: 'blue' }
        }
      }
    });
    const nameDiv = wrapper.find('.name');
    expect(nameDiv.attributes('style')).toContain('color: red');
  });

  it('renders with default empty infos', () => {
    wrapper = mount(FieldInfo);
    expect(wrapper.findAll('.item').length).toBe(0);
    expect(FieldInfo.props.infos.default()).toEqual([]);
    expect(FieldInfo.props.attributeStyle.default()).toEqual({ keyStyle: '', valueStyle: '' });
  });

  it('uses default attributeStyle when prop is omitted', () => {
    wrapper = mount(FieldInfo, {
      propsData: {
        infos: [{ fieldName: 'Name', value: 'Value' }]
      }
    });
    expect(wrapper.vm.attributeStyle).toEqual({ keyStyle: '', valueStyle: '' });
  });

  it('renders href link when contentType is href', () => {
    wrapper = mount(FieldInfo, {
      propsData: {
        infos: [{
          fieldName: 'link',
          fieldCaption: 'Website',
          contentType: 'href',
          value: 'https://example.com',
          contentInfo: { text: 'Visit Site', target: '_self' }
        }],
        attributeStyle: { keyStyle: {}, valueStyle: { color: 'green' } }
      },
      stubs: { SmPlayer: true }
    });
    const link = wrapper.find('a');
    expect(link.attributes('href')).toBe('https://example.com');
    expect(link.attributes('target')).toBe('_self');
    expect(link.text()).toBe('Visit Site');
  });

  it('renders video player when contentType is video', () => {
    wrapper = mount(FieldInfo, {
      propsData: {
        infos: [{
          fieldName: 'video',
          contentType: 'video',
          value: 'http://example.com/video.mp4',
          contentInfo: { controls: true }
        }]
      },
      stubs: {
        SmPlayer: {
          template: '<div class="video-player-stub"></div>',
          props: ['type', 'value', 'options']
        }
      }
    });
    expect(wrapper.find('.video-player-stub').exists()).toBe(true);
    expect(wrapper.find('.sm-component-field-info-video').exists()).toBe(true);
  });

  it('renders image player when contentType is image', () => {
    wrapper = mount(FieldInfo, {
      propsData: {
        infos: [{
          fieldName: 'photo',
          contentType: 'image',
          value: 'http://example.com/image.png',
          contentInfo: { previewMode: 'full' }
        }]
      },
      stubs: {
        SmPlayer: {
          template: '<div class="image-player-stub"></div>',
          props: ['type', 'value', 'options']
        }
      }
    });
    expect(wrapper.find('.image-player-stub').exists()).toBe(true);
    expect(wrapper.find('.sm-component-field-info-image').exists()).toBe(true);
  });
});
