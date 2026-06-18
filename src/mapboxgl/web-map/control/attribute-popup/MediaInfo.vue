<template>
  <div class="sm-media-info">
    <sm-slideshow
      v-if="infos.length > 1"
      v-model="sliderIndex"
      :collapsed="false"
      :autoplay="false"
      headerName=""
      iconClass=""
      :navigation="navigation"
      :allowSlidePrev="false"
      style="width: 100%; height: auto"
    >
      <sm-slideshow-item v-for="(item, index) in infos" :key="index">
        <SmPlayer :type="item.type" :value="item.value" :title="item.title" :options="item.options" />
      </sm-slideshow-item>
      <div
        class="sm-components-icon-solid-right"
        slot="button-prev"
        style="left: 10px"
      ></div>
      <div
        class="sm-components-icon-solid-left"
        slot="button-next"
        style="right: 10px;"
      ></div>
    </sm-slideshow>
    <SmPlayer
      v-else-if="infos.length === 1"
      :type="infos[0].type"
      :value="infos[0].value"
      :options="infos[0].options"
    />
    <span v-if="infos.length > 1" class="pagination">{{ currentIndex }} / {{ infos.length }}</span>
    <span class="title" :style="currentInfo.titleStyle">{{ currentInfo.title }}</span>
  </div>
</template>

<script>
import SmPlayer from './Player.vue';
import SmSlideshow from 'vue-iclient/src/common/slideshow/Slideshow.vue';
import SmSlideshowItem from 'vue-iclient/src/common/slideshow/SlideshowItem.vue';

export default {
  name: 'SmMediaInfo',
  components: { SmPlayer, SmSlideshow, SmSlideshowItem },
  props: {
    infos: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      sliderIndex: 0,
      navigation: {
        nextEl: '.sm-components-icon-solid-left',
        prevEl: '.sm-components-icon-solid-right',
        hideOnClick: true
      }
    };
  },
  computed: {
    currentInfo() {
      return this.infos[this.sliderIndex] || {};
    },
    currentIndex() {
      return this.sliderIndex + 1;
    }
  },
  watch: {
    infos: {
      handler() {
        this.sliderIndex = 0;
      },
      deep: true
    }
  },
  methods: {
    // onSlideChange(swiper) {
    //   this.sliderIndex = swiper.activeIndex;
    // }
  }
};
</script>
