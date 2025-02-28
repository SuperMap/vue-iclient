<template>
  <div
    class="sm-component-attribute-panel"
    :style="[textColorStyle, !showBorder && { border: 'none' }]"
  >
    <div class="sm-component-attribute-panel__header">
      <div v-if="!$slots.header && title !== undefined" class="title ellipsis" :title="title">
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
import type { AttributePanelProps } from './attribute-panel'
import { computed } from 'vue'
import { useTheme } from '@supermapgis/common/components/theme/theme'
import SmTablePopup from '@supermapgis/common/components/table-popup/TablePopup.vue'
import { attributePanelPropsDefault } from './attribute-panel'

defineOptions({
  name: 'SmAttributePanel'
})

const props = withDefaults(defineProps<AttributePanelProps>(), attributePanelPropsDefault)

const { textColorStyle } = useTheme(props)

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
