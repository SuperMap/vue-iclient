<template>
  <div class="sm-component-scene-sunlight-analysis__color-table-wrap">
    <SmSelect
      v-model:value="selectedValue"
      class="sm-component-scene-sunlight-analysis__color-table-select"
      option-label-prop="label"
      @change="handleChange"
    >
      <SmSelectOption
        v-for="item in gradientList"
        :key="item.key"
        :value="item.key"
        :label="item.label"
      >
        <div class="sm-component-scene-sunlight-analysis__color-table-item">
          <GradientDisplay :stops="item.stops" width="120px" height="16px" />
          <span class="sm-component-scene-sunlight-analysis__color-table-label">{{ item.label }}</span>
        </div>
      </SmSelectOption>
    </SmSelect>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import SmSelect, { SmSelectOption } from '@supermapgis/common/components/select/Select'
import GradientDisplay from './gradient-display.vue'
import type { GradientItem } from './types'

export type { GradientItem }

const props = defineProps<{
  value?: string
  gradientList: GradientItem[]
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:value': [value: string]
  change: [value: string, stops: [string, number][]]
}>()

const selectedValue = ref(props.value)

watch(
  () => props.value,
  (val) => {
    selectedValue.value = val
  }
)

function handleChange(key: string) {
  const item = props.gradientList.find((gradient) => gradient.key === key)
  if (!item) return
  selectedValue.value = key
  emit('update:value', key)
  emit('change', key, item.stops)
}
</script>
