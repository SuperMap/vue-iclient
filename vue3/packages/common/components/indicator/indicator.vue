<template>
  <div class="sm-component-indicator" :style="gisControlBgStyle" @click="handleClick">
    <div :class="`sm-component-indicator__content sm-component-indicator__content-${mode}`">
      <span
        v-show="showTitleUnit"
        class="sm-component-indicator__title"
        :style="[unit_titleStyle, textColorStyle]"
      >
        {{ titleData }}
      </span>
      <div>
        <span class="sm-component-indicator__num" :style="indicatorStyle">
          <countTo
            v-if="isNumber(indicatorNum)"
            :decimals="calDecimals"
            :startVal="startData"
            :endVal="numData"
            :duration="Number(duration) || 1000"
            :separator="filterSeparator"
            :numBackground="numBackground"
            :numSpacing="numSpacing"
            :separatorBackground="separatorBackground"
            :fontSize="parseFloat(fontSize as any) + fontUnit"
          ></countTo>
          {{ isNumber(indicatorNum) ? '' : indicatorNum }}
        </span>
        <span
          v-show="showTitleUnit"
          class="sm-component-indicator__unit"
          :style="[unit_titleStyle, textColorStyle]"
        >
          {{ unitData }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { IndicatorProps, IndicatorEvents } from './types'
import { ref, computed, watch, onMounted, onBeforeUnmount, defineProps, defineEmits } from 'vue'
import { indicatorPropsDefault } from './types'
import { useTimer, useTheme } from '@supermapgis/common/hooks/index.common'
import RestService from 'vue-iclient-core/utils/RestService'
import CountTo from './count-to.vue'

defineOptions({
  name: 'SmIndicator'
})

const props = withDefaults(defineProps<IndicatorProps>(), indicatorPropsDefault)
const emit = defineEmits<IndicatorEvents>()

const { textColorStyle, gisControlBgStyle, colorPrimary } = useTheme(props)

const titleData = ref(props.title)
const unitData = ref(props.unit)
const numData = ref(0)
const startData = ref(0)
const indicatorNum = ref(0)
const indicatorColorData = ref(props.indicatorColor || '')

let fetchProperties: Record<string, any>
let restService: RestService

const unit_titleStyle = computed(() => ({
  fontSize: props.textFontSize || parseFloat(props.fontSize as any) * 0.66 + fontUnit.value,
  fontWeight: props.fontWeight
}))

const fontUnit = computed(() => {
  const reg = /\d+(\.\d+)?([a-z]+)/gi
  const fontUnit =
    props.fontSize && isNaN(+props.fontSize) ? (props.fontSize as string).replace(reg, '\$2') : 'px'
  return fontUnit
})

const indicatorStyle = computed(() => {
  let color = indicatorColorData.value
  if (!isNaN(indicatorNum.value) && props.thresholdsStyle) {
    const matchStyle = props.thresholdsStyle.find(item => {
      let status: boolean | undefined
      if (item.min) {
        status = +indicatorNum.value >= +item.min
      }
      if (item.max) {
        status = status === undefined ? true : status
        status = status && +indicatorNum.value <= +item.max
      }
      return status
    })
    if (matchStyle) {
      color = matchStyle.color
    }
  }
  let style: { color: string; fontSize?: string } = { color }
  if (typeof indicatorNum.value === 'string') {
    style.fontSize = parseFloat(props.fontSize as any) + fontUnit.value
  }
  return style
})

const filterSeparator = computed(() => props.separator.replace(/\d+/, ''))

const calDecimals = computed(() => {
  if (props.decimals >= 0) {
    return props.decimals
  }
  if (numData.value.toString().split('.')[1]) {
    return numData.value.toString().split('.')[1].length
  }
  return 0
})

// Methods
const partsOfPropsWatcher = () => {
  const propsFields = ['title', 'unit', 'num', 'titleField', 'unitField', 'numField']
  propsFields.forEach(prop => {
    watch(
      () => props[prop],
      function (next) {
        switch (prop) {
          case 'title':
            titleData.value = next
            break
          case 'titleField':
            if (fetchProperties && Object.prototype.hasOwnProperty.call(fetchProperties, next)) {
              titleData.value = fetchProperties[props.titleField]
            } else {
              titleData.value = props.title
            }
            break
          case 'unit':
            unitData.value = next
            break
          case 'unitField':
            if (fetchProperties && Object.prototype.hasOwnProperty.call(fetchProperties, next)) {
              unitData.value = fetchProperties[props.unitField]
            } else {
              unitData.value = props.unit
            }
            break
          case 'num':
            changeNumData(next)
            break
          case 'numField':
            if (fetchProperties && Object.prototype.hasOwnProperty.call(fetchProperties, next)) {
              changeNumData(fetchProperties[props.numField])
            } else {
              changeNumData(props.num)
            }
            break
        }
      }
    )
  })
}
const isNumber = str => /^\d+(\.\d*)?$/.test(str)

const timing = () => {
  getData()
}

const fetchData = ({ features }) => {
  if (features && !!features.length) {
    const properties = features[0].properties
    fetchProperties = properties
    unitData.value = Object.prototype.hasOwnProperty.call(properties, props.unitField)
      ? properties[props.unitField]
      : props.unit
    Object.prototype.hasOwnProperty.call(properties, props.numField)
      ? changeNumData(properties[props.numField])
      : changeNumData(props.num)
    titleData.value = Object.prototype.hasOwnProperty.call(properties, props.titleField)
      ? properties[props.titleField]
      : props.title
  }
}
const getData = () => {
  getRestService().getData(props.url)
}
const changeNumData = newData => {
  const newStartData = props.animated ? +numData.value : +newData
  startData.value = isNaN(newStartData) ? 0 : newStartData
  numData.value = +newData
  indicatorNum.value = newData
}

const getRestService = () => {
  if (!restService) {
    restService = new RestService({ proxy: props.proxy })
    restService.on({ getdatasucceeded: fetchData })
  }
  return restService
}
const handleClick = () => {
  emit('click', indicatorNum.value)
}

// Watchers
watch(
  () => props.url,
  val => {
    if (val) {
      getData()
    } else {
      unitData.value = props.unit
      changeNumData(props.num)
      titleData.value = props.title
      fetchProperties = null
    }
  },
  { immediate: true }
)

watch(
  () => props.indicatorColor,
  val => {
    indicatorColorData.value = val
  }
)

watch(
  () => props.proxy,
  () => {
    restService && restService.setProxy(props.proxy)
    if (props.url) {
      getData()
    }
  }
)

watch(indicatorNum, val => {
  emit('indicatorNumChange', val)
})

onMounted(() => {
  indicatorColorData.value = props.indicatorColor || colorPrimary.value
  partsOfPropsWatcher()
})
onBeforeUnmount(() => {
  restService?.remove('getdatasucceeded')
})
useTimer(props, { timing })
</script>
