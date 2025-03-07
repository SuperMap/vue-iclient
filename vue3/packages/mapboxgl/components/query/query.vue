<template>
  <sm-collapse-card
    v-show="isShow"
    :icon-class="iconClass"
    :icon-position="position"
    :header-name="headerName ?? $t('query.query')"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :background="background"
    :textColor="textColor"
    :split-line="splitLine"
    class="sm-component-query"
  >
    <div class="sm-component-query__body" :style="textColorStyle">
      <div class="sm-component-query__choose-panel clearfix">
        <div
          :class="{
            'sm-component-query__job-button': true,
            'is-active': activeTab === 'job',
            disabled: isQuery
          }"
          :title="$t('query.queryJob')"
          @click="activeTab = 'job'"
        >
          {{ $t('query.queryJob') }}
        </div>
        <div
          :class="{
            'sm-component-query__result-button': true,
            'is-active': activeTab === 'result'
          }"
          :title="$t('query.queryResult')"
          @click="activeTab = 'result'"
        >
          {{ $t('query.queryResult') }}
        </div>
      </div>
      <div v-if="activeTab === 'job'" class="sm-component-query__job-info">
        <div
          v-for="(jobInfo, index) in jobInfos"
          v-show="jobInfos.length > 0"
          :key="index"
          :style="textColorHeadingStyle"
          class="sm-component-query__job-info-panel"
        >
          <div
            class="sm-component-query__job-info-header"
            @click="activePanelIndex = activePanelIndex === index ? null : index"
          >
            <span :title="jobInfo.queryParameter.name" class="sm-component-query__job-info-name">
              {{ jobInfo.queryParameter.name }}
            </span>
            <i
              :class="
                activePanelIndex !== index
                  ? 'sm-components-icon-solid-triangle-right'
                  : 'sm-components-icon-solid-triangle-down'
              "
            />
          </div>
          <div
            :class="{
              'sm-component-query__job-info-body': true,
              hidden: activePanelIndex !== index
            }"
          >
            <div class="sm-component-query__item-holder">
              <template v-if="jobInfo.queryParameter.queryMode === 'KEYWORD'">
                <div>{{ $t('query.keyQueryCondition') }}</div>
                <sm-input
                  v-model:value="jobInfo.queryParameter.attributeFilter"
                  allowClear
                  class="sm-component-query__item-config"
                  :style="textColorStyle"
                  :placeholder="$t('query.keyQueryPlaceholder')"
                />
              </template>
              <template v-else>
                <div>{{ $t('query.attributeCondition') }}</div>
                <sm-input
                  v-model:value="jobInfo.queryParameter.attributeFilter"
                  allowClear
                  class="sm-component-query__item-config"
                  :style="textColorStyle"
                  :placeholder="$t('query.sqlQueryPlaceholder')"
                />
              </template>
            </div>
            <div class="sm-component-query__item-holder">
              <div>{{ $t('query.spatialFilter') }}</div>
              <sm-select
                v-model:value="jobInfo.spaceFilter"
                class="sm-component-query__item-config"
                :get-popup-container="getPopupContainer"
                :style="textColorStyle"
              >
                <sm-select-option
                  v-for="item in selectOptions"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </sm-select-option>
              </sm-select>
            </div>
            <div class="sm-component-query__query-button">
              <sm-button
                type="primary"
                size="small"
                class="sm-component-query__a-button"
                @click="queryButtonClicked(jobInfo.queryParameter, jobInfo.spaceFilter)"
              >
                {{ $t('query.applicate') }}
              </sm-button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="sm-component-query__result-info">
        <div v-show="!queryResult && !isQuery" class="sm-component-query__no-result">
          <sm-empty :description="$t('query.noResult')" />
        </div>
        <div v-show="isQuery && !queryResult" class="sm-component-query__result-loading">
          <sm-spin :tip="$t('query.querying')">
            <template #indicator>
              <LoadingOutlined style="font-size: 24px"  />
            </template>
          </sm-spin>
        </div>
        <template v-if="queryResult">
          <div class="sm-component-query__result-header" :style="textColorHeadingStyle">
            <span :title="queryResult.name" class="sm-component-query__header-name">
              {{ queryResult.name }}
            </span>
            <i class="sm-components-icon-delete" @click="clearResult" />
          </div>
          <div class="sm-component-query__result-body">
            <ul>
              <li
                v-for="(item, index) in queryResult.result"
                :key="index"
                :title="resultDisplayTitle(item)"
                role="option"
                :aria-selected="activeResultIndexList.includes(index)"
                @click="queryResultListClicked(index)"
              >
                {{ resultDisplayTitle(item) }}
                <i
                  v-if="activeResultIndexList.includes(index) && multiSelect"
                  class="sm-components-icon-complete"
                />
              </li>
            </ul>
          </div>
        </template>
      </div>
    </div>
    <SmLayerHighlight
      uniqueName="query-popup"
      :layers="resultLayers"
      :highlightStyle="highlightStyle"
      :featureFieldsMap="featureFieldsMap"
      :displayFieldsMap="displayFieldsMap"
      :multiSelection="multiSelect"
      :clickTolerance="clickTolerance"
      :popupStyle="popupStyle"
      :background="popupStyle.background || background"
      :textColor="popupStyle.textColor || textColor"
      :mapTarget="mapTarget"
      :customColumnRenders="scopedSlots"
      :showPopup="showPopup"
      ref="query-highlight"
      :title="queryResult && queryResult.name"
      @mapselectionchanged="handleMapSeletionChanged"
    />
  </sm-collapse-card>
</template>

<script setup lang="ts">
import type { Map } from 'mapbox-gl'
import type {
  QueryProps,
  QueryEvents,
  QueryResult,
  QueryJobItem,
  QueryResultEvent,
  MapSelectionChangedEmit,
  PopupFieldsInfo,
  QueryFailedEvent,
  QueryResultParams
} from './types'
import type { QueryParameter, QueryBoundsType } from 'vue-iclient-core/controllers/mapboxgl/QueryViewModel'
import { ref, computed, watch, onMounted, onUnmounted, useTemplateRef, useSlots } from 'vue'
import { useTheme } from '@supermapgis/common/components/theme/theme'
import { useMapGetter, useLocale } from '@supermapgis/common/hooks/index.common'
import { useMapControl } from '@supermapgis/mapboxgl/hooks'
import QueryViewModel from 'vue-iclient-core/controllers/mapboxgl/QueryViewModel'
import { LoadingOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import SmInput from '@supermapgis/common/components/input/Input'
import SmSelect, { SmSelectOption } from '@supermapgis/common/components/select/Select'
import SmButton from '@supermapgis/common/components/button/Button'
import SmEmpty from '@supermapgis/common/components/empty/Empty'
import SmSpin from '@supermapgis/common/components/spin/Spin'
import SmLayerHighlight from '@supermapgis/mapboxgl/components/layer-highlight/layer-highlight.vue'
import SmCollapseCard from '@supermapgis/common/components/collapse-card/collapse-card.vue'
import { getValueCaseInsensitive } from 'vue-iclient-core/utils/util'
import { isEqual } from 'lodash-es'
import omit from 'omit.js'
import { queryPropsDefault } from './types'

defineOptions({
  name: 'SmQuery',
  inheritAttrs: false
})

const props = withDefaults(defineProps<QueryProps>(), queryPropsDefault)

const emit = defineEmits<QueryEvents>()

const { t: $t } = useLocale()
const selectOptions = [
  {
    label: $t('query.currentMapBounds'),
    value: 'currentMapBounds'
  },
  {
    label: $t('query.mapBounds'),
    value: 'mapBounds'
  }
]
const viewModel = new QueryViewModel(props)
let selectSpaceFilter: QueryBoundsType
let resultFeatures: QueryResultParams['result']
let highlightLayerIds: string[]

const { textColorStyle, textColorHeadingStyle } = useTheme(props)
const scopedSlots = useSlots()
useMapGetter<Map>({
  loaded: clearResult,
  removed: clearResult,
  viewModel
})
const { isShow } = useMapControl()

const queryResult = ref<QueryResult>(null)
const activeTab = ref<'job' | 'result'>('job')
const activePanelIndex = ref<number>(null)
const activeResultIndexList = ref<number[]>([])
const activeQueryJob = ref<QueryJobItem['queryParameter']>(null)
const isQuery = ref(false)
const jobInfos = ref<QueryJobItem[]>([])
const resultLayers = ref<string[]>([])
const highlightCompRef = useTemplateRef('query-highlight')

const resultDisplayTitle = computed(() => {
  return (properties: any) => `SmID：${getValueCaseInsensitive(properties, 'smid')}`
})

const featureFieldsMap = computed(() => {
  if (resultLayers.value.length > 0) {
    const { fields } = queryResult.value
    return resultLayers.value.reduce((list, layerId) => {
      list[layerId] = fields
      return list
    }, {})
  }
  return null
})

const displayFieldsMap = computed(() => {
  if (resultLayers.value.length > 0) {
    const { fields } = activeQueryJob.value
    return resultLayers.value.reduce((list, layerId) => {
      list[layerId] = fields
      return list
    }, {})
  }
  return null
})

watch(
  [() => props.iportalData, () => props.restData, () => props.restMap],
  (nextList, prevList) => {
    nextList.forEach((next, index) => {
      const prev = prevList[index]
      onSearchDatasourceChanged(next, prev)
    })
  }
)

watch(
  () => props.layerStyle,
  () => {
    viewModel.layerStyle = { ...props.layerStyle }
  }
)

function onSearchDatasourceChanged(next: Record<string, any>[], prev: Record<string, any>[]) {
  if (!isSameData([next, prev])) {
    clearResult()
    formatJobInfos()
  }
}

function formatJobInfos() {
  jobInfos.value = []
  Object.keys(props).forEach(key => {
    if (key === 'iportalData' || key === 'restData' || key === 'restMap') {
      props[key]?.forEach(item => {
        item.name &&
          jobInfos.value.push({
            spaceFilter: 'currentMapBounds',
            queryParameter: Object.assign({}, item, { queryMode: item.queryMode || 'SQL' })
          })
      })
    }
  })
}

function queryButtonClicked(
  jobInfo: QueryJobItem['queryParameter'],
  value: QueryJobItem['spaceFilter']
) {
  message.destroy()
  if (
    JSON.stringify(activeQueryJob.value) === JSON.stringify(jobInfo) &&
    selectSpaceFilter === value &&
    queryResult.value
  ) {
    message.warning($t('query.resultAlreadyExists'))
    return
  }
  clearResult()
  isQuery.value = true
  activeTab.value = 'result'
  activeQueryJob.value = jobInfo
  selectSpaceFilter = value
  query(JSON.parse(JSON.stringify(jobInfo)), selectSpaceFilter)
}

function query(parameter: QueryParameter, bounds: QueryBoundsType = 'mapBounds') {
  viewModel.query(parameter, bounds)
}

function queryResultListClicked(index: number) {
  if (activeResultIndexList.value.includes(index)) {
    activeResultIndexList.value.splice(activeResultIndexList.value.indexOf(index), 1)
  } else if (props.multiSelect) {
    activeResultIndexList.value.push(index)
  } else {
    activeResultIndexList.value = [index]
  }
  const highlightComp = highlightCompRef.value
  const features = activeResultIndexList.value.map(i => resultFeatures[i])
  highlightComp && highlightComp.updateHighlightDatas({ features, layerId: resultLayers.value[0] })
}

function registerEvents() {
  viewModel.on('querysucceeded', (e: QueryResultEvent) => {
    isQuery.value = false
    queryResult.value = {
      ...e.result,
      result: e.result.result.map(item => item.properties)
    }
    resultFeatures = e.result.result
    resultLayers.value = e.layers
    emit('query-succeeded', e)
  })

  viewModel.on('queryfailed', (e: QueryFailedEvent) => {
    isQuery.value = false
    clearResult()
    message.warning(getFailedMessage(e))
    emit('query-failed', e)
  })
}

function getFailedMessage(e: QueryFailedEvent) {
  switch (e.code_name) {
    case 'NO_RESULTS':
      return $t('query.noResults')
    case 'SEVICE_NOT_SUPPORT':
      return $t('query.seviceNotSupport')
    default:
      return $t('query.queryFailed')
  }
}

function getPopupContainer(triggerNode: HTMLElement) {
  return triggerNode.parentNode as HTMLElement
}

function clearResult() {
  activeTab.value = 'job'
  activeResultIndexList.value = []
  resultLayers.value = []
  queryResult.value = null
  activeQueryJob.value = null
  viewModel.clear(highlightLayerIds)
}

function handleMapSeletionChanged(e: MapSelectionChangedEmit) {
  highlightLayerIds = e.highlightLayerIds
  if (e.dataSelectorMode !== 'ALL') {
    activeResultIndexList.value = []
  }
  emit('datachange', {
    ...e,
    layerName: queryResult.value.name,
    fields: activeQueryJob.value.fields
  })
}

function isSameData(compareDatas: Record<string, any>[][]) {
  const nextList = compareDatas.map(data =>
    data?.map(item => {
      if (item.fields && item.fields.length > 0) {
        return {
          ...item,
          fields: item.fields.map((sub: { fields: PopupFieldsInfo, slotName: string }) => omit(sub, ['slotName']))
        }
      }
      return item
    })
  )
  return isEqual.apply(null, nextList)
}

onMounted(() => {
  formatJobInfos()
  registerEvents()
})

onUnmounted(() => {
  clearResult()
})
</script>
