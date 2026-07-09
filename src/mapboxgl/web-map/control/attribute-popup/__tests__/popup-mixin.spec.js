import { mount } from '@vue/test-utils';
import Vue from 'vue';
import popupMixin from '../mixins/popup-mixin';

const mockRemovePopup = jest.fn();
const mockAddPopup = jest.fn();
const mockRemoved = jest.fn();
const mockSetMap = jest.fn();

jest.mock('vue-iclient/src/mapboxgl/map-popup/MapPopupViewModel', () => {
  return jest.fn().mockImplementation(() => ({
    removePopup: mockRemovePopup,
    addPopup: mockAddPopup,
    removed: mockRemoved,
    setMap: mockSetMap
  }));
});

jest.mock('vue-iclient/src/common/_utils/util', () => ({
  setPopupArrowStyle: jest.fn()
}));

import MapPopupViewModel from 'vue-iclient/src/mapboxgl/map-popup/MapPopupViewModel';
import { setPopupArrowStyle } from 'vue-iclient/src/common/_utils/util';

const TestComponent = Vue.extend({
  mixins: [popupMixin],
  template: '<div></div>',
  data() {
    return {
      map: { id: 'test-map' }
    };
  }
});

describe('popup-mixin.js', () => {
  let wrapper;

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
    jest.clearAllMocks();
  });

  it('initializes popupViewModel on created', () => {
    wrapper = mount(TestComponent);
    expect(MapPopupViewModel).toHaveBeenCalled();
    expect(wrapper.vm.popupViewModel).toBeDefined();
    expect(wrapper.vm.isRender).toBe(false);
  });

  it('reuses existing popupViewModel in initPopupViewModel', () => {
    wrapper = mount(TestComponent);
    const existing = wrapper.vm.popupViewModel;
    const result = wrapper.vm.initPopupViewModel();
    expect(result).toBe(existing);
    expect(MapPopupViewModel).toHaveBeenCalledTimes(1);
  });

  it('calls setMap in loaded hook', () => {
    wrapper = mount(TestComponent);
    popupMixin.loaded.call(wrapper.vm);
    expect(mockSetMap).toHaveBeenCalledWith({ map: wrapper.vm.map });
  });

  it('removePopup clears popup and isRender', () => {
    wrapper = mount(TestComponent);
    wrapper.vm.isRender = true;
    wrapper.vm.removePopup();
    expect(mockRemovePopup).toHaveBeenCalled();
    expect(wrapper.vm.isRender).toBe(false);
  });

  it('addPopup sets isRender and adds popup with arrow style', () => {
    wrapper = mount(TestComponent);
    const popupEl = document.createElement('div');
    const popupBgStyle = { backgroundColor: '#ffffff' };
    wrapper.vm.addPopup([110, 30], popupEl, popupBgStyle);
    expect(wrapper.vm.isRender).toBe(true);
    expect(mockAddPopup).toHaveBeenCalledWith([110, 30], popupEl);
    expect(setPopupArrowStyle).toHaveBeenCalledWith('#ffffff');
  });

  it('addPopup returns early when coordinate is empty', () => {
    wrapper = mount(TestComponent);
    const popupEl = document.createElement('div');
    wrapper.vm.addPopup([], popupEl);
    expect(mockAddPopup).not.toHaveBeenCalled();
    expect(wrapper.vm.isRender).toBe(false);
  });

  it('addPopup skips arrow style when popupBgStyle is omitted', () => {
    wrapper = mount(TestComponent);
    const popupEl = document.createElement('div');
    wrapper.vm.addPopup([110, 30], popupEl);
    expect(mockAddPopup).toHaveBeenCalled();
    expect(setPopupArrowStyle).not.toHaveBeenCalled();
  });

  it('clearPopup calls removed and resets isRender', () => {
    wrapper = mount(TestComponent);
    wrapper.vm.isRender = true;
    wrapper.vm.clearPopup();
    expect(mockRemoved).toHaveBeenCalled();
    expect(wrapper.vm.isRender).toBe(false);
  });

  it('clears popup on beforeDestroy', () => {
    wrapper = mount(TestComponent);
    wrapper.vm.isRender = true;
    wrapper.destroy();
    expect(mockRemoved).toHaveBeenCalled();
  });
});
