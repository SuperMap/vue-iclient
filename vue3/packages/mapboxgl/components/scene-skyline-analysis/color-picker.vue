<template>
  <div
    class="sm-component-color-picker"
    :class="{ 'is-disabled': disabled }"
  >
    <SmTooltip
      trigger="click"
      overlay-class-name="sm-component-color-picker__popover"
      :get-popup-container="getPopupContainer"
    >
      <div class="sm-component-color-picker__current">
        <div
          v-if="colorValue"
          class="sm-component-color-picker__thumbnail"
          :style="{ backgroundColor: colorValue }"
        />
        <div class="sm-component-color-picker__remove" @click="removeColor">
          <CloseOutlined />
        </div>
      </div>
      <template #title>
        <Sketch v-model="colors as PickerProps['modelValue']" />
      </template>
    </SmTooltip>
  </div>
</template>

<script setup lang="ts">
import type { Payload, Props as PickerProps } from '@ckpack/vue-color'
import { Sketch } from '@ckpack/vue-color'
import { CloseOutlined } from '@ant-design/icons-vue'
import { computed, ref, watch } from 'vue'
import SmTooltip from '@supermapgis/common/components/tooltip/Tooltip'

defineOptions({
  name: 'SmColorPicker'
})

interface Props {
  modelValue?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()

const colors = ref<string | Payload>(props.modelValue || '')

const colorValue = computed(() => {
  if (!colors.value || typeof colors.value === 'string') {
    return colors.value
  }
  if (colors.value.a === 1) {
    return colors.value.hex
  }
  const { r, g, b, a } = colors.value.rgba
  return `rgba(${r}, ${g}, ${b}, ${a})`
})

const getPopupContainer = () => document.body

const removeColor = (e: MouseEvent) => {
  if (colors.value) {
    e.stopPropagation()
  }
  colors.value = ''
}

watch(
  () => props.modelValue,
  next => {
    if (next !== colorValue.value) {
      colors.value = next ?? ''
    }
  }
)

watch(colorValue, () => {
  if (colorValue.value === props.modelValue) {
    return
  }
  emit('update:modelValue', colorValue.value || '')
  emit('change', colorValue.value || '')
})
</script>
