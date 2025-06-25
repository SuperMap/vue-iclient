<template>
  <div :id="target" ref="graph-map" class="sm-component-graph-map"></div>
</template>

<script lang="ts" setup>
import { useTemplateRef, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { addListener, removeListener } from 'resize-detector'
import { debounce } from 'lodash-es'
import { useVmProps } from '@supermapgis/common/hooks/index.common'
import GraphMapViewModel, {
  EmitParams
} from 'vue-iclient-core/controllers/mapboxgl/GraphMapViewModel'
import { GraphMapPropsDefault } from './types'
import type { GraphMapEmits, GraphMapProps } from './types'

defineOptions({
  name: 'SmGraphMap',
  inheritAttrs: false
})

const viewModelProps = ['serviceUrl', 'zoom', 'center']

const props = withDefaults(defineProps<GraphMapProps>(), GraphMapPropsDefault)
const emits = defineEmits<GraphMapEmits>()

const { setViewModel } = useVmProps(props, viewModelProps)
const container = 'knowledgeGraph'
let viewModel: InstanceType<typeof GraphMapViewModel>

const target = computed(() => props.options?.container ?? container)

const rootEl = useTemplateRef('graph-map')

const resize = () => {
  if (viewModel?.resize && rootEl.value) {
    const { clientWidth, clientHeight } = rootEl.value
    viewModel.resize(clientWidth, clientHeight)
  }
}

const handleResizeEvent = debounce(resize, 500)

const handleLoadedEvent = (e: EmitParams) => {
  emits('loaded', e.knowledgeGraph)
}

const registerEvents = () => {
  if (viewModel) {
    viewModel.on('loaded', handleLoadedEvent)
    if (props.autoresize && rootEl) {
      addListener(rootEl.value, handleResizeEvent)
    }
  }
}

const unregisterEvents = () => {
  if (viewModel) {
    viewModel.off('loaded', handleLoadedEvent)
    if (props.autoresize && rootEl) {
      removeListener(rootEl.value, handleResizeEvent)
    }
  }
}

watch(
  () => props.autoresize,
  value => {
    if (rootEl.value) {
      if (value) {
        addListener(rootEl.value, handleResizeEvent)
      } else {
        removeListener(rootEl.value, handleResizeEvent)
      }
    }
  }
)

onMounted(() => {
  const nextOptions = Object.assign({ container: target }, props.options)
  viewModel = new GraphMapViewModel(props.serviceUrl, nextOptions)
  viewModel.initGraphMap()
  setViewModel(viewModel)
  registerEvents()
})

onBeforeUnmount(() => {
  unregisterEvents()
})
</script>
