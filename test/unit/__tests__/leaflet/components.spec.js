import { mount, createLocalVue } from '@vue/test-utils';
import components from '@leaflet/components.ts';

jest.mock('swiper', () => {
  return function() {
    return {
      init: jest.fn(),
      destroy: jest.fn(),
      on: jest.fn(),
      update: jest.fn(),
      slideToLoop: jest.fn(),
      slideTo: jest.fn(),
      keyboard: {
        enable: jest.fn(),
        disable: jest.fn()
      },
      mousewheel: {
        enable: jest.fn(),
        disable: jest.fn()
      },
    };
  };
});

jest.mock('swiper/modules', () => ({
  Navigation: {},
  Pagination: {},
  Mousewheel: {},
  Autoplay: {},
  Keyboard: {},
  Scrollbar: {},
  EffectCoverflow: {},
  EffectCube: {},
  EffectFlip: {}
}));

describe('leaflet_components', () => {
  it('init', () => {
    const localVue = createLocalVue();
    localVue.use(components);
    expect(localVue.component('SmWebMap')).not.toBeNull();
  });
});
