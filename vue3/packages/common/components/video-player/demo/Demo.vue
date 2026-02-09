<script setup lang="ts">
import VideoPlayer from '../video-player.vue'
import '../style'
import { ref } from 'vue'
const options = ref({
  controls: true,
  popupToPlay: false,
  loop: false, 
  autoplay: false,
  muted: false,
  // poster: 'https://p1.meituan.net/biztone/1730f0baefe95984e632a52590f0b446393917.jpg%40watermark%3D0'
})
</script>
<template>
  <div>
    <VideoPlayer
      style="width: 600px; height: 400px"
      url="https://www.runoob.com/try/demo_source/mov_bbb.mp4"
      :options="options"
      :isFullscreen="false"
      ratio="full"
    ></VideoPlayer>
    <!-- <VideoPlayer
      style="width: 600px; height: 400px"
      url="https://iserver.supermap.io/iserver/services/video/restjsr/hls/stream/VideoData-DJI_09304/1/index.m3u8"
      :options="{ ...options, popupToPlay: false }"
    ></VideoPlayer> -->
  </div>
</template>
