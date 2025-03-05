<template>
  <div id="sm-component-search" class="sm-component-search" :style="textColorHeadingStyle">
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
          gisControlHeaderBgStyle
        ]"
      >
        <div
          :class="{ 'sm-component-search__input': true, 'with-split-line': splitLine }"
          :aria-orientation="position.includes('left') ? 'left' : 'right'"
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
          <div class="sm-component-search__search-icon" @click="searchButtonClicked">
            <LoadingOutlined v-if="prefixType === 'loading'"  />
            <SearchOutlined v-else />
          </div>
          <sm-input
            v-model:value="searchKey"
            :class="['sm-component-search__a-input', { 'toolBar-input': mode === 'toolBar' }]"
            :placeholder="$t('search.inputPlaceHolder')"
            allowClear
            @input="searchInput"
            @compositionstart="handleCompositionTransition(true)"
            @compositionend="handleCompositionTransition(false)"
            @pressEnter="searchButtonClicked"
            @focus="toggleActiveState"
            @blur="toggleActiveState"
            @keyup="changeResultHover"
            @change="handleInputChange"
          />
        </div>
        <div
          v-show="resultSuggestions"
          class="sm-component-search__result"
          :style="gisControlBgStyle"
        >
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
                    active: keyupHoverInfo.groupIndex === index && keyupHoverInfo.hoverIndex === i,
                    'add-ellipsis': true
                  }"
                  @click="searchResultListClicked(item, $event)"
                >
                  {{ item.filterVal || item.name || item.address }}
                </li>
              </ul>
            </div>
          </div>
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
  onBeforeUnmount
} from 'vue'
import { useTheme } from '@supermapgis/common/components/theme/theme'
import { useMapGetter, useLocale } from '@supermapgis/common/hooks/index.common'
import { useMapControl } from '@supermapgis/mapboxgl/hooks'
import SearchViewModel from 'vue-iclient-core/controllers/mapboxgl/SearchViewModel'
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import SmInput from '@supermapgis/common/components/input/input'
import { message as Message } from 'ant-design-vue'
import TablePopup from '@supermapgis/common/components/table-popup/table-popup.vue'
import { setPopupArrowStyle } from 'vue-iclient-core/utils/util'
import { isEqual } from 'lodash-es'
import { searchPropsDefault } from './types'

defineOptions({
  name: 'SmSearch',
  inheritAttrs: false
})

const props = withDefaults(defineProps<SearchProps>(), searchPropsDefault)

const emit = defineEmits<SearchEvents>()

const viewModel = new SearchViewModel({ ...props })

const { t: $t } = useLocale()
const { textColorStyle, textColorHeadingStyle, gisControlHeaderBgStyle, gisControlBgStyle, popupBgStyle } = useTheme(props)
const { mapNotLoadedTip } = useMapGetter<Map>({
  removed,
  viewModel
})
useMapControl()

// Refs
const searchKey = ref<string>(null)
const searchResult = ref<SearchResult[]>([])
const prefixType = ref<string>('search')
const isActive = ref(false)
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
const tablePopupCompRef = useTemplateRef('searchTablePopup')
let searchTaskId: number | undefined

const resultSuggestions = computed(() => {
  if (!isSuggestion.value && !props.showResult) {
    return false
  }
  return searchResult.value.length > 0
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

onBeforeUnmount(() => {
  Message.destroy()
})

function onSearchDatasourceChanged(next: Record<string, any>[], prev: Record<string, any>[]) {
  if (searchKey.value && !isEqual(next, prev)) {
    search()
  }
}

function clearResult(isClear: boolean = false) {
  Message.destroy()
  if (isClear) {
    searchKey.value = null
    resetLastEvent()
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
      search()
    } else {
      inputValueCleared(false)
    }
  }
}

function searchButtonClicked() {
  isSuggestion.value = false
  search()
}

function search() {
  clearResult()
  const mapNotLoaded = mapNotLoadedTip()
  if (mapNotLoaded) return
  let { layerNames, onlineLocalSearch, restMap, restData, iportalData, addressMatch } = props
  if (
    (layerNames && layerNames.length > 0) ||
    onlineLocalSearch.enable ||
    (restMap && restMap.length > 0) ||
    (restData && restData.length > 0) ||
    (iportalData && iportalData.length > 0) ||
    (addressMatch && addressMatch.length > 0)
  ) {
    if (searchKey.value) {
      searchTaskId = viewModel.search(searchKey.value)
      regiterEvents()
      prefixType.value = 'loading'
    } else {
      Message.warning($t('search.noKey'))
    }
  } else {
    Message.warning($t('search.setSearchSource'))
  }
}

function inputValueCleared(emitEvent = true) {
  clearResult(true)
  viewModel.removed()
  emitEvent && emit('clear-search-result')
}

function searchResultListClicked(data: Record<string, any>, event: MouseEvent) {
  const searchKey = (event.target as HTMLElement).innerHTML
  isSuggestion.value = false
  viewModel.getFeatureInfo(searchKey, data)
}

function resetLastEvent() {
  if (/\d/.test(searchTaskId?.toString() || '')) {
    const viewModel = new SearchViewModel(props)
    viewModel.off('searchsucceeded' + searchTaskId)
    viewModel.off('searchfailed' + searchTaskId)
    viewModel.off('set-popup-content' + searchTaskId)
    viewModel.off('addfeaturefailed' + searchTaskId)
    viewModel.off('search-selected-info' + searchTaskId)
    searchTaskId = undefined
  }
}

function registerSuccessEvent(searchTaskId: number) {
  viewModel.on('searchsucceeded' + searchTaskId, searchSucceeded)
}

function registerFailedEvent(searchTaskId: number) {
  viewModel.on('searchfailed' + searchTaskId, searchFailed)
}

function regiterEvents() {
  if (isNumber(searchTaskId)) {
    viewModel.off('searchsucceeded' + (searchTaskId - 1), searchSucceeded)
    viewModel.off('searchsucceeded' + (searchTaskId - 1), searchFailed)
    viewModel.off('set-popup-content' + (searchTaskId - 1), setPopupContent)
    viewModel.off('addfeaturefailed' + (searchTaskId - 1), illegalFeatureTip)
    viewModel.off('search-selected-info' + (searchTaskId - 1), searchSelectedInfo)
  }
  const onTaskId = searchTaskId || 0
  registerSuccessEvent(onTaskId)
  registerFailedEvent(onTaskId)
  viewModel.on('set-popup-content' + onTaskId, setPopupContent)
  viewModel.on('addfeaturefailed' + onTaskId, illegalFeatureTip)
  viewModel.on('search-selected-info' + onTaskId, searchSelectedInfo)
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
  if (isNumber(searchTaskId)) {
    searchTaskId += 1
    regiterEvents()
  }
}

function searchFailed(e: SearchFailedEvent) {
  /**
   * @event searchFailed
   * @desc 搜索失败后触发。
   * @property {Object} e  - 事件对象。
   */
  clearResult()
  prefixType.value = 'search'
  // Message.warning($t('search.noResult'));
  emit('search-failed', e)
  if (isNumber(searchTaskId)) {
    searchTaskId += 1
    regiterEvents()
  }
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
  searchKey.value = (selectedItem.filterVal || selectedItem.name || selectedItem.address).split(
    '：'
  )[0]
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
  searchKey.value = (selectedItem.filterVal || selectedItem.name || selectedItem.address).split(
    '：'
  )[0]
}

function changeResultHover(e: KeyboardEvent) {
  const { keyCode } = e
  if (keyCode === 38) {
    upChoose()
  } else if (keyCode === 40) {
    downChoose()
  }
}

function toggleSearchAndIcon() {
  toggleIconVisibility()
  toggleSearchVisibility()
}

function toggleIconVisibility() {
  showIcon.value = !showIcon.value
}

function toggleSearchVisibility() {
  showSearch.value = !showSearch.value
}

function handleCompositionTransition(inputing: boolean) {
  isInputing.value = inputing
}

function toggleActiveState() {
  isActive.value = !isActive.value
}

function handleInputChange(e: any) {
  if (!e.target.value) {
    inputValueCleared()
  }
}

function removed() {
  clearResult(true)
}
</script>
