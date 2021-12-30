<template>
  <swiper-slide class="sm-component-slideshowitem">
    <slot></slot>
  </swiper-slide>
</template>
<script>
import { SwiperSlide } from './Swiper';
import 'swiper/swiper-bundle.min.css';

export default {
  name: 'SmSlideshowItem',
  __SM_SLIDESHOW_ITEM: true,
  components: {
    SwiperSlide
  }
};
</script>
