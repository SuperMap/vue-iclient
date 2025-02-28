<template>
  <div
    class="sm-component-attribute-panel"
    :style="[textColorStyle, !showBorder && { border: 'none' }]"
  >
    <div class="sm-component-attribute-panel__header">
      <div v-if="!slots.header && title !== undefined" class="title ellipsis" :title="title">
        {{ title }}
      </div>
      <slot name="header" />
    </div>
    <div class="sm-component-attribute-panel__content">
      <sm-table-popup v-bind="tablePopupProps" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AttributePanelProps } from './types'
import { computed, useSlots } from 'vue'
import { useTheme } from '@supermapgis/common/components/theme/theme'
import SmTablePopup from '@supermapgis/common/components/table-popup/table-popup.vue'
import { attributePanelPropsDefault } from './types'

defineOptions({
  name: 'SmAttributePanel'
})

const props = withDefaults(defineProps<AttributePanelProps>(), attributePanelPropsDefault)

const { textColorStyle } = useTheme(props)
const slots = useSlots()

const tablePopupProps = computed(() => {
  return {
    data: props.attributes,
    columns: [
      {
        dataIndex: 'title',
        customRender: props.titleRender
      },
      {
        dataIndex: 'value',
        customRender: props.valueRender
      }
    ],
    showHeader: false,
    background: props.background ?? 'transparent',
    textColor: props.textColor
  }
})
</script>
