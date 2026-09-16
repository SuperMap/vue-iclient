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
          :get-popup-container="getPopupContainer"
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

// 下拉面板默认挂载到 body，场景全屏后 body 不在全屏元素内会导致下拉框不显示，
// 因此将下拉面板挂载到触发节点的父节点内。
function getPopupContainer(triggerNode: HTMLElement) {
  return triggerNode.parentNode as HTMLElement
}

function handleChange(id: string, value: unknown) {
  emit('change', id, Array.isArray(value) ? value : [])
}
</script>
