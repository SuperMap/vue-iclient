<template>
  <div class="player">
    <img
        v-if="type === 'IMAGE'"
        :src="value"
      />
      <video
        v-if="type === 'VIDEO'"
        controls
        @error="onErrorVideo"
      >
        <source :src="value" ></source>
      </video>
      <ImageTip icon="fv-icons-load-failed">{loadFailedTip}</ImageTip>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import {ref} from 'vue'

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
const loadFailedTip = ref('')
const onErrorVideo = () => {
  loadFailedTip.value = '加载失败'
}
</script>

<style scoped>

</style>