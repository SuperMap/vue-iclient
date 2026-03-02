<template>
  <div class="swiper-slide sm-component-slideshowitem"><slot></slot></div>
</template>
<script>
import 'swiper/swiper-bundle.min.css';

export default {
  name: 'SmSlideshowItem',
  __SM_SLIDESHOW_ITEM: true
};
</script>
