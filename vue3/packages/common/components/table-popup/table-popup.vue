<template>
  <div
    ref="root"
    :class="{ 'sm-component-table-popup': true, 'with-split-line': splitLine }"
    :style="[popupBgStyle, textColorStyle]"
  >
    <sm-table
      class="sm-component-table-popup__table"
      :data-source="data"
      :columns="columns"
      :pagination="false"
      :show-header="showHeader"
    />
  </div>
</template>

<script setup lang="ts">
import type { TablePopupProps } from './types'
import { watch, onMounted, useTemplateRef } from 'vue'
import { setPopupArrowStyle } from 'vue-iclient-core/utils/util'
import { useTheme } from '@supermapgis/common/components/theme/theme'
import SmTable from '@supermapgis/common/components/table/Table'
import { tablePopupPropsDefault } from './types'

defineOptions({
  name: 'SmTablePopup'
})

const props = withDefaults(defineProps<TablePopupProps>(), tablePopupPropsDefault)

const root = useTemplateRef('root')
const { popupBgStyle, textColorStyle, textColorHeadingStyle, gisControlHeaderBgStyle } = useTheme(props)

defineExpose({
  root
})

watch(
  () => gisControlHeaderBgStyle.value.background,
  newBackground => {
    setTheadStyle('background', newBackground)
  }
)

watch(
  () => popupBgStyle.value.background,
  newBackground => {
    setPopupArrowStyle(newBackground)
  }
)

watch(
  () => textColorHeadingStyle.value.color,
  newColor => {
    setTheadStyle('color', newColor)
  }
)

onMounted(() => {
  setTheadStyle('color', textColorHeadingStyle.value.color)
  setTheadStyle('background', gisControlHeaderBgStyle.value.background)
})

function setTheadStyle (attr: string, value: string) {
  const tableEl = document.querySelector('.sm-component-table-popup__table')
  if (!tableEl) return

  const thList = tableEl.querySelectorAll('tr > th')
  thList.forEach((item: HTMLElement) => {
    item.style[attr] = value
  })
}
</script>
