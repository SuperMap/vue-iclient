import { mount } from '@vue/test-utils';
import StyleRenderer from '../subs/StyleRenderer.vue';

describe('radar legend colors', () => {
  let wrapper;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    wrapper && wrapper.destroy();
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it.each([
    ['#EE4D5A', 'rgba(238, 77, 90, 0)'],
    ['rgba(16, 160, 255, 1)', 'rgba(16, 160, 255, 0)'],
    ['rgba(16, 160, 255, 0.4)', 'rgba(16, 160, 255, 0)'],
    ['rgb(16, 160, 255)', 'rgba(16, 160, 255, 0)'],
    ['#0af', 'rgba(0, 170, 255, 0)']
  ])('draws animated gradient for %s', (color, transparentColor) => {
    const canvas = document.createElement('canvas');
    jest.spyOn(document, 'getElementById').mockReturnValue(canvas);
    wrapper = mount(StyleRenderer, {
      propsData: {
        styleData: { style: { type: 'style', shape: 'radarPoint', size: 60, color, opacity: 0.6, speed: 3 } }
      }
    });
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 60);
    const addColorStop = jest.spyOn(gradient, 'addColorStop');
    jest.spyOn(ctx, 'createLinearGradient').mockReturnValue(gradient);

    // Advance through a complete sweep, including each gradient orientation.
    expect(() => jest.advanceTimersByTime(1600)).not.toThrow();
    expect(addColorStop).toHaveBeenCalledWith(0, transparentColor);
    expect(addColorStop).toHaveBeenCalledWith(1, color);
    expect(ctx.globalAlpha).toBe(0.6);
    expect(ctx.fill).toHaveBeenCalled();

    wrapper.destroy();
    wrapper = null;
    expect(jest.getTimerCount()).toBe(0);
  });
});
