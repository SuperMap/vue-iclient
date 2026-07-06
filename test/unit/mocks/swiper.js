function Swiper() {
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
    }
  };
}

const modules = {
  Navigation: {},
  Pagination: {},
  Mousewheel: {},
  Autoplay: {},
  Keyboard: {},
  Scrollbar: {},
  EffectCoverflow: {},
  EffectCube: {},
  EffectFlip: {}
};

module.exports = Swiper;
module.exports.Swiper = Swiper;
module.exports.default = Swiper;
