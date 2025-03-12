<template>
  <div class="sm-component-time-text" :style="[fontStyle, textColorStyle, gisControlBgStyle]">
    <span>{{ time }}</span>
  </div>
</template>

<script setup lang="ts">
import type { TimeTextProps } from './types'
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useTheme } from '@supermapgis/common/components/theme/theme'
import { timeTextPropsDefault } from './types'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'

dayjs.extend(localizedFormat)

const props = withDefaults(defineProps<TimeTextProps>(), timeTextPropsDefault)

const { textColorStyle, gisControlBgStyle } = useTheme(props)

const time = ref('')
const timeInterval = ref(null)

watch(
  () => props.timeType,
  () => {
    initTime(props.timeType)
  }
)

onMounted(() => {
  initTime(props.timeType)
})

onBeforeUnmount(() => {
  clearInterval(timeInterval.value)
})

function initTime(timeType) {
  clearInterval(timeInterval.value)
  time.value = getDateTime(timeType)
  timeInterval.value = setInterval(() => {
    time.value = getDateTime(timeType)
  }, 1000)
}
const getDateTime = timeType => {
  const type = timeType.split('+')
  const DATAJS_LOCAL = {
    date: 'LL',
    week: 'dddd',
    second: 'LTS'
  }
  const getTimeFormat = val => (type.includes(val) ? DATAJS_LOCAL[val] : '')
  const date = getTimeFormat('date')
  const week = getTimeFormat('week')
  const second = getTimeFormat('second')
  const now = dayjs()
  if (dayjs.locale().includes('zh')) {
    return now.format(`${date}${week} ${second}`)
  }
  const timeFormat = [week, date, second].filter(item => item).join(', ')
  return now.format(timeFormat)
}
</script>
