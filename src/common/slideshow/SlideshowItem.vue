<template>
  <swiper-slide class="sm-component-slideshowitem">
    <slot></slot>
  </swiper-slide>
</template>
<script>
import { SwiperSlide } from 'vue-awesome-swiper';
import 'swiper/css/swiper.css';

export default {
  name: 'SmSlideshowItem',
  __SM_SLIDESHOW_ITEM: true,
  components: {
    SwiperSlide
  }
};
</script>
