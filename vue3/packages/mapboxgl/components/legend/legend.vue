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
        <SmCollapse v-if="mode === 'panel'" v-model:active-key="activeLegend" class="sm-component-legend__table">
          <SmCollapsePanel
            v-for="(layerStyles, layerName) in legendList"
            :key="layerName"
            :collapsible="isShowTitle ? 'header' : 'disabled'"
            :show-arrow="false"
            :class="[isShowTitle ? '' : 'sm-component-legend__panel']"
          >
            <template #header>
              <div v-if="isShowTitle" class="header-wrap" :style="textColorHeadingStyle">
                <div class="sm-component-legend__title add-ellipsis">{{ layerStyles[0].layerTitle }}</div>
                <i
                  :class="
                    activeLegend.includes(layerName)
                      ? 'sm-components-icon-solid-triangle-down'
                      : 'sm-components-icon-solid-triangle-right'
                  "
                />
              </div>
            </template>
            <template v-for="(style, index) in layerStyles" :key="`style_${index}`">
              <StyleField
                v-if="isShowField"
                :theme-field="style.themeField"
                :style-field="style.styleField"
              />
              <div class="sm-component-legend__wrap">
                <StyleItem
                  v-for="(item, j) in style.styleGroup"
                  :key="`style_${index}_${j}`"
                  :style-data="item"
                  :outline-width-driven="isOutlineWidthDriven(layerStyles)"
                />
              </div>
            </template>
          </SmCollapsePanel>
        </SmCollapse>
        <template v-else>
          <div v-for="(layerStyles, layerName) in legendList" :key="layerName" class="sm-component-legend__noBorder">
            <div v-if="isShowTitle" class="sm-component-legend__title add-ellipsis" :style="textColorHeadingStyle">
              {{ layerName }}
            </div>
            <template v-for="(style, index) in layerStyles" :key="`style_${index}`">
              <StyleField
                v-if="isShowField"
                :theme-field="style.themeField"
                :style-field="style.styleField"
              />
              <div class="sm-component-legend__wrap">
                <StyleItem
                  v-for="(item, j) in style.styleGroup"
                  :key="`style_${index}_${j}`"
                  :style-data="item"
                  :outline-width-driven="isOutlineWidthDriven(layerStyles)"
                />
              </div>
            </template>
          </div>
        </template>
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
import StyleField from './subs/style-field.vue'
import StyleItem from './subs/style-item.vue'
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

const collapseCardBackgroundStyle = computed(() => {
  return props.background ? { background: props.background } : gisControlBgStyle.value
})

const layerNamesValue = computed(() => getLayerNames())

watch(layerNamesValue, () => {
  initLegendList()
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

// 轮廓宽度被单独提取成分组（存在 styleField 为 outlineWidth 的部分）时：
// 宽度分段只在该分组按真实宽度展示，其它分组的轮廓符号统一按默认宽度绘制
function isOutlineWidthDriven(layerStyles: LegendLayerStyle[]) {
  return (layerStyles || []).some(style => style.styleField === 'outlineWidth')
}

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
    activeLegend.value = props.isShowTitle ? defaultChoosenLayers : Object.keys(legendList.value)
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
