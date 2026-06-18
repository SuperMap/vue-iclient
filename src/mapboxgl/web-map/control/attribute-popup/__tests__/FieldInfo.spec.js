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
});
