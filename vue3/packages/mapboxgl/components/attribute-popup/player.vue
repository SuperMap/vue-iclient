<template>
  <div class="player">
    <ImagePreview
      v-if="type === 'IMAGE' && loadImg"
      :src="value"
      :previewMode="options.previewMode"
      width="100%"
      @error="() => handleImageLoad(false)"
      @load="() => handleImageLoad(true)"
    />
    <video
      v-if="type === 'VIDEO' && loadVideo"
      v-bind="options"
      :src="value"
      :style="{ objectFit: options.objectFit }"
      @error="() => handleVideoLoad(false)"
      @load="() => handleVideoLoad(true)"
    ></video>
    <div v-if="!loadImg || !loadVideo" class="sm-player-loade-error" :title="t('error.loadError')">
      <i class="sm-components-icon-jiazaishibai" v-if="!loadImg || !loadVideo"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { videoOptions, imageOptions } from './types'
import { ref } from 'vue'
import { useLocale } from '@supermapgis/common/hooks/index.common'
import ImagePreview from '@supermapgis/common/components/image/image.vue'

const { t } = useLocale()

defineProps({
  type: {
    type: String as PropType<'IMAGE' | 'VIDEO'>,
    default: ''
  },
  value: {
    type: String,
    default: ''
  },
  options: {
    type: Object as PropType<imageOptions | videoOptions>,
    default: () => ({
      autoplay: false,
      objectFit: 'fill',
      loop: false,
      muted: true,
      controls: true
    })
  }
})
const loadVideo = ref(true)
const loadImg = ref(true)

const handleImageLoad = status => {
  loadImg.value = status
}
const handleVideoLoad = status => {
  loadVideo.value = status
}
</script>

<style scoped></style>
