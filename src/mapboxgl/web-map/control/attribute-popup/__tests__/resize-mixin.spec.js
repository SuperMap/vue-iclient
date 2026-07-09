import { mount } from '@vue/test-utils';
import Vue from 'vue';
import resizeMixin from '../mixins/resize-mixin';
import { addListener, removeListener } from 'resize-detector';

jest.mock('lodash.debounce', () => fn => {
  const debounced = (...args) => fn(...args);
  debounced.cancel = jest.fn();
  return debounced;
});

jest.mock('resize-detector', () => ({
  addListener: jest.fn(),
  removeListener: jest.fn()
}));

const TestComponent = Vue.extend({
  mixins: [resizeMixin],
  template: '<div></div>'
});

describe('resize-mixin.js', () => {
  let wrapper;

  beforeEach(() => {
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
      cb();
      return 1;
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
    window.requestAnimationFrame.mockRestore();
    jest.useRealTimers();
  });

  it('initializes resizeCallback as null', () => {
    wrapper = mount(TestComponent);
    expect(wrapper.vm.resizeCallback).toBeNull();
  });

  it('addResizeListener registers debounced listener when element exists', () => {
    wrapper = mount(TestComponent);
    const el = document.createElement('div');
    const callback = jest.fn();

    wrapper.vm.addResizeListener(el, callback);

    expect(addListener).toHaveBeenCalledWith(el, wrapper.vm.resizeCallback);
    expect(typeof wrapper.vm.resizeCallback.cancel).toBe('function');
  });

  it('addResizeListener skips registration when element is missing', () => {
    wrapper = mount(TestComponent);
    wrapper.vm.addResizeListener(null, jest.fn());
    expect(addListener).not.toHaveBeenCalled();
    expect(wrapper.vm.resizeCallback).toBeTruthy();
  });

  it('addResizeListener cancels previous debounced callback', () => {
    wrapper = mount(TestComponent);
    const el = document.createElement('div');
    wrapper.vm.addResizeListener(el, jest.fn());
    const firstCallback = wrapper.vm.resizeCallback;
    const cancelSpy = jest.spyOn(firstCallback, 'cancel');

    wrapper.vm.addResizeListener(el, jest.fn());

    expect(cancelSpy).toHaveBeenCalled();
    expect(wrapper.vm.resizeCallback).not.toBe(firstCallback);
  });

  it('invokes callback in requestAnimationFrame after debounce', () => {
    wrapper = mount(TestComponent);
    const el = document.createElement('div');
    const callback = jest.fn();

    wrapper.vm.addResizeListener(el, callback);
    const debounced = addListener.mock.calls[0][1];
    debounced(el);
    expect(callback).toHaveBeenCalledWith(el);
  });

  it('removeResizeListener detaches listener and clears callback', () => {
    wrapper = mount(TestComponent);
    const el = document.createElement('div');
    wrapper.vm.addResizeListener(el, jest.fn());
    const debounced = wrapper.vm.resizeCallback;
    const cancelSpy = jest.spyOn(debounced, 'cancel');

    wrapper.vm.removeResizeListener(el);

    expect(removeListener).toHaveBeenCalledWith(el, debounced);
    expect(cancelSpy).toHaveBeenCalled();
    expect(wrapper.vm.resizeCallback).toBeNull();
  });

  it('removeResizeListener does nothing when callback is missing', () => {
    wrapper = mount(TestComponent);
    wrapper.vm.removeResizeListener(document.createElement('div'));
    expect(removeListener).not.toHaveBeenCalled();
  });
});
