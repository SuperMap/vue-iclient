<template>
  <div class="sm-component-image" :style="[textColorStyle, gisControlBgStyle]">
    <a :class="['sm-component-image__link']" :href="realHref" @click="handleLinkClick" :target="target">
      <div v-if="src" @click="startPreview" class="sm-component-image__content" :style="[repeatStyle, imgUrl]">
        <!-- 用img标签确保没有给定宽高时，能使用src图片的宽高 -->
        <img :src="src" style="visibility: hidden; max-width: 100%; max-height: 100%" />
      </div>
      <i v-else class="sm-components-icon-tupian sm-component-image__defaultImg"></i>
    </a>
    <Modal v-model:open="previewVisible" :zIndex="1009" centered :width="isFull ? '100%' : '50%'"
      :wrapClassName="isFull ? 'sm-component-image__full' : 'sm-component-image__preview'" :footer="null">
      <img :src="src" @click="endPreview" :style="{ 'object-fit': 'contain', width: '100%', height: '100%' }" />
    </Modal>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { imagePropsDefault } from './types'
import type { ImageProps } from './types'
import { parseUrl } from 'vue-iclient-core/utils/util';
import { useTheme, useLocale } from '@supermapgis/common/hooks/index.common';
import { Modal, message } from 'ant-design-vue'

defineOptions({
  name: 'SmImage'
})

const { t } = useLocale();
const props = withDefaults(defineProps<ImageProps>(), imagePropsDefault)
const { textColorStyle, gisControlBgStyle } = useTheme(props)

const previewVisible = ref(false);
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
};

const isFull = computed(() => {
  return props.previewMode === 'full';
})

const repeatStyle = computed(() => {
  return repeatOption[props.repeat];
});

const imgUrl = computed(() => {
  return {
    backgroundImage: `url(${props.src})`
  };
});

const realHref = computed(() => {
  let href = props.href.replace(/ /g, '');
  if (href && !parseUrl(href)) {
    return `http://${href}`;
  }
  return href;
});

const handleLinkClick = (e: Event) => {
  if (!props.href) {
    e.preventDefault();
  }
};

const startPreview = () => {
  if (props.previewMode === 'none') {
    return;
  }
  message.info(
    props.previewMode === 'popup' ? t('info.pressEscToExit') : t('info.pressEscOrClickToExit'),
    3
  );
  previewVisible.value = true;
};

const endPreview = () => {
  previewVisible.value = false;
};
</script>
