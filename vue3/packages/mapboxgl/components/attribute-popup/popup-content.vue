<template>
  <div class="sm-identify-popup-content">
    <div :style="maxHeight">
      <template v-for="{ type, infos } in content">
        <FieldInfo
          v-if="type === 'FIELD'"
          :infos="infos"
          :attributeStyle="attributeStyle"
        ></FieldInfo>
        <TextInfo v-if="type === 'TEXT'" :infos="infos"></TextInfo>
        <MediaInfo v-if="type === 'MEDIA'" :infos="infos"></MediaInfo>
        <Divider v-if="type === 'DIVIDER'" dashed></Divider>
      </template>
      <div v-if="content.length === 0">暂无数据</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PopupConfig, PopupInfo } from './types'
import { computed } from 'vue'
import { Divider } from 'ant-design-vue'
import { cloneDeep } from 'lodash-es'
import FieldInfo from './field-info.vue'
import TextInfo from './text-info.vue'
import MediaInfo from './media-info.vue'
import PopupUtil from './util/PopupUtil'
import { usePopupConfigHooks } from './hooks/use-popup-config'

const props = defineProps({
  data: {
    type: Array as () => Array<{ title: string; value: any; slotName: any }>,
    default: () => []
  },
  popupInfo: {
    type: Object as () => PopupInfo,
    default: () => ({})
  },
  popupConfig: {
    type: Object as () => PopupConfig,
    default: () => ({})
  }
})
const popupConfig = computed(() => props.popupConfig)
const attributes = computed(() => {
  const data = props.data
  const attributes = {}
  data.map(d => {
    attributes[d.title] = d.value
  })
  return attributes
})
const content = computed(() => {
  const { elements } = props.popupInfo
  if (!elements) return []
  const newItems = PopupUtil.getLayoutElements(cloneDeep(elements))
  const resultElements = PopupUtil.getResultElement(newItems, attributes.value)
  return resultElements
})
const { attributeStyle } = usePopupConfigHooks(popupConfig)

const maxHeight = computed(() => {
  return popupConfig.value.height || popupConfig.value.maxHeight
})
</script>
