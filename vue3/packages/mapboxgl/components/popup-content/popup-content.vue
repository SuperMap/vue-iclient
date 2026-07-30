<template>
  <div class="sm-identify-popup-content">
    <div :style="maxHeight">
      <template v-for="(item, index) in content" :key="index">
        <FieldInfo
          v-if="item.type === 'FIELD'"
          :infos="item.infos"
          :attributeStyle="attributeStyle"
        />
        <TextInfo v-else-if="item.type === 'TEXT'" :infos="item.infos" />
        <MediaInfo v-else-if="item.type === 'MEDIA'" :infos="item.infos" />
        <Divider v-else-if="item.type === 'DIVIDER'" dashed />
        <component
          v-else-if="item.type === 'CUSTOM' && item.infos?.component"
          :is="item.infos.component"
          v-bind="resolveCustomProps(item.infos)"
        />
      </template>
      <div v-if="content.length === 0">暂无数据</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CustomElementInfos, PopupContentProps } from './types'
import { computed } from 'vue'
import { Divider } from 'ant-design-vue'
import { cloneDeep } from 'lodash-es'
import FieldInfo from './field-info.vue'
import TextInfo from './text-info.vue'
import MediaInfo from './media-info.vue'
import PopupUtil from './util/PopupUtil'
import { usePopupConfigHooks } from './hooks/use-popup-config'
import { popupContentPropsDefault } from './types'

defineOptions({
  name: 'SmPopupContent'
})

const props = withDefaults(defineProps<PopupContentProps>(), popupContentPropsDefault)

const popupConfig = computed(() => props.popupConfig || {})

/** 将 data 行转为要素属性对象 */
const toFeature = (rows?: Array<{ title: string; value: any }>) => {
  const next: Record<string, any> = {}
  ;(rows || []).forEach(d => {
    next[d.title] = d.value
  })
  return next
}

const attributes = computed(() => toFeature(props.data))

const features = computed(() => {
  if (props.featuresData?.length) {
    return props.featuresData.map(rows => toFeature(rows))
  }
  return Object.keys(attributes.value).length ? [attributes.value] : []
})

const content = computed(() => {
  const { elements } = props.popupInfo || {}
  if (!elements?.length) return []
  const newItems = PopupUtil.getLayoutElements(cloneDeep(elements))
  return PopupUtil.getResultElement(newItems, attributes.value)
})

const { attributeStyle } = usePopupConfigHooks(popupConfig)

const maxHeight = computed(() => {
  return popupConfig.value.height || popupConfig.value.maxHeight
})

const layerInfo = computed(() => {
  const info = props.popupInfo || {}
  const layerId = Array.isArray(info.layerId) ? info.layerId[0] : info.layerId
  return {
    id: layerId || '',
    title: info.title
  }
})

/**
 * 透传用户 props + 注入平台上下文；兼容旧 data / e
 */
const resolveCustomProps = (infos?: CustomElementInfos) => {
  const userProps = {
    ...(props.popupInfo?.props || {}),
    ...(infos?.props || {})
  }
  const data = infos?.data !== undefined ? infos.data : attributes.value
  const event = infos?.e !== undefined ? infos.e : props.event ?? props.e

  return {
    ...userProps,
    data,
    features: features.value,
    index: props.index || 0,
    layer: layerInfo.value,
    event,
    context: props.context,
    e: event
  }
}
</script>
