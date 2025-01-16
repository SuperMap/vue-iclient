import {
  Swiper as SwiperClass,
  Navigation,
  Pagination,
  Mousewheel,
  Autoplay,
  Keyboard,
  Scrollbar,
  EffectCoverflow,
  EffectCube,
  EffectFlip
} from 'swiper/core';
import getAwesomeSwiper from 'vue-awesome-swiper/dist/exporter';

SwiperClass.use([
  Navigation,
  Pagination,
  Autoplay,
  Mousewheel,
  Keyboard,
  Scrollbar,
  EffectCoverflow,
  EffectCube,
  EffectFlip
]);
const { Swiper, SwiperSlide } = getAwesomeSwiper(SwiperClass);

export default Swiper;
export { SwiperSlide, SwiperClass };
