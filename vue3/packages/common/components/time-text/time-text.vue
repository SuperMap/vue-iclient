<template>
  <div class="sm-component-time-text" :style="[fontStyle, textColorStyle, gisControlBgStyle]">
    <span>{{ time }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import type { TimeTextProps } from './types';
import { timeTextPropsDefault } from './types'
import { getDateTime } from 'vue-iclient-core/utils/util';
import { useTheme } from '@supermapgis/common/components/theme/theme'

const props = withDefaults(defineProps<TimeTextProps>(), timeTextPropsDefault)
const { textColorStyle, gisControlBgStyle } = useTheme(props)

const time = ref('');
const timeInterval = ref(null);

watch(() => props.timeType, () => {
  initTime(props.timeType)
})

onMounted(() => {
  initTime(props.timeType)
})

onBeforeUnmount(() => {
  clearInterval(timeInterval.value) 
})

function initTime(timeType) {
  clearInterval(timeInterval.value);
  time.value = getDateTime(timeType);
  timeInterval.value = setInterval(() => {
    time.value = getDateTime(timeType); 
  }, 1000)
}
</script>