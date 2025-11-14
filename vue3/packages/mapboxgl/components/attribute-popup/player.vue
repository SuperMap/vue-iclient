<template>
  <div class="player">
    <img
      v-if="type === 'IMAGE' && loadImg"
      :src="value"
      width="100%"
      @error="() => handleImageLoad(false)"
      @load="() => handleImageLoad(true)"
    />
    <video
      v-if="type === 'VIDEO' && loadVideo"
      :src="value"
      controls
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
import { ref } from 'vue'
import { useLocale } from '@supermapgis/common/hooks/index.common'

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
  title: {
    type: String,
    default: ''
  }
})
const loadVideo = ref(true)
const loadImg = ref(true)

const handleImageLoad = status => {
  loadImg.value = status
}
const handleVideoLoad = status => {
  console.log('可以播放', status)
  loadVideo.value = status
}
</script>

<style scoped></style>
