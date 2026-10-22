<template>
  <SmCollapseCard
    v-show="isShow"
    :icon-class="iconClass"
    :icon-position="position"
    :header-name="headerName ?? t('baseLayerSwitcher.title')"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :background="background"
    :textColor="textColor"
    :split-line="splitLine"
    class="sm-component-base-layer-switcher"
  >
    <div
      class="sm-component-base-layer-switcher__panel"
      :style="textColorHeadingStyle"
    >
      <div class="sm-component-base-layer-switcher__layers-wrap">
        <div class="sm-component-base-layer-switcher__content-holder">
          <div class="sm-component-base-layer-switcher__layers">
            <div
              v-for="layer in displayLayers"
              :key="layer.id"
              :class="['sm-component-base-layer-switcher__layer-item', { 'is-active': selectedId === layer.id }]"
              @click="changeBaseLayer(layer)"
            >
              <img :src="layer.thumbnail" alt="" />
              <div
                class="sm-component-base-layer-switcher__layer-name"
                :title="layer.title"
                :style="{ color: textColor || '#fff' }"
              >
                <span class="sm-component-base-layer-switcher__layer-name-text">{{ layer.title }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </SmCollapseCard>
</template>

<script setup lang="ts">
import type { Map } from 'mapbox-gl'
import type { BaseLayerItem, BaseLayerSwitcherProps, BaseLayerSwitcherEvents } from './types'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { isEqual, cloneDeep } from 'lodash-es'
import { useLocale, useMapGetter, useTheme } from '@supermapgis/common/hooks/index.common'
import { useMapControl } from '@supermapgis/mapboxgl/hooks'
import BaseLayerSwitcherViewModel from 'vue-iclient-controllers-mapboxgl/src/BaseLayerSwitcherViewModel'
import SmCollapseCard from '@supermapgis/common/components/collapse-card/collapse-card.vue'
import { baseLayerSwitcherPropsDefault } from './types'

defineOptions({
  name: 'SmBaseLayerSwitcher'
})

const DEFAULT_THUMBNAIL = new URL('./assets/defaultThumbnail.png', import.meta.url).href
const props = withDefaults(defineProps<BaseLayerSwitcherProps>(), baseLayerSwitcherPropsDefault)
defineEmits<BaseLayerSwitcherEvents>()
const selectedId = ref(props.defaultLayer)
const baseLayer = ref<BaseLayerItem | null>(null)
const viewModel = new BaseLayerSwitcherViewModel()
const { t } = useLocale()
const { textColorHeadingStyle } = useTheme(props)
const { isShow } = useMapControl()
useMapGetter<Map>({ loaded, removed, viewModel })

const displayLayers = computed(() => {
  const layers: BaseLayerItem[] = []
  if (props.baseLayerInfo.show && baseLayer.value) {
    layers.unshift({ ...baseLayer.value, thumbnail: props.baseLayerInfo.thumbnail })
  }
  return layers.concat(props.layers).map(layer => ({
    ...layer,
    thumbnail: layer.thumbnail || DEFAULT_THUMBNAIL,
    title: layer.title || ''
  }))
})

watch(
  () => props.layers,
  (next, previous) => {
    if (isEqual(next, previous) || !selectedId.value || selectedId.value === baseLayer.value?.id) {
      return
    }
    if (!next.some(layer => layer.id === selectedId.value) && baseLayer.value) {
      changeBaseLayer({ ...baseLayer.value })
    }
  },
  { deep: true }
)

watch(
  () => props.baseLayerInfo.title,
  title => {
    setBaseLayerTitle(title, props.baseLayerInfo.show && selectedId.value === baseLayer.value?.id)
  }
)

watch(
  () => props.baseLayerInfo.show,
  show => {
    if (!show && selectedId.value === baseLayer.value?.id) {
      selectedId.value = ''
      setBaseLayerTitle('', true)
      return
    }
    if (show && !selectedId.value) {
      selectedId.value = baseLayer.value?.id
    }
    if (show && props.baseLayerInfo.title) {
      setBaseLayerTitle(props.baseLayerInfo.title, selectedId.value === baseLayer.value?.id)
    }
  }
)

viewModel.on('baselayerchanged', onBaseLayerChanged)

onBeforeUnmount(() => {
  viewModel.off('baselayerchanged', onBaseLayerChanged)
})

function loaded() {
  if (props.baseLayerInfo.title && props.baseLayerInfo.show) {
    setBaseLayerTitle(props.baseLayerInfo.title, !selectedId.value)
  }
  if (selectedId.value) {
    const matchLayer = displayLayers.value.find(layer => layer.id === selectedId.value)
    if (matchLayer) {
      changeBaseLayer(matchLayer)
    }
  }
}

function removed() {
  if (baseLayer.value) {
    if (selectedId.value === baseLayer.value.id) {
      selectedId.value = ''
    }
    baseLayer.value = null
  }
}

function changeBaseLayer(layer: BaseLayerItem) {
  viewModel.changeBaseLayer(
    layer as unknown as Parameters<BaseLayerSwitcherViewModel['changeBaseLayer']>[0]
  )
  selectedId.value = layer.id
}

function onBaseLayerChanged({ baseLayer: nextBaseLayer }: { baseLayer: BaseLayerItem }) {
  baseLayer.value = cloneDeep(nextBaseLayer)
  if (props.baseLayerInfo.show && !selectedId.value) {
    selectedId.value = nextBaseLayer.id
  }
}

function setBaseLayerTitle(title: string, isChangeBaseLayer: boolean) {
  viewModel.setBaseTitle(title, isChangeBaseLayer)
}
</script>
