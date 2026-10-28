<template>
  <sm-collapse-card
    v-show="isShow"
    :icon-class="mode === 'simple' ? '' : iconClass"
    :icon-position="position"
    :header-name="mode === 'simple' ? '' : headerNameValue"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :background="background"
    :textColor="textColor"
    :split-line="splitLine"
    class="sm-component-legend"
  >
    <SmCard :bordered="false" :style="mode !== 'simple' ? collapseCardBackgroundStyle : undefined">
      <template v-if="Object.keys(legendList).length > 0">
        <SmCollapse v-model:active-key="activeLegend" class="sm-component-legend__table">
          <SmCollapsePanel
            v-for="(layerStyles, layerName) in legendList"
            :key="layerName"
            :collapsible="isCollapsible ? undefined : 'disabled'"
            :show-arrow="false"
            :class="[
              isShowTitle ? '' : 'sm-component-legend__panel',
              mode === 'simple' ? 'sm-component-legend__simple' : ''
            ]"
          >
            <template #header>
              <div v-if="isShowTitle" class="header-wrap" :style="textColorHeadingStyle">
                <!-- 宽度不足时单行省略，title 保留完整图层名供 hover 查看 -->
                <div
                  class="sm-component-legend__title add-ellipsis"
                  :title="layerStyles[0].layerTitle || String(layerName)"
                >
                  {{ layerStyles[0].layerTitle || layerName }}
                </div>
                <i
                  v-if="isCollapsible"
                  :class="
                    activeLegend.includes(layerName)
                      ? 'sm-components-icon-solid-triangle-down'
                      : 'sm-components-icon-solid-triangle-right'
                  "
                />
              </div>
            </template>
            <LayerContent :layer-styles="layerStyles" :is-show-field="isShowField" />
          </SmCollapsePanel>
        </SmCollapse>
      </template>
    </SmCard>
  </sm-collapse-card>
</template>

<script lang="ts" setup>
import type { Map } from 'mapbox-gl'
import type { LegendEvents, LegendProps, LegendLayerStyle } from './types'
import { computed, onBeforeMount, onBeforeUnmount, ref, watch } from 'vue'
import { debounce } from 'lodash-es'
import { useLocale, useMapGetter, useTheme } from '@supermapgis/common/hooks/index.common'
import { useMapControl } from '@supermapgis/mapboxgl/hooks'
import SmCollapseCard from '@supermapgis/common/components/collapse-card/collapse-card.vue'
import SmCard from '@supermapgis/common/components/card/Card'
import { SmCollapse, SmCollapsePanel } from '@supermapgis/common/components/collapse/Collapse'
import LegendViewModel from 'vue-iclient-controllers-mapboxgl/src/LegendViewModel'
import LayerContent from './subs/layer-content.vue'
import { legendPropsDefault } from './types'

defineOptions({
  name: 'SmLegend'
})

const props = withDefaults(defineProps<LegendProps>(), legendPropsDefault)

defineEmits<LegendEvents>()

let viewModel: InstanceType<typeof LegendViewModel>
let webMapViewModel: InstanceType<any>

const { isShow } = useMapControl()
const { t } = useLocale()
const { gisControlBgStyle, textColorHeadingStyle } = useTheme(props)
const { setViewModel } = useMapGetter<Map>({ loaded, removed })

const legendList = ref<Record<string, LegendLayerStyle[]>>({})
const activeLegend = ref<string[]>([])
const isMapLoaded = ref(false)

// Computed
const headerNameValue = computed(() => props.headerName ?? t('legend.title'))

const isCollapsible = computed(() => props.mode === 'panel' && props.isShowTitle)

const collapseCardBackgroundStyle = computed(() => {
  return props.background ? { background: props.background } : gisControlBgStyle.value
})

const layerNamesValue = computed(() => getLayerNames())

watch(layerNamesValue, () => {
  initLegendList()
})

watch(isCollapsible, (collapsible) => {
  const keys = Object.keys(legendList.value)
  activeLegend.value = collapsible ? keys.slice(0, 1) : keys
})

const initLegendListFn = debounce(initLegendList, 300)

onBeforeMount(() => {
  viewModel = new LegendViewModel()
  setViewModel(viewModel)
  viewModel.on('layersupdated', initLegendListFn)
})

onBeforeUnmount(() => {
  webMapViewModel = null
  viewModel?.off('layersupdated', initLegendListFn)
})

function initLegendList() {
  legendList.value = {}
  const defaultChoosenLayers: string[] = []
  if (viewModel) {
    legendList.value = getLayerNames(webMapViewModel).reduce<Record<string, LegendLayerStyle[]>>((list, name) => {
      const styles = viewModel.getStyle(name, webMapViewModel)
      if (styles && styles.length > 0) {
        list[name] = styles
        if (!defaultChoosenLayers.length) {
          defaultChoosenLayers.push(name)
        }
      }
      return list
    }, {})
    activeLegend.value = isCollapsible.value ? defaultChoosenLayers : Object.keys(legendList.value)
  }
}

function getLayerNames(wv?: InstanceType<any>) {
  if (props.useMapLegend && isMapLoaded.value) {
    return viewModel?.getLayerNamesFromWebmap(wv) || []
  }
  return props.layerNames || []
}

function loadedCb(wv = viewModel?.webmap) {
  webMapViewModel = wv
  initLegendList()
}

function loaded(map: Map, webmap: InstanceType<any>) {
  isMapLoaded.value = true
  // vue3 中 webMapViewModel 通过 useMapGetter 的 loaded 回调直接获取，无需再监听 mapEvent 事件
  loadedCb(webmap)
}

function removed() {
  legendList.value = {}
}
</script>
