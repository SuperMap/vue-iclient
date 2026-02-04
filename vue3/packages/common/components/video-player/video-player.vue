<template>
  <div :class="['sm-component-video-player', { 'sm-component-video-full-fill': isFullFill }]">
    <VueVideoPlayer
      v-show="!modalVisible"
      class="sm-component-video-player__player sm-component-video-player__player--main"
      :src="url"
      :events="['fullscreenchange']"
      :playsinline="true"
      v-bind="playerOptions"
      @play="onPlayerPlay"
      @ended="onPlayerEnded"
      @fullscreenchange="onFullscreenchange"
      @mounted="setPlayer"
      @unmounted="setPlayer"
    ></VueVideoPlayer>
    <Modal
      v-if="url"
      v-model:open="modalVisible"
      wrapClassName="sm-component-video-player-modal"
      width="60%"
      :class="{ 'sm-component-video-full-fill': isFullFill }"
      :footer="null"
      :maskClosable="false"
    >
      <VueVideoPlayer
        class="sm-component-video-player__player"
        :src="url"
        :playsinline="true"
        v-bind="modalPlayerOptions"
        @mounted="setModalPlayer"
        @unmounted="setModalPlayer"
      ></VueVideoPlayer>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import flvjs from 'flv.js'
import 'videojs-flvjs-es6'
import { VideoPlayer as VueVideoPlayer } from 'vue-video-player'
import { useLocale } from '@supermapgis/common/hooks/index.common'
import { videoPlayerPropsDefault, VideoPlayerProps, PlayerOptions, Ratio, PreviewMode } from './types'

const [messageApi] = message.useMessage()
const { t: $t } = useLocale()

const props = withDefaults(defineProps<VideoPlayerProps>(), videoPlayerPropsDefault)

const emit = defineEmits(['instance-loaded'])

// Data
const isFirst = ref(true)
const modalVisible = ref(false)
const playerOptions = ref<PlayerOptions>({})
const modalPlayerOptions = ref<PlayerOptions>({})

// Computed properties
const isFullFill = computed(() => {
  return props.ratio === Ratio.Full
})
const isFullscreen = computed(() => {
  return props.previewMode === PreviewMode.Fullscreen
})
const popupToPlay = computed(() => {
  return props.previewMode === PreviewMode.PopupToPlay
})
const isFlv = computed(() => {
  if (!flvjs && checkUrl(props.url) && props.url.includes('.flv')) {
    console.error($t('warning.flvPlayer'))
    return false
  }
  // @ts-ignore
  return flvjs.isSupported() && checkUrl(props.url) && props.url.includes('.flv')
})

let normalPlayer: any = null
let modelPlayer: any = null

// Watchers
watch(
  () => modalVisible.value,
  newVal => {
    if (newVal && modelPlayer) {
      handlePlayerOptions()
      modelPlayer.currentTime(0)
      modelPlayer.play()
    }
    if (!newVal && modelPlayer) {
      modelPlayer.reset()
    }
  }
)

watch(
  () => props.url,
  () => {
    handlePlayerOptions()
  }
)

watch(
  () => playerOptions.value,
  () => {
    const player = modalVisible.value ? modelPlayer : normalPlayer
    if (player && player.el_) {
      player.load()
    }
  },
  { deep: true }
)

watch(
  () => props.options,
  () => {
    handlePlayerOptions()
  },
  { deep: true }
)

// Lifecycle hooks
onMounted(() => {
  handlePlayerOptions()
})

// Methods
const setPlayer = e => {
  normalPlayer = e?.player
  getPlayer(normalPlayer)
}
const setModalPlayer = e => {
  modelPlayer = e?.player
  getPlayer(modelPlayer)
}
const getPlayer = player => {
  setTimeout(() => {
    if (player) {
      player.muted(props.options.muted)
      if (props.options.muted) {
        player.volume(0)
      }
    }
    emit('instance-loaded', player)
  })
}

const clearSrc = () => {
  if (playerOptions.value.sources) {
    playerOptions.value.sources[0].src = ''
  }
  if (modalPlayerOptions.value.sources) {
    modalPlayerOptions.value.sources[0].src = ''
  }
}

const handlePlayerOptions = (options = props.options) => {
  if (!props.url) {
    clearSrc()
    playerOptions.value.suppressNotSupportedError = true
    return {}
  }
  if (!checkUrl(props.url)) {
    messageApi.warning($t('warning.unsupportedVideoAddress'), 1)
    clearSrc()
    return {}
  }
  if (!isMatchPosterUrl(options.poster)) {
    messageApi.warning($t('warning.unsupportedPosterAddress'), 1)
  }

  const commonOptions: PlayerOptions = {
    ...options,
    fluid: false,
    language: 'zh-CN',
    playbackRates: [0.7, 1.0, 1.5, 2.0],
    sources: [
      {
        src: props.url
      }
    ],
    techOrder: ['html5'],
    flvjs: {
      mediaDataSource: {
        isLive: true,
        cors: true,
        hasAudio: true
      }
    },
    preload: 'auto',
    poster: options.poster || '',
    notSupportedMessage: $t('warning.unavailableVideo')
  }

  if (props.url.includes('.flv')) {
    commonOptions.techOrder = ['html5', 'flvjs']
    commonOptions.sources[0].type = 'video/x-flv'
  }
  if (props.url.includes('.mp4')) {
    commonOptions.sources[0].type = 'video/mp4'
  }
  if (props.url.includes('.m3u8')) {
    commonOptions.sources[0].type = 'application/x-mpegURL'
  }

  playerOptions.value = { ...commonOptions, autoplay: options.autoplay }
  modalPlayerOptions.value = { ...commonOptions, autoplay: true, preload: 'none', height: 600 }

  return commonOptions
}

const onPlayerPlay = () => {
  const player = normalPlayer
  if (!player || !checkUrl(props.url)) {
    return
  }
  if (isFirst.value && popupToPlay.value) {
    messageApi.info($t('info.pressEscToExit'), 3)
  }
  if (isFirst.value && !popupToPlay.value && !props.options.autoplay) {
    player.currentTime(0)
    isFirst.value = false
  }
  if (popupToPlay.value) {
    player.pause()
    player.currentTime(1)
    player.controlBar.el_.style.visibility = 'hidden'
    modalVisible.value = true
  }
  modalVisible.value = popupToPlay.value
  if (!popupToPlay.value && isFullscreen.value) {
    player.requestFullscreen()
  }
}

const onFullscreenchange = (e: any) => {
  if (!e.isFullscreen()) {
    e.pause()
  }
}

const onPlayerEnded = () => {
  if (!props.options.autoplay && !popupToPlay.value) {
    isFirst.value = true
  }
}

const checkUrl = (url: string) => {
  let match
  if (
    url === '' ||
    !isMatchVideoUrl(url) ||
    (url.indexOf('ogg') < 0 &&
      url.indexOf('mp4') < 0 &&
      url.indexOf('webm') < 0 &&
      url.indexOf('m3u8') < 0 &&
      url.indexOf('flv') < 0)
  ) {
    match = false
  } else {
    match = true
  }
  return match
}

const isMatchVideoUrl = (str: string) => {
  if (!str) return false
  const isFilePath = isMatchFileUrl(str)
  if (isFilePath) return true
  const reg = new RegExp(
    '(https?|http|file|ftp)://[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]'
  )
  return reg.test(str)
}

const isMatchPosterUrl = (str: string) => {
  if (!str) return true
  const isFilePath = isMatchFileUrl(str)
  if (isFilePath) return true
  const reg = new RegExp('(https?|http|file)://[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]')
  return reg.test(str)
}

const isMatchFileUrl = (str: string) => {
  const patt = /^((\.\.\/)|(\.\/))/g
  return patt.test(str)
}

defineExpose<{ isFlv: boolean }>({
  isFlv: isFlv.value
})
</script>
