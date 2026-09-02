<template>
  <div class="sm-component-image" :style="[textColorStyle, containerBgStyle]">
    <a
      :class="['sm-component-image__link']"
      :href="realHref || undefined"
      @click="handleLinkClick"
      :target="target"
    >
      <div
        v-if="displaySrc"
        @click="startPreview"
        class="sm-component-image__content"
        :style="[repeatStyle, imgUrl]"
      >
        <!-- 用img标签确保没有给定宽高时，能使用src图片的宽高；no-referrer 规避防盗链 -->
        <img
          :src="displaySrc"
          referrerpolicy="no-referrer"
          @error="e => emit('error', e)"
          @load="e => emit('load', e)"
        />
      </div>
      <i v-else class="sm-components-icon-tupian sm-component-image__defaultImg"></i>
    </a>
    <Modal
      v-model:open="previewVisible"
      :zIndex="1009"
      centered
      :width="isFull ? '100%' : '50%'"
      :wrapClassName="isFull ? 'sm-component-image__full' : 'sm-component-image__preview'"
      :footer="null"
    >
      <img
        :src="displaySrc"
        referrerpolicy="no-referrer"
        @click="endPreview"
        :style="{ 'object-fit': 'contain', width: '100%', height: '100%' }"
        @error="e => emit('error', e)"
        @load="e => emit('load', e)"
      />
    </Modal>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { imagePropsDefault } from './types'
import type { ImageProps } from './types'
import { parseUrl } from 'vue-iclient-core/utils/util'
import { useTheme, useLocale, useNoReferrerImageUrl } from '@supermapgis/common/hooks/index.common'
import { toLatinNumber } from '@supermapgis/common/utils/index.common'
import { Modal, message } from 'ant-design-vue'

defineOptions({
  name: 'SmImage'
})

const emit = defineEmits(['load', 'error'])

const { t } = useLocale()
const props = withDefaults(defineProps<ImageProps>(), imagePropsDefault)
const { textColorStyle, containerBgStyle } = useTheme(props)

const previewVisible = ref(false)
const repeatOption = {
  center: {
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'contain'
  },
  left: {
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'left center',
    backgroundSize: 'contain'
  },
  noRepeat: {
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat'
  },
  repeatX: {
    backgroundRepeat: 'repeat-x',
    backgroundSize: 'auto 100%'
  },
  repeatY: {
    backgroundRepeat: 'repeat-Y',
    backgroundSize: '100% auto'
  },
  repeatXY: {
    backgroundRepeat: 'repeat',
    backgroundSize: 'auto'
  }
}

const isFull = computed(() => {
  return props.previewMode === 'full'
})

const repeatStyle = computed(() => {
  return repeatOption[props.repeat]
})

const safeSrc = computed(() => {
  if (!props.src) {
    return ''
  }
  return toLatinNumber(String(props.src)).replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, '').trim()
})

// 外链防盗链：CSS background-image 无法设 referrerpolicy，经 no-referrer fetch 转 blob 后再渲染
const displaySrc = useNoReferrerImageUrl(safeSrc)

const imgUrl = computed(() => {
  const src = displaySrc.value
  if (!src) {
    return {}
  }
  const escaped = src.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  return {
    backgroundImage: `url("${escaped}")`
  }
})

const realHref = computed(() => {
  let href = toLatinNumber(props.href.replace(/ /g, '')).replace(
    /[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g,
    ''
  )
  if (href && !parseUrl(href)) {
    return `http://${href}`
  }
  return href
})

const handleLinkClick = (e: Event) => {
  if (!props.href) {
    e.preventDefault()
  }
}

const startPreview = () => {
  if (props.previewMode === 'none') {
    return
  }
  message.info(
    props.previewMode === 'popup' ? t('info.pressEscToExit') : t('info.pressEscOrClickToExit'),
    3
  )
  previewVisible.value = true
}

const endPreview = () => {
  previewVisible.value = false
}
</script>
