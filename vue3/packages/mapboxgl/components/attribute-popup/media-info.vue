<template>
  <div class="sm-media-info">
    <swiper
      v-if="infos.length > 1"
      :navigation="true"
      :modules="[Navigation]"
      @slideChange="onSlideChange"
      style="width: 100%"
    >
      <template v-for="({ type, title, value }) in infos">
        <swiper-slide>
          <Player :type="type" :value="value" :title="title" />
        </swiper-slide>
      </template>
    </swiper>
    <template v-else>
      <Player :type="infos[0].type" :value="infos[0].value" :title="infos[0].title" />
    </template>
    <span v-if="infos.length > 1" class="pagination">{{ currentIndex }} / {{ infos.length }}</span>
    <span class="title">{{ title }}</span>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'
import { ref, computed } from 'vue'
import Player from './player.vue'
import 'swiper/swiper-bundle.css'

interface Infos {
  value: string
  title?: string
  type: 'IMAGE' | 'VIDEO'
}
const props = defineProps({
  infos: {
    type: Array as PropType<Infos[]>,
    default: () => []
  }
})
const sliderIndex = ref(0)
const title = computed(() => props.infos?.[sliderIndex.value].title)
const currentIndex = computed(() => sliderIndex.value + 1)
const onSlideChange = swiper => {
  sliderIndex.value = swiper.activeIndex
}
</script>

<style scoped></style>
