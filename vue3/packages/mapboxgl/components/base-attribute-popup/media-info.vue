<template>
  <div class="sm-media-info">
    <template v-if="infos.length > 1">
      <swiper
        v-model:activeIndex="sliderIndex"
        :navigation="true"
        :modules="[Navigation]"
        @swiper="swiperInit"
        @slideChange="onSlideChange"
      >
        <template v-for="{ type, title, value, options } in infos">
          <swiper-slide>
            <Player :type="type" :value="value" :title="title" :options="options" />
          </swiper-slide>
        </template>
      </swiper>
      <span class="pagination">{{ paginationText }}</span>
    </template>
    <template v-else>
      <Player :type="infos[0].type" :value="infos[0].value" :options="infos[0].options" />
    </template>
    <span class="title" :style="currentInfo.titleStyle">{{ currentInfo.title }}</span>
  </div>
</template>

<script setup lang="ts">
import type { PropType, CSSProperties } from 'vue'
import type { imageOptions, videoOptions } from './types'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'
import { ref, computed, watch, shallowRef } from 'vue'
import Player from './player.vue'
import {
  shouldTransformArabicNumbers,
  toArabicNumber
} from '@supermapgis/common/utils/index.common'

interface Infos {
  value: string
  title?: string
  type: 'IMAGE' | 'VIDEO'
  titleStyle?: CSSProperties
  options?: imageOptions | videoOptions
}
const props = defineProps({
  infos: {
    type: Array as PropType<Infos[]>,
    default: () => []
  }
})
const sliderIndex = ref(0)
const swiperVal = shallowRef()
const currentInfo = computed(() => props.infos?.[sliderIndex.value])
const currentIndex = computed(() => sliderIndex.value + 1)
const paginationText = computed(() => {
  const text = `${currentIndex.value} / ${props.infos.length}`
  return shouldTransformArabicNumbers() ? toArabicNumber(text) : text
})
const onSlideChange = swiper => {
  sliderIndex.value = swiper.activeIndex
}

const swiperInit = swiper => {
  swiperVal.value = swiper
}

watch(
  () => props.infos,
  () => {
    swiperVal.value?.slideTo(0)
    sliderIndex.value = 0
  },
  {
    deep: true
  }
)
</script>
