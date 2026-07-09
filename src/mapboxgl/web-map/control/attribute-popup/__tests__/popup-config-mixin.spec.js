import { mount } from '@vue/test-utils';
import Vue from 'vue';
import popupConfigMixin from '../mixins/popup-config-mixin';

const TestComponent = Vue.extend({
  mixins: [popupConfigMixin],
  template: '<div></div>',
  props: {
    popupConfig: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    popupConfigValue() {
      return this.popupConfig;
    }
  },
  data() {
    return {
      contentHeight: ''
    };
  }
});

describe('popup-config-mixin.js', () => {
  let wrapper;

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  });

  const mountWithConfig = (popupConfig = {}) => {
    return mount(TestComponent, {
      propsData: { popupConfig }
    });
  };

  it('computes popupStyle without layout related fields', () => {
    wrapper = mountWithConfig({
      autoResize: true,
      maxWidth: '300px',
      maxHeight: '400px',
      width: '280px',
      height: '320px',
      keyWordWrap: 'ellipsis',
      valueWordWrap: 'wrap',
      backgroundColor: '#ffffff',
      borderRadius: '4px'
    });
    expect(wrapper.vm.popupStyle).toEqual({
      backgroundColor: '#ffffff',
      borderRadius: '4px'
    });
  });

  it('computes popupWidth with autoResize enabled', () => {
    wrapper = mountWithConfig({
      autoResize: true,
      maxWidth: '300px',
      width: '280px'
    });
    expect(wrapper.vm.popupWidth).toEqual({ maxWidth: '300px', width: '280px' });
  });

  it('computes popupWidth without autoResize', () => {
    wrapper = mountWithConfig({
      autoResize: false,
      maxWidth: '300px',
      width: '280px'
    });
    expect(wrapper.vm.popupWidth).toEqual({ width: '280px' });
  });

  it('computes popupHeight with autoResize and contentHeight fallback', () => {
    wrapper = mountWithConfig({ autoResize: true, maxHeight: '400px' });
    wrapper.vm.contentHeight = '260px';
    expect(wrapper.vm.popupHeight).toEqual({ maxHeight: '400px', height: '260px' });
  });

  it('computes popupHeight with explicit height when autoResize is enabled', () => {
    wrapper = mountWithConfig({
      autoResize: true,
      maxHeight: '400px',
      height: '320px'
    });
    expect(wrapper.vm.popupHeight).toEqual({ maxHeight: '400px', height: '320px' });
  });

  it('computes popupHeight without autoResize', () => {
    wrapper = mountWithConfig({
      autoResize: false,
      maxHeight: '400px',
      height: '320px'
    });
    expect(wrapper.vm.popupHeight).toEqual({ height: '320px' });
  });

  it('computes ellipsisStyle', () => {
    wrapper = mountWithConfig();
    expect(wrapper.vm.ellipsisStyle).toEqual({
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    });
  });

  it('computes attributeStyle when both wraps use ellipsis', () => {
    wrapper = mountWithConfig({
      keyWordWrap: 'ellipsis',
      valueWordWrap: 'ellipsis'
    });
    expect(wrapper.vm.attributeStyle.keyStyle).toEqual({
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      height: '22px'
    });
    expect(wrapper.vm.attributeStyle.valueStyle).toEqual({
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    });
  });

  it('computes attributeStyle when only keyWordWrap uses ellipsis', () => {
    wrapper = mountWithConfig({ keyWordWrap: 'ellipsis' });
    expect(wrapper.vm.attributeStyle.keyStyle.height).toBe('22px');
    expect(wrapper.vm.attributeStyle.valueStyle).toEqual({});
  });

  it('computes attributeStyle when only valueWordWrap uses ellipsis', () => {
    wrapper = mountWithConfig({ valueWordWrap: 'ellipsis' });
    expect(wrapper.vm.attributeStyle.keyStyle).toEqual({});
    expect(wrapper.vm.attributeStyle.valueStyle).toEqual({
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    });
  });

  it('handles missing popupConfigValue fields', () => {
    wrapper = mount(TestComponent, {
      computed: {
        popupConfigValue() {
          return undefined;
        }
      }
    });
    expect(wrapper.vm.popupStyle).toEqual({});
    expect(wrapper.vm.popupWidth).toEqual({ maxWidth: undefined, width: undefined });
    expect(wrapper.vm.popupHeight).toEqual({ height: undefined });
  });
});
