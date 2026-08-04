<template>
  <div class="sm-component-scene-layer-multi-select-list">
    <div v-if="title" class="sm-component-scene-layer-multi-select-list__title">
      {{ title }}
    </div>
    <div class="sm-component-scene-layer-multi-select-list__items">
      <div
        v-for="item in items"
        :key="item.id"
        class="sm-component-scene-layer-multi-select-list__item"
      >
        <span class="sm-component-scene-layer-multi-select-list__name" :title="item.name">
          {{ item.name }}
        </span>
        <SmSelect
          class="sm-component-scene-layer-multi-select-list__select"
          mode="multiple"
          :value="item.selectedValues"
          :show-search="false"
          :aria-label="item.name"
          @change="value => handleChange(item.id, value)"
        >
          <SmSelectOption v-for="option in options" :key="option.value" :value="option.value">
            {{ option.label }}
          </SmSelectOption>
        </SmSelect>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SmSelect, { SmSelectOption } from '@supermapgis/common/components/select/Select'
import type {
  SceneLayerMultiSelectItem,
  SceneLayerMultiSelectOption,
  SceneLayerMultiSelectValue
} from './scene-layer-multi-select-list.types'

defineOptions({
  name: 'SmSceneLayerMultiSelectList'
})

defineProps<{
  title?: string
  items: SceneLayerMultiSelectItem[]
  options: SceneLayerMultiSelectOption[]
}>()

const emit = defineEmits<{
  change: [id: string, values: SceneLayerMultiSelectValue[]]
}>()

function handleChange(id: string, value: unknown) {
  emit('change', id, Array.isArray(value) ? value : [])
}
</script>
