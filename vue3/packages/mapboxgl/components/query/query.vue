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
      <div v-if="activeTab === 'job'" class="sm-component-query__form">
        <div class="sm-component-query__item-holder">
          <div class="sm-component-query__section-title">{{ $t('query.queryLayer') }}</div>
          <sm-select
            v-model:value="activeJobIndex"
            class="sm-component-query__item-config"
            :get-popup-container="getPopupContainer"
            :style="textColorStyle"
            :placeholder="$t('popup.selectLayer')"
            :disabled="jobInfos.length === 0"
          >
            <sm-select-option
              v-for="(jobInfo, index) in jobInfos"
              :key="jobInfo.queryParameter.name"
              :value="index"
            >
              {{ jobInfo.queryParameter.name }}
            </sm-select-option>
          </sm-select>
        </div>
        <div class="sm-component-query__item-holder">
          <div class="sm-component-query__section-title">{{ $t('query.queryMode') }}</div>
          <div class="sm-component-query__radio-group">
            <label :class="['sm-component-query__radio-item', { 'is-disabled': !activeJobInfo }]">
              <input
                v-model="queryMode"
                class="sm-component-query__radio-input"
                type="radio"
                value="SQL"
                :disabled="!activeJobInfo"
              />
              <span>{{ $t('query.sqlExpression') }}</span>
            </label>
            <label :class="['sm-component-query__radio-item', { 'is-disabled': !activeJobInfo }]">
              <input
                v-model="queryMode"
                class="sm-component-query__radio-input"
                type="radio"
                value="KEYWORD"
                :disabled="!activeJobInfo"
              />
              <span>{{ $t('query.keywordQuery') }}</span>
            </label>
          </div>
          <sm-input
            v-model:value="queryCondition"
            allowClear
            class="sm-component-query__item-config sm-component-query__condition-input"
            :style="textColorStyle"
            :disabled="!activeJobInfo"
            :placeholder="
              queryMode === 'KEYWORD' ? $t('query.keyQueryPlaceholder') : $t('query.sqlQueryPlaceholder')
            "
          />
          <div v-if="sqlExpressionInvalid" class="sm-component-query__error">
            {{ $t('query.sqlExpressionInvalid') }}
          </div>
        </div>
        <div class="sm-component-query__item-holder">
          <div class="sm-component-query__section-title">{{ $t('query.queryBounds') }}</div>
          <div class="sm-component-query__radio-group">
            <label :class="['sm-component-query__radio-item', { 'is-disabled': !activeJobInfo }]">
              <input
                v-model="queryBounds"
                class="sm-component-query__radio-input"
                type="radio"
                value="currentMapBounds"
                :disabled="!activeJobInfo"
              />
              <span>{{ $t('query.currentMapBounds') }}</span>
            </label>
            <label :class="['sm-component-query__radio-item', { 'is-disabled': !activeJobInfo }]">
              <input
                v-model="queryBounds"
                class="sm-component-query__radio-input"
                type="radio"
                value="mapBounds"
                :disabled="!activeJobInfo"
              />
              <span>{{ $t('query.mapBounds') }}</span>
            </label>
          </div>
        </div>
        <div class="sm-component-query__query-button">
          <sm-button
            type="primary"
            size="small"
            class="sm-component-query__a-button"
            :disabled="queryButtonDisabled"
            @click="queryButtonClicked"
          >
            {{ $t('query.applicate') }}
          </sm-button>
        </div>
      </div>
      <div v-else class="sm-component-query__result-info">
          <div class="sm-component-query__result-header" :style="textColorHeadingStyle">
          <div class="sm-component-query__result-title">
            <i class="sm-components-icon-arrow-right sm-component-query__back" @click="backToQuery" />
            <span :title="queryHeaderName" class="sm-component-query__header-name">
              {{ queryHeaderName }}
            </span>
          </div>
          <i
            v-if="queryResult"
            :class="['sm-components-icon-delete', clearDisabled && 'is-disabled']"
            @click="clearResultClicked"
          />
        </div>
        <div v-show="isQuery && !queryResult" class="sm-component-query__result-loading">
          <sm-spin :tip="$t('query.querying')">
            <template #indicator>
              <LoadingOutlined style="font-size: 24px; /* stylelint-disable */" />
            </template>
          </sm-spin>
        </div>
        <div v-if="queryResult && queryResult.result.length === 0" class="sm-component-query__no-result">
          <sm-empty :description="$t('query.noResult')" />
        </div>
        <div v-if="queryResult && queryResult.result.length > 0" class="sm-component-query__result-body">
          <ul>
            <li
              v-for="(item, index) in queryResult.result"
              :key="resultItemKey(item, index)"
              :title="resultDisplayTitle(item)"
              role="option"
              :aria-selected="activeResultIndexList.includes(index)"
              @click="queryResultListClicked(index)"
            >
              {{ resultDisplayTitle(item) }}
              <i
                v-if="activeResultIndexList.includes(index)"
                class="sm-components-icon-complete"
              />
            </li>
          </ul>
        </div>
        <div v-if="queryResult" class="sm-component-query__result-count">
          {{ $t('query.resultCount', { count: queryResult.result.length }) }}
        </div>
      </div>
    </div>
    <SmLayerHighlight
      ref="query-highlight"
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
      :popupInfoMap="popupInfoMap"
      :popupConfig="popupConfigValue"
      :title="queryResult && queryResult.name"
      @mapselectionchanged="handleMapSeletionChanged"
    />
  </sm-collapse-card>
</template>

<script setup lang="ts">
import type { Map } from 'mapbox-gl'
import type { PopupInfo } from '@supermapgis/mapboxgl/components/popup-content/types'
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
import type { QueryParameter, QueryBoundsType } from 'vue-iclient-controllers-mapboxgl/src/QueryViewModel'
import { ref, computed, watch, onMounted, onUnmounted, useTemplateRef, useSlots } from 'vue'
import { useTheme, useMapGetter, useLocale } from '@supermapgis/common/hooks/index.common'
import { useMapControl } from '@supermapgis/mapboxgl/hooks'
import QueryViewModel from 'vue-iclient-controllers-mapboxgl/src/QueryViewModel'
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
import { normalizeQueryParameter, switchQueryMode, updateQueryExpression } from './utils'

defineOptions({
  name: 'SmQuery'
})

const props = withDefaults(defineProps<QueryProps>(), queryPropsDefault)

const emit = defineEmits<QueryEvents>()

const { t: $t } = useLocale()
const sqlExpressionPattern = /\S+\s*(=|<>|>=|<=|>|<|\blike\b|\bin\b|\bbetween\b)\s*\S+/i
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
const activeResultIndexList = ref<number[]>([])
const activeQueryJob = ref<QueryJobItem['queryParameter']>(null)
const isQuery = ref(false)
const jobInfos = ref<QueryJobItem[]>([])
const activeJobIndex = ref(0)
const resultLayers = ref<string[]>([])
const highlightCompRef = useTemplateRef('query-highlight')

const activeJobInfo = computed(() => jobInfos.value[activeJobIndex.value] || null)

const queryMode = computed({
  get: () => activeJobInfo.value?.queryParameter.queryMode || 'SQL',
  set: (value: QueryParameter['queryMode']) => {
    if (activeJobInfo.value) {
      activeJobInfo.value.queryParameter = switchQueryMode(activeJobInfo.value.queryParameter, value)
    }
  }
})

const queryBounds = computed({
  get: () => activeJobInfo.value?.spaceFilter || 'currentMapBounds',
  set: (value: QueryBoundsType) => {
    if (activeJobInfo.value) {
      activeJobInfo.value.spaceFilter = value
    }
  }
})

const queryCondition = computed({
  get: () => activeJobInfo.value?.queryParameter.attributeFilter || '',
  set: (value: string) => {
    if (activeJobInfo.value) {
      activeJobInfo.value.queryParameter = updateQueryExpression(activeJobInfo.value.queryParameter, value)
    }
  }
})

const sqlExpressionInvalid = computed(() => {
  if (queryMode.value !== 'SQL') return false
  const condition = queryCondition.value?.trim()
  if (!condition) return false
  return !sqlExpressionPattern.test(condition)
})

const queryButtonDisabled = computed(() => {
  return !activeJobInfo.value || sqlExpressionInvalid.value || isQuery.value
})

const queryHeaderName = computed(() => {
  return queryResult.value?.name || activeQueryJob.value?.name || ''
})

const clearDisabled = computed(() => {
  return Boolean(queryResult.value && queryResult.value.result?.length === 0)
})

const resultDisplayTitle = computed(() => {
  return (properties: any) => {
    const identifyField = activeQueryJob.value?.identifyField || 'SmID'
    const value = getValueCaseInsensitive(properties, identifyField)
    return `${identifyField}: ${value ?? ''}`
  }
})

const resultItemKey = computed(() => {
  return (properties: any, index: number) => {
    const identifyField = activeQueryJob.value?.identifyField || 'SmID'
    const value = getValueCaseInsensitive(properties, identifyField)
    return `${identifyField}-${value ?? index}-${index}`
  }
})

const featureFieldsMap = computed(() => {
  if (resultLayers.value.length > 0 && queryResult.value) {
    const { fields } = queryResult.value
    return resultLayers.value.reduce((list, layerId) => {
      list[layerId] = fields
      return list
    }, {})
  }
  return null
})

const hasRichPopupInfo = computed(() => {
  return Boolean(activeQueryJob.value?.popupInfo?.elements?.length)
})

const displayFieldsMap = computed(() => {
  // `popupInfo` 鍙兘瀛樺湪浣?elements 涓虹┖锛屾鏃朵粛搴旇蛋 key-value 寮圭獥閫昏緫
  if (hasRichPopupInfo.value) {
    return null
  }
  if (resultLayers.value.length > 0 && activeQueryJob.value) {
    const { fields } = activeQueryJob.value
    return resultLayers.value.reduce((list, layerId) => {
      list[layerId] = fields
      return list
    }, {})
  }
  return null
})

const popupInfoMap = computed(() => {
  const popupInfo = activeQueryJob.value?.popupInfo
  if (!hasRichPopupInfo.value || !popupInfo || !resultLayers.value.length) {
    return null
  }
  return resultLayers.value.reduce((list: Record<string, PopupInfo>, layerId) => {
    list[layerId] = popupInfo
    return list
  }, {} as Record<string, PopupInfo>)
})

const popupConfigValue = computed(() => {
  return props.popupConfig
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
            queryParameter: normalizeQueryParameter(item)
          })
      })
    }
  })
  if (activeJobIndex.value >= jobInfos.value.length) {
    activeJobIndex.value = 0
  }
}

function queryButtonClicked() {
  const jobInfo = activeJobInfo.value?.queryParameter
  const value = queryBounds.value
  if (!jobInfo) return
  if (sqlExpressionInvalid.value) return
  message.destroy()
  if (
    JSON.stringify(activeQueryJob.value) === JSON.stringify(jobInfo) &&
    selectSpaceFilter === value &&
    queryResult.value
  ) {
    message.warning($t('query.resultAlreadyExists'))
    activeTab.value = 'result'
    return
  }
  clearResult()
  isQuery.value = true
  activeTab.value = 'result'
  activeQueryJob.value = JSON.parse(JSON.stringify(jobInfo))
  selectSpaceFilter = value
  query(JSON.parse(JSON.stringify(jobInfo)), selectSpaceFilter)
}

function query(parameter: QueryParameter, bounds: QueryBoundsType = 'mapBounds') {
  viewModel.query(parameter, bounds)
}

function queryResultListClicked(index: number) {
  if (!resultLayers.value.length || !resultFeatures?.length) return
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
    activeTab.value = 'result'
    message.destroy()
    message.success($t('query.querySuccess'))
    emit('query-succeeded', e)
  })

  viewModel.on('queryfailed', (e: QueryFailedEvent) => {
    isQuery.value = false
    message.destroy()
    if (e.code_name === 'NO_RESULTS') {
      queryResult.value = {
        name: activeQueryJob.value?.name,
        result: [],
        fields: activeQueryJob.value?.fields || []
      }
      resultFeatures = []
      resultLayers.value = []
      activeResultIndexList.value = []
      activeTab.value = 'result'
      message.warning(getFailedMessage(e))
      emit('query-failed', e)
      return
    }
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

function backToQuery() {
  activeTab.value = 'job'
}

function clearResultClicked() {
  if (clearDisabled.value) return
  clearResult()
}

function clearResult() {
  activeTab.value = 'job'
  isQuery.value = false
  activeResultIndexList.value = []
  resultLayers.value = []
  queryResult.value = null
  activeQueryJob.value = null
  resultFeatures = []
  viewModel.clear(highlightLayerIds)
}

function handleMapSeletionChanged(e: MapSelectionChangedEmit) {
  highlightLayerIds = e.highlightLayerIds
  if (e.dataSelectorMode !== 'ALL') {
    activeResultIndexList.value = []
  }
  if (!queryResult.value || !activeQueryJob.value) {
    return
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
