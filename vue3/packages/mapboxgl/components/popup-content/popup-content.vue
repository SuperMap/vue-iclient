<template>
  <div class="sm-identify-popup-content">
    <div :style="maxHeight">
      <component
        v-for="(item, index) in renderedContent"
        :key="index"
        :is="item.renderer.component"
        v-bind="item.props"
      />
      <div v-if="renderedContent.length === 0">{{ t('popup.noData') }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PopupContentProps } from './types'
import type { PopupContentRenderer, PopupContentRuntimeRegistry } from './runtime-registry'
import { computed, inject } from 'vue'
import { usePopupConfigHooks } from './hooks/use-popup-config'
import { useLocale } from '@supermapgis/common/hooks/index.common'
import { popupContentPropsDefault } from './types'
import { popupContentRuntimeRegistryKey, resolvePopupContent } from './runtime-registry'
import { createBuiltInPopupContentRenderers } from './built-in-renderers'

defineOptions({
  name: 'SmPopupContent'
})

const props = withDefaults(defineProps<PopupContentProps>(), popupContentPropsDefault)
const { t } = useLocale()
const runtimeRegistry = inject<PopupContentRuntimeRegistry | undefined>(
  popupContentRuntimeRegistryKey,
  undefined
)

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

const { attributeStyle } = usePopupConfigHooks(popupConfig)

const maxHeight = computed(() => {
  return popupConfig.value.height || popupConfig.value.maxHeight
})

/** 内置类型与扩展类型共用同一个解析、渲染注册入口。 */
const builtInRenderers = createBuiltInPopupContentRenderers(attributeStyle)
const availableRenderers = computed(() => {
  const host = props.context?.mode || 'map'
  return [...builtInRenderers, ...(runtimeRegistry?.renderers.value || [])]
    .filter(renderer => !renderer.hosts || !host || renderer.hosts.includes(host))
})

const content = computed(() => {
  const elements = props.popupInfo?.elements || []
  return resolvePopupContent(elements as Record<string, any>[], availableRenderers.value, {
    attributes: attributes.value,
    popupInfo: props.popupInfo || {}
  })
})

const resolveRenderer = (item: Record<string, any>): PopupContentRenderer | undefined =>
  availableRenderers.value.find(renderer => renderer.type === item.type)
const createRendererContext = (item: Record<string, any>) => ({
  element: item.infos || item,
  attributes: attributes.value,
  features: features.value,
  index: props.index || 0,
  popupInfo: props.popupInfo || {},
  event: props.event ?? props.e,
  host: props.context?.mode || 'map',
  target: props.context?.target
})
const renderedContent = computed(() => content.value.flatMap(item => {
  const renderer = resolveRenderer(item)
  if (!renderer) return []
  const rendererContext = createRendererContext(item)
  return [{
    renderer,
    props: renderer.resolveProps?.(rendererContext) || rendererContext
  }]
}))
</script>
