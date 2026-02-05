<template>
  <div
    id="sm-component-search"
    ref="searchRoot"
    class="sm-component-search"
    :style="textColorHeadingStyle"
  >
    <div
      v-if="showIcon && mode === 'control'"
      class="sm-component-search__toggle-icon"
      :style="gisControlHeaderBgStyle"
      @click="toggleSearchAndIcon"
    >
      <i class="sm-components-icon-search" />
    </div>
    <transition name="sm-component-zoom-in" @after-leave="toggleIconVisibility">
      <div
        v-show="showSearch || mode === 'toolBar'"
        class="sm-component-search__content"
        :style="[
          { 'transform-origin': position.includes('left') ? 'top left' : 'top right' },
          gisControlHeaderBgStyle,
          contentWidthStyle
        ]"
      >
        <div
          :class="{ 'sm-component-search__input': true, 'with-split-line': splitLine }"
          :aria-position="position.includes('left') ? 'left' : 'right'"
          :style="gisControlHeaderBgStyle"
        >
          <div
            v-if="mode === 'control'"
            class="sm-component-search__arrow-icon"
            @click="toggleSearchVisibility"
          >
            <i
              :class="
                position.includes('left')
                  ? 'sm-components-icon-double-left'
                  : 'sm-components-icon-double-right'
              "
            />
          </div>
          <div
            v-if="showDatasourceSelect"
            class="sm-component-search__datasource-icon"
            @click.stop="toggleDatasourcePanel"
          >
            <i
              :class="[
                'sm-components-icon-solid-triangle-down',
                { 'is-open': datasourcePanelVisible }
              ]"
            />
          </div>
          <sm-input
            v-model:value="searchKey"
            :class="['sm-component-search__a-input', { 'toolBar-input': mode === 'toolBar' }]"
            :placeholder="inputPlaceHolderText"
            allowClear
            @input="searchInput"
            @compositionstart="handleCompositionTransition(true)"
            @compositionend="handleCompositionTransition(false)"
            @pressEnter="searchButtonClicked"
            @focus="handleFocus"
            @blur="handleBlur"
            @keyup="changeResultHover"
            @change="handleInputChange"
          />
          <div class="sm-component-search__search-icon" @click="searchButtonClicked">
            <LoadingOutlined v-if="prefixType === 'loading'" />
            <SearchOutlined v-else />
          </div>
        </div>
        <div
          v-show="panelVisible"
          class="sm-component-search__result"
          :style="[gisControlBgStyle, resultPanelStyle]"
        >
          <template v-if="datasourcePanelVisible">
            <ul class="sm-component-search__datasource-list" :style="textColorStyle">
              <li class="sm-component-search__datasource-item" @click.stop>
                <sm-checkbox
                  :checked="allDatasourceSelected"
                  :indeterminate="datasourceIndeterminate"
                  @change="toggleSelectAllDatasource"
                />
                <span class="sm-component-search__datasource-label">全选</span>
              </li>
              <li
                v-for="item in datasourceOptions"
                :key="item.id"
                class="sm-component-search__datasource-item"
                @click.stop
              >
                <sm-checkbox
                  :checked="selectedDatasourceIds.includes(item.id)"
                  @change="toggleDatasource(item.id, $event)"
                />
                <span class="sm-component-search__datasource-label add-ellipsis" :title="item.label">
                  {{ item.label }}
                </span>
              </li>
            </ul>
          </template>
          <template v-else-if="showHistoryPanel">
            <ul class="sm-component-search__history-list" :style="textColorStyle">
              <li
                v-for="record in displayedHistory"
                :key="record"
                class="sm-component-search__history-item"
                :title="record"
                @mousedown.prevent
                @click="historyRecordClicked(record)"
              >
                <span class="sm-component-search__history-text add-ellipsis">{{ record }}</span>
                <i
                  class="sm-components-icon-delete sm-component-search__history-delete"
                  @mousedown.prevent.stop
                  @click.stop="deleteHistoryRecord(record)"
                />
              </li>
            </ul>
          </template>
          <template v-else>
            <div v-if="showNoResult" class="sm-component-search__no-result" :style="textColorStyle">
              {{ noResultText }}
            </div>
            <div v-else>
              <div
                v-for="(result, index) in searchResult"
                :key="index"
                class="sm-component-search__panel"
              >
                <div
                  v-if="result.source && showTitle && result.result.length"
                  class="sm-component-search__panel-header-wrapper"
                >
                  <div class="sm-component-search__panel-header">
                    <i class="sm-components-icon-list" />
                    <span class="add-ellipsis">{{ result.source }}</span>
                  </div>
                </div>
                <div
                  v-if="result.result"
                  class="sm-component-search__panel-body"
                  :style="textColorStyle"
                >
                  <ul :class="{ noMarginBottom: !showTitle }">
                    <li
                      v-for="(item, i) in result.result"
                      :key="i"
                      :title="item.filterVal || item.name || item.address"
                      :class="{
                        active:
                          keyupHoverInfo.groupIndex === index && keyupHoverInfo.hoverIndex === i,
                        'add-ellipsis': true
                      }"
                      @click="searchResultListClicked(item)"
                    >
                      {{ item.filterVal || item.name || item.address }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </transition>
    <TablePopup
      v-show="showTablePopup"
      ref="searchTablePopup"
      v-bind="tablePopupProps"
      :split-line="splitLine"
      :text-color="textColor"
      :background="background"
    />
  </div>
</template>

<script setup lang="ts">
import type { Map } from 'mapbox-gl'
import type { SearchProps, SearchEvents, SearchResult, SearchFailedEvent, PointData } from './types'
import type { TablePopupProps } from '@supermapgis/common/components/table-popup/types'
import {
  ref,
  computed,
  watch,
  nextTick,
  useTemplateRef,
  onMounted,
  onBeforeUnmount
} from 'vue'
import type {
  FeatureResult,
  RestMapInfo,
  RestDataInfo,
  FetchDataBase,
  OnlineLocalSearch,
  LayerSearchInfo
} from 'vue-iclient-controllers-mapboxgl/src/SearchViewModel'
import { useTheme,useMapGetter, useLocale } from '@supermapgis/common/hooks/index.common'
import { useMapControl } from '@supermapgis/mapboxgl/hooks'
import SearchViewModel from 'vue-iclient-controllers-mapboxgl/src/SearchViewModel'
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import SmInput from '@supermapgis/common/components/input/Input'
import SmCheckbox from '@supermapgis/common/components/checkbox/Checkbox'
import { message as Message } from 'ant-design-vue'
import TablePopup from '@supermapgis/common/components/table-popup/table-popup.vue'
import { setPopupArrowStyle } from 'vue-iclient-core/utils/util'
import { isEqual } from 'lodash-es'
import { searchPropsDefault } from './types'

defineOptions({
  name: 'SmSearch'
})

const props = withDefaults(defineProps<SearchProps>(), searchPropsDefault)

const emit = defineEmits<SearchEvents>()

const viewModel = new SearchViewModel({ ...props, emitMode: 'all' })

const { t: $t } = useLocale()
const { textColorStyle, textColorHeadingStyle, gisControlHeaderBgStyle, gisControlBgStyle, popupBgStyle } = useTheme(props)
const { mapNotLoadedTip } = useMapGetter<Map>({
  removed,
  viewModel
})
useMapControl()

const inputPlaceHolderText = computed(() => props.inputPlaceHolder ?? $t('search.inputPlaceHolder'))

// Refs
const searchKey = ref<string>(null)
const searchResult = ref<SearchResult[]>([])
const prefixType = ref<string>('search')
const isActive = ref(false)
const dropdownVisible = ref(false)
const datasourcePanelVisible = ref(false)
const hasSearched = ref(false)
const searchCompleted = ref(false)
const historyRecords = ref<string[]>([])
const selectedDatasourceIds = ref<string[]>([])
const tablePopupProps = ref<Partial<TablePopupProps>>({})
const showSearch = ref(!props.collapsed)
const showIcon = ref(props.collapsed)
const isInputing = ref(false)
const isSuggestion = ref(false)
const keyupHoverInfo = ref({
  groupIndex: undefined,
  hoverIndex: undefined
})
const showTablePopup = ref(false)
const searchRootRef = useTemplateRef('searchRoot')
const tablePopupCompRef = useTemplateRef('searchTablePopup')
let searchTaskId: number | undefined

type DatasourceItemType =
  | 'layerNames'
  | 'onlineLocalSearch'
  | 'restMap'
  | 'restData'
  | 'iportalData'
  | 'addressMatch'

type DatasourceOption = {
  id: string
  type: DatasourceItemType
  label: string
  payload?: string | LayerSearchInfo | RestMapInfo | RestDataInfo | FetchDataBase | null
}

const datasourceOptions = computed<DatasourceOption[]>(() => {
  const options: DatasourceOption[] = []
  if (props.layerNames?.length) {
    props.layerNames.forEach(layer => {
      const layerName = typeof layer === 'string' ? layer : layer.layerName
      const label = typeof layer === 'string' ? layer : layer.name || layer.layerName
      options.push({ id: `layerNames:${layerName}`, type: 'layerNames', label, payload: layer })
    })
  }
  if (props.onlineLocalSearch?.enable) {
    options.push({
      id: 'onlineLocalSearch',
      type: 'onlineLocalSearch',
      label: 'Online 本地搜索',
      payload: null
    })
  }
  if (props.restMap?.length) {
    props.restMap.forEach((item, idx) => {
      const label = item.name || item.layerName || `RestMap-${idx + 1}`
      options.push({ id: `restMap:${idx}`, type: 'restMap', label, payload: item })
    })
  }
  if (props.restData?.length) {
    props.restData.forEach((item, idx) => {
      const label = item.name || item.dataName?.[0] || `RestData-${idx + 1}`
      options.push({ id: `restData:${idx}`, type: 'restData', label, payload: item })
    })
  }
  if (props.iportalData?.length) {
    props.iportalData.forEach((item, idx) => {
      const label = item.name || `Iportal-${idx + 1}`
      options.push({ id: `iportalData:${idx}`, type: 'iportalData', label, payload: item })
    })
  }
  if (props.addressMatch?.length) {
    props.addressMatch.forEach((item, idx) => {
      const label = item.name || `AddressMatch-${idx + 1}`
      options.push({ id: `addressMatch:${idx}`, type: 'addressMatch', label, payload: item })
    })
  }
  return options
})

const showDatasourceSelect = computed(() => datasourceOptions.value.length > 0)

watch(
  datasourceOptions,
  (next, prev) => {
    const nextIds = next.map(item => item.id)
    const prevIds = prev?.map(item => item.id) || []
    const wasAllSelected =
      prevIds.length > 0 && selectedDatasourceIds.value.length === prevIds.length
    const nextSelected = selectedDatasourceIds.value.filter(id => nextIds.includes(id))
    if (wasAllSelected) {
      selectedDatasourceIds.value = nextIds
      return
    }
    if (nextSelected.length === 0 && nextIds.length > 0) {
      selectedDatasourceIds.value = nextIds
      return
    }
    selectedDatasourceIds.value = nextSelected
  },
  { immediate: true }
)

const allDatasourceSelected = computed(() => {
  return datasourceOptions.value.length > 0 && selectedDatasourceIds.value.length === datasourceOptions.value.length
})

const datasourceIndeterminate = computed(() => {
  return selectedDatasourceIds.value.length > 0 && !allDatasourceSelected.value
})

const maxHistoryCount = computed(() => {
  const count = Number(props.historyMaxCount ?? 10)
  if (Number.isNaN(count)) return 10
  return Math.min(Math.max(count, 1), 30)
})

const historyStoreMaxCount = 30

const displayedHistory = computed(() => {
  const newestFirst = props.historyNewestFirst
  const list = newestFirst ? historyRecords.value : historyRecords.value.slice().reverse()
  return list
})

const showHistoryPanel = computed(() => {
  return (
    dropdownVisible.value &&
    props.showHistory &&
    isActive.value &&
    !searchKey.value &&
    historyRecords.value.length > 0 &&
    !datasourcePanelVisible.value
  )
})

const showResultList = computed(() => {
  if (!searchResult.value.length) return false
  if (!isSuggestion.value && !props.showResult) return false
  return true
})

const showNoResult = computed(() => {
  return (
    dropdownVisible.value &&
    props.showResult &&
    !isSuggestion.value &&
    hasSearched.value &&
    searchCompleted.value &&
    !!searchKey.value &&
    searchResult.value.length === 0 &&
    !datasourcePanelVisible.value
  )
})

const showResultPanel = computed(() => dropdownVisible.value && !datasourcePanelVisible.value && (showResultList.value || showNoResult.value))

const panelVisible = computed(() => {
  return datasourcePanelVisible.value || showHistoryPanel.value || showResultPanel.value
})

const resultPanelStyle = computed(() => {
  if (!showHistoryPanel.value) return {}
  const itemHeight = 32
  const extraPadding = 12 // result padding-top + list padding
  return {
    maxHeight: `${maxHistoryCount.value * itemHeight + extraPadding}px`
  }
})

const contentWidthStyle = computed(() => {
  const width = props.resultPanelWidth
  if (width === undefined || width === null || width === '') return {}
  const value = typeof width === 'number' || /^\d+$/.test(String(width)) ? `${width}px` : String(width)
  return { width: value }
})

const noResultText = computed(() => {
  return searchKey.value ? `未搜索到“${searchKey.value}”相关结果` : '未搜索到相关结果'
})

watch(
  [() => props.iportalData, () => props.restData, () => props.restMap, () => props.addressMatch],
  (nextList, prevList) => {
    nextList.forEach((next, index) => {
      const prev = prevList[index]
      onSearchDatasourceChanged(next, prev)
    })
  }
)

onMounted(() => {
  document.addEventListener('mousedown', handleOutsideMousedown)
})

onBeforeUnmount(() => {
  Message.destroy()
  document.removeEventListener('mousedown', handleOutsideMousedown)
})

function onSearchDatasourceChanged(next: Record<string, any>[], prev: Record<string, any>[]) {
  if (searchKey.value && !isEqual(next, prev)) {
    executeSearch({ recordHistory: false })
  }
}

function clearResult(isClear: boolean = false) {
  Message.destroy()
  if (isClear) {
    searchKey.value = null
    unregisterEvents(searchTaskId)
    searchTaskId = undefined
    hasSearched.value = false
    searchCompleted.value = false
  }
  searchResult.value = []
  prefixType.value = 'search'
  keyupHoverInfo.value = {
    groupIndex: undefined,
    hoverIndex: undefined
  }
  viewModel.removed()
}

function searchInput() {
  if (props.openSearchSuggestion && !isInputing.value) {
    if (searchKey.value) {
      isSuggestion.value = true
      executeSearch({ recordHistory: false })
    } else {
      inputValueCleared(false)
    }
  }
}

function searchButtonClicked() {
  isSuggestion.value = false
  executeSearch({ recordHistory: true })
}

function applySelectedDatasourcesToViewModel(): number {
  const selectedSet = new Set(selectedDatasourceIds.value)
  const layerNames: (string | LayerSearchInfo)[] = []
  const restMap: RestMapInfo[] = []
  const restData: RestDataInfo[] = []
  const iportalData: FetchDataBase[] = []
  const addressMatch: FetchDataBase[] = []
  let onlineLocalSearchSelected = false

  datasourceOptions.value.forEach(item => {
    if (!selectedSet.has(item.id)) return
    if (item.type === 'layerNames' && item.payload) layerNames.push(item.payload as string | LayerSearchInfo)
    if (item.type === 'restMap' && item.payload) restMap.push(item.payload as RestMapInfo)
    if (item.type === 'restData' && item.payload) restData.push(item.payload as RestDataInfo)
    if (item.type === 'iportalData' && item.payload) iportalData.push(item.payload as FetchDataBase)
    if (item.type === 'addressMatch' && item.payload) addressMatch.push(item.payload as FetchDataBase)
    if (item.type === 'onlineLocalSearch') onlineLocalSearchSelected = true
  })

  // Keep other options in sync with props before searching.
  viewModel.options.maxFeatures = props.maxFeatures
  viewModel.options.alwaysCenter = props.alwaysCenter
  viewModel.options.resultRender = props.resultRender

  viewModel.options.layerNames = layerNames
  viewModel.options.restMap = restMap
  viewModel.options.restData = restData
  viewModel.options.iportalData = iportalData
  viewModel.options.addressMatch = addressMatch
  viewModel.options.onlineLocalSearch = {
    ...(props.onlineLocalSearch || ({} as OnlineLocalSearch)),
    enable: onlineLocalSearchSelected
  }

  return layerNames.length + restMap.length + restData.length + iportalData.length + addressMatch.length + (onlineLocalSearchSelected ? 1 : 0)
}

function addHistoryRecord(keyword: string) {
  if (!props.showHistory) return
  const value = keyword?.trim()
  if (!value) return
  const list = historyRecords.value.slice()
  const idx = list.indexOf(value)
  if (idx > -1) list.splice(idx, 1)
  list.unshift(value)
  historyRecords.value = list.slice(0, historyStoreMaxCount)
}

function executeSearch({ recordHistory }: { recordHistory: boolean }) {
  clearResult()
  datasourcePanelVisible.value = false
  dropdownVisible.value = true
  hasSearched.value = true
  searchCompleted.value = false

  const mapNotLoaded = mapNotLoadedTip()
  if (mapNotLoaded) return

  const keyword = searchKey.value?.trim()
  if (!keyword) {
    Message.warning($t('search.noKey'))
    return
  }
  searchKey.value = keyword

  const selectedCount = applySelectedDatasourcesToViewModel()
  if (selectedCount <= 0) {
    Message.warning($t('search.setSearchSource'))
    return
  }

  recordHistory && addHistoryRecord(keyword)

  unregisterEvents(searchTaskId)
  searchTaskId = viewModel.search(keyword)
  registerEvents(searchTaskId)
  prefixType.value = 'loading'
}

function inputValueCleared(emitEvent = true) {
  clearResult(true)
  viewModel.removed()
  emitEvent && emit('clear-search-result')
}

function searchResultText(item: FeatureResult) {
  return (item?.filterVal || item?.name || item?.address || '').toString()
}

function primaryResultText(item: FeatureResult) {
  const text = searchResultText(item)
  if (!text) return ''
  const separators = ['：', ':', '，', ',']
  let cutIndex = text.length
  separators.forEach(sep => {
    const idx = text.indexOf(sep)
    if (idx > -1 && idx < cutIndex) cutIndex = idx
  })
  const primary = text.slice(0, cutIndex).trim()
  return primary || text
}

function searchResultListClicked(data: FeatureResult) {
  isSuggestion.value = false
  // Ensure popup shows all attributes (legacy behavior relied on `：`).
  viewModel.getFeatureInfo(`selected：${searchResultText(data)}`, data)
}

function toggleDatasourcePanel() {
  dropdownVisible.value = true
  datasourcePanelVisible.value = !datasourcePanelVisible.value
}

function toggleSelectAllDatasource(e: any) {
  const checked = !!e?.target?.checked
  selectedDatasourceIds.value = checked ? datasourceOptions.value.map(item => item.id) : []
}

function toggleDatasource(id: string, e: any) {
  const checked = !!e?.target?.checked
  const list = selectedDatasourceIds.value.slice()
  const index = list.indexOf(id)
  if (checked && index === -1) list.push(id)
  if (!checked && index > -1) list.splice(index, 1)
  selectedDatasourceIds.value = list
}

function historyRecordClicked(record: string) {
  searchKey.value = record
  isSuggestion.value = false
  executeSearch({ recordHistory: true })
}

function deleteHistoryRecord(record: string) {
  const list = historyRecords.value.slice()
  const idx = list.indexOf(record)
  if (idx > -1) list.splice(idx, 1)
  historyRecords.value = list
}

function unregisterEvents(taskId?: number) {
  if (!isNumber(taskId)) return
  viewModel.off('searchsucceeded' + taskId, searchSucceeded)
  viewModel.off('searchfailed' + taskId, searchFailed)
  viewModel.off('set-popup-content' + taskId, setPopupContent)
  viewModel.off('addfeaturefailed' + taskId, illegalFeatureTip)
  viewModel.off('search-selected-info' + taskId, searchSelectedInfo)
}

function registerEvents(taskId: number) {
  viewModel.on('searchsucceeded' + taskId, searchSucceeded)
  viewModel.on('searchfailed' + taskId, searchFailed)
  viewModel.on('set-popup-content' + taskId, setPopupContent)
  viewModel.on('addfeaturefailed' + taskId, illegalFeatureTip)
  viewModel.on('search-selected-info' + taskId, searchSelectedInfo)
}

function searchSucceeded({ result }: { result: SearchResult[] }) {
  /**
   * @event searchSucceeded
   * @desc 搜索成功后触发。
   * @property {Object} e  - 事件对象。
   */
  // @ts-ignore
  Message.destroy()
  searchResult.value = result
  emit('search-succeeded', { searchResult: searchResult.value })
  prefixType.value = 'search'
  searchCompleted.value = true
}

function searchFailed(e: SearchFailedEvent) {
  /**
   * @event searchFailed
   * @desc 搜索失败后触发。
   * @property {Object} e  - 事件对象。
   */
  prefixType.value = 'search'
  // Message.warning($t('search.noResult'));
  emit('search-failed', e)
  searchResult.value = []
  searchCompleted.value = true
}

function setPopupContent({ popupData }: { popupData: PointData }) {
  if (popupData?.info.length) {
    const state = {
      columns: [
        {
          title: $t('search.attribute'),
          dataIndex: 'attribute',
          width: 80,
          customRender: ({ text, record }) =>
            record.useDefaultAttribute ? $t('search.address') : text
        },
        { title: $t('search.attributeValue'), dataIndex: 'attributeValue', width: 150 }
      ],
      data: popupData.info
    }
    tablePopupProps.value = { ...state }
  }
  showTablePopup.value = true
  nextTick(() => {
    viewModel.setPopupContent(popupData.coordinates, tablePopupCompRef.value.root, () =>
      setPopupArrowStyle(popupBgStyle)
    )
  })
}

function illegalFeatureTip() {
  Message.destroy()
  Message.error($t('search.illegalFeature'))
}

function searchSelectedInfo({ data }: { data: Record<string, any> }) {
  prefixType.value = 'search'
  props.resultRender?.(data)
  emit('search-selected-info', data)
}

function isNumber(num: number) {
  if (num === undefined || num === null) return false
  return /\d/.test(num.toString())
}

function downChoose() {
  const len = searchResult.value.filter(item => item.result.length).length
  let { groupIndex = 0, hoverIndex } = keyupHoverInfo.value
  const groupResult = groupIndex
    ? searchResult.value[groupIndex].result
    : searchResult.value[0].result
  const subLen = groupResult.length
  groupIndex =
    groupIndex < len - 1 && hoverIndex >= subLen - 1
      ? Math.min(len - 1, groupIndex + 1)
      : groupIndex === len - 1 && hoverIndex === subLen - 1
        ? 0
        : groupIndex
  if (isNumber(hoverIndex) && hoverIndex < subLen - 1) {
    keyupHoverInfo.value.hoverIndex = hoverIndex + 1
  } else {
    keyupHoverInfo.value.groupIndex = groupIndex
    keyupHoverInfo.value.hoverIndex = 0
  }
  const selectedItem = searchResult.value[groupIndex].result[keyupHoverInfo.value.hoverIndex]
  searchKey.value = primaryResultText(selectedItem)
}

function upChoose() {
  const len = searchResult.value.filter(item => item.result.length).length
  let { groupIndex = 0, hoverIndex } = keyupHoverInfo.value
  groupIndex =
    groupIndex > 0 && !hoverIndex
      ? Math.max(0, groupIndex - 1)
      : !groupIndex && !hoverIndex
        ? len - 1
        : groupIndex
  if (isNumber(hoverIndex) && hoverIndex > 0) {
    keyupHoverInfo.value.hoverIndex = hoverIndex - 1
  } else {
    keyupHoverInfo.value.groupIndex = groupIndex
    keyupHoverInfo.value.hoverIndex = Math.max(searchResult.value[groupIndex].result.length - 1, 0)
  }
  const selectedItem = searchResult.value[groupIndex].result[keyupHoverInfo.value.hoverIndex]
  searchKey.value = primaryResultText(selectedItem)
}

function changeResultHover(e: KeyboardEvent) {
  const { keyCode } = e
  if (!showResultList.value) return
  if (keyCode === 38) {
    upChoose()
  } else if (keyCode === 40) {
    downChoose()
  }
}

function toggleSearchAndIcon() {
  closePanels()
  toggleIconVisibility()
  toggleSearchVisibility()
}

function toggleIconVisibility() {
  showIcon.value = !showIcon.value
}

function toggleSearchVisibility() {
  closePanels()
  showSearch.value = !showSearch.value
}

function handleCompositionTransition(inputing: boolean) {
  isInputing.value = inputing
}

function handleFocus() {
  isActive.value = true
  dropdownVisible.value = true
  datasourcePanelVisible.value = false
}

function handleBlur() {
  isActive.value = false
}

function handleInputChange(e: any) {
  if (!e.target.value) {
    inputValueCleared()
  }
}

function removed() {
  clearResult(true)
}

function closePanels() {
  datasourcePanelVisible.value = false
  dropdownVisible.value = false
}

function handleOutsideMousedown(e: MouseEvent) {
  const root = searchRootRef.value as unknown as HTMLElement | undefined
  if (!root) return
  if (!root.contains(e.target as Node)) {
    closePanels()
  }
}
</script>
