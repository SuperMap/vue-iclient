<template>
  <div class="sm-component-text" :style="[customStyle, textColorStyle, gisControlBgStyle]">
    <span v-if="href">
      <a
        :target="target"
        :href="href"
        class="sm-component-text__href"
        :style="[textColorStyle]"
      >{{ finalValue }}</a>
    </span>
    <span v-else class="sm-component-text__span">{{ finalValue }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import type { TextProps } from './types'
import { textPropsDefault } from './types'
import { useTimer, useTheme, useThirdService } from '@supermapgis/common/hooks/index.common'

defineOptions({
  name: 'SmText'
})

const props = withDefaults(defineProps<TextProps>(), textPropsDefault)
const finalValue = ref(props.title);

const { textColorStyle, gisControlBgStyle } = useTheme(props)
const { restService, getData } = useThirdService(props, finalValue);
useTimer(props, { timing });

const customStyle = computed(() => {
  let style = Object.assign({}, props.fontStyle);
  if (style.textAlign && !style.justifyContent) {
    style.justifyContent = 
      style.textAlign === 'left' ? 'flex-start' :
      style.textAlign === 'right' ? 'flex-end' : 'center';
    delete style.textAlign;
  }
  return style;
});

watch(() => props.title, (val) => {
  finalValue.value = val;
});

onBeforeUnmount(() => {
  restService.value?.remove('getdatasucceeded');
});

function timing() {
  getData();
};
</script>
