<template>
  <div class="sm-component-color-picker" :class="{ 'is-disabled': disabled }">
    <SmTooltip
      trigger="click"
      :open="open"
      overlay-class-name="sm-component-color-picker__popover"
      :get-popup-container="getPopupContainer"
      @open-change="handleOpenChange"
    >
      <div class="sm-component-color-picker__current">
        <div
          v-if="colorValue"
          class="sm-component-color-picker__thumbnail"
          :style="{ backgroundColor: colorValue }"
        />
        <div class="sm-component-color-picker__remove" @click="removeColor">
          <i class="sm-components-icon-close" />
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
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import SmTooltip from '@supermapgis/common/components/tooltip/Tooltip'
import { activeColorPickerId, createColorPickerId } from './picker-manager'

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
const pickerId = createColorPickerId()
const open = ref(false)

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

const handleOpenChange = (nextOpen: boolean) => {
  open.value = props.disabled ? false : nextOpen
  if (open.value) {
    activeColorPickerId.value = pickerId
  }
}

// Tooltip 的 click 触发模式不会处理所有外部点击，这里补齐与 Select 一致的失焦关闭行为。
const handleDocumentPointerDown = (event: PointerEvent) => {
  if (!open.value || !(event.target instanceof Element)) {
    return
  }
  if (
    event.target.closest('.sm-component-color-picker') ||
    event.target.closest('.sm-component-color-picker__popover')
  ) {
    return
  }
  open.value = false
  if (activeColorPickerId.value === pickerId) {
    activeColorPickerId.value = undefined
  }
}

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

watch(activeColorPickerId, activeId => {
  if (activeId !== pickerId) {
    open.value = false
  }
})

watch(
  () => props.disabled,
  value => {
    if (value) {
      open.value = false
    }
  }
)

onMounted(() => {
  document.addEventListener('pointerdown', handleDocumentPointerDown, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleDocumentPointerDown, true)
  if (activeColorPickerId.value === pickerId) {
    activeColorPickerId.value = undefined
  }
})
</script>
