<template>
  <div class="sm-component-attributes" :style="[textColorStyle, gisControlBgStyle]">
    <div class="sm-component-attributes__header">
      <div class="sm-component-attributes__count">
        <span v-if="title" class="layer-name">{{ title }}</span>
        <span v-if="statistics.showTotal || statistics.showSelect">（</span>
        <span v-if="statistics.showTotal" class="total-numbers">
          {{ t('attributes.feature') }}：{{ allCount }}
        </span>
        <span v-if="statistics.showTotal && statistics.showSelect">，</span>
        <span v-if="statistics.showSelect" class="select-numbers">
          {{ t('attributes.selected') }}：{{ selectedRowLength || 0 }}
        </span>
        <span v-if="statistics.showTotal || statistics.showSelect">）</span>
      </div>
      <div class="sm-component-attributes__menu">
        <sm-dropdown v-if="toolbar.enabled" placement="bottomRight">
          <div class="sm-component-dropdown-link">
            <MenuOutlined />
          </div>
          <template #overlay>
            <sm-menu class="sm-component-attribute__dropdown-menu">
              <sm-menu-item>
                <div v-if="toolbar.showClearSelected" @click="clearSelectedRows">
                  {{ t('attributes.clearSelected') }}
                </div>
              </sm-menu-item>
              <sm-menu-item v-if="toolbar.showZoomToFeature && associateMap">
                <div @click="setZoomToFeature">{{ t('attributes.zoomToFeatures') }}</div>
              </sm-menu-item>
              <sm-menu-item v-if="toolbar.showRefresh">
                <div @click="refreshData">{{ t('attributes.refreshData') }}</div>
              </sm-menu-item>
              <sm-sub-menu
                v-if="toolbar.showColumnsControl"
                key="columnsControl"
                :title="t('attributes.columnsControl')"
              >
                <sm-menu-item v-for="(column, index) in columns" :key="index">
                  <sm-checkbox :checked="column.visible" @change="handleColumnVisible(column)" />
                  {{ column.title }}
                </sm-menu-item>
              </sm-sub-menu>
            </sm-menu>
          </template>
        </sm-dropdown>
      </div>
    </div>
    <sm-table
      ref="tableInstance"
      class="sm-attributes-table"
      :data-source="tableData"
      :columns="compColumns"
      :row-selection="
        tableOptions.showRowSelection
          ? { selectedRowKeys: selectedRowKeys, onChange: changeSelectedRows }
          : null
      "
      :pagination="paginationOptions"
      :bordered="tableOptions.showBorder"
      :showHeader="tableOptions.showHeader"
      :customHeaderRow="customHeaderRow"
      :customRow="customRow"
      :loading="loading"
      :scroll="{ x: xScrollWidth }"
      :getPopupContainer="getPopupContainerFn"
      table-layout="fixed"
      @change="handleChange"
    >
      <template
        #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
      >
        <div class="sm-component-table-custom-filter-dropdown" :style="{}">
          <sm-input
            :placeholder="`Search ${column.dataIndex}`"
            :value="selectedKeys[0]"
            style="width: 188px; margin-bottom: 8px; display: block"
            @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
            @pressEnter="() => handleSearch(selectedKeys, confirm, column.dataIndex)"
          />
          <sm-button
            type="primary"
            size="small"
            style="width: 90px; margin-right: 8px"
            @click="() => handleSearch(selectedKeys, confirm, column.dataIndex)"
          >
            <template #icon><i class="sm-components-icon-search"></i></template>
            {{ t('attributes.search') }}
          </sm-button>
          <sm-button
            size="small"
            style="width: 90px"
            @click="() => handleSearchReset(clearFilters)"
          >
            {{ t('attributes.reset') }}
          </sm-button>
        </div>
      </template>
      <template #customFilterIcon="{ column }">
        <SearchOutlined v-if="column.customFilterDropdown" />
        <FilterOutlined v-else />
      </template>
      <template #bodyCell="{ text, column }">
        <span v-if="searchText && searchedColumn === column.dataIndex">
          <template
            v-for="(fragment, i) in text
              .toString()
              .split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i'))"
          >
            <mark
              v-if="fragment.toLowerCase() === searchText.toLowerCase()"
              :key="i"
              class="highlight"
            >
              {{ fragment }}
            </mark>
            <template v-else>{{ fragment }}</template>
          </template>
        </span>
      </template>
    </sm-table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onBeforeMount, onBeforeUnmount } from 'vue'
import type {
  AttributesProps,
  AttributesEvents,
  ColoumParams,
  PaginationParams,
  FieldConfigParams,
  TableParams
} from './types'
import { attributesPropsDefault } from './types'
import { isEqual, cloneDeep } from 'lodash-es'
import AttributesViewModel from 'vue-iclient-core/controllers/mapboxgl/AttributesViewModel'
import { useTheme, useMapGetter, useVmProps, useLocale } from '@supermapgis/common/hooks/index.common'
import { MenuOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons-vue'
import SmTable from '@supermapgis/common/components/table/Table'
import SmDropdown from '@supermapgis/common/components/dropdown/Dropdown'
import SmButton from '@supermapgis/common/components/button/Button'
import SmMenu, { SmMenuItem, SmSubMenu } from '@supermapgis/common/components/menu/Menu'
import SmCheckbox from '@supermapgis/common/components/checkbox/Checkbox'
import SmInput from '@supermapgis/common/components/input/Input'

const { t } = useLocale()

const viewModelProps = [
  'layerName',
  'dataset',
  'lazy',
  'associateWithMap',
  'fieldInfo',
  'paginationOptions',
  'sorter'
]

defineOptions({
  name: 'SmAttributes',
  inheritAttrs: false
})

const props = withDefaults(defineProps<AttributesProps>(), attributesPropsDefault)
const emit = defineEmits<AttributesEvents>()

const tableData = ref<Array<Object>>([])
const selectedRowKeys = ref<Array<number>>([])
const columns = ref<Array<ColoumParams>>([])
const currentDataSource = ref<Array<Object>>([])
const totalCount = ref<number>(0)
const selectedRowLength = ref<number>(0)
let paginationOptions = ref<PaginationParams>({
  pageSize: 15,
  defaultCurrent: 1
})
const sorter = ref<Object>({})
const loading = ref<boolean>(false)
const searchText = ref<string>('')
const searchedColumn = ref<string>('')
const fieldInfo = ref<Array<FieldConfigParams>>([])
const xScrollWidth = ref<number>(0)
let tableOptions = ref<TableParams>({
  showHeader: true,
  showBorder: true,
  showRowSelection: true,
  pagination: {}
})
const tableInstance = ref()

const associateMap = computed(() => props.associateWithMap.enabled)

const allCount = computed(() => {
  if ('total' in paginationOptions) {
    return paginationOptions.value.total
  }
  return totalCount.value
})

const compColumns = computed(() => {
  return cloneDeep(columns.value)
    .filter(column => column.visible)
    .map(column => {
      delete column.visible
      return column
    })
})

let viewModel: InstanceType<typeof AttributesViewModel>
const { setViewModel } = useVmProps(props, viewModelProps)
const { setViewModel: setViewModelMap } = useMapGetter({})
const { textColorStyle, gisControlBgStyle } = useTheme(props)

const handleMapSelectedFeature = (feature: { properties: { index: string | number } }) => {
  let index = +feature.properties.index
  if (!selectedRowKeys.value.includes(index)) {
    selectedRowKeys.value.push(index)
  }
  selectedRowLength.value = selectedRowKeys.value.length
  let pageNumber = Math.ceil((index + 1) / paginationOptions.value.pageSize)
  let featureIndex = index % paginationOptions.value.pageSize
  paginationOptions.value.current = pageNumber
  const tableWrap = tableInstance.value.$el
  if (tableWrap && tableWrap.scrollHeight > tableWrap.clientHeight) {
    tableWrap.scrollTop = 0
    handleScrollSelectedFeature(featureIndex, tableWrap)
  }
}

const handleScrollSelectedFeature = (
  featureIndex: number,
  tableWrap: { clientHeight: number; scrollTop: number }
) => {
  const rowHeight = document.querySelector(
    '.sm-component-attributes .sm-component-table-row'
  ).clientHeight
  const selectFeatureScrollTop = (featureIndex + 1) * rowHeight
  if (selectFeatureScrollTop > tableWrap.clientHeight) {
    tableWrap.scrollTop = selectFeatureScrollTop
  }
}

const handleColumnVisible = (column: {
  value?: string
  title?: string
  visible?: boolean
  dataIndex?: string
}) => {
  const columnIndex = columns.value.indexOf(column)
  column.visible = !column.visible
  columns.value[columnIndex] = column
  fieldInfo.value.forEach(item => {
    if (item.value === column.dataIndex) {
      item.visible = column.visible
    }
  })
}

const getCurrentSelectedRowLength = () => {
  let currentSelectedRowKeys = []
  currentDataSource.value.forEach(data => {
    if (selectedRowKeys.value.indexOf(+data['index']) !== -1) {
      currentSelectedRowKeys.push(+data['index'])
    }
  })
  selectedRowLength.value = currentSelectedRowKeys.length
}

const changeSelectedRows = (newSelectedRowKeys: number[]) => {
  selectedRowKeys.value = newSelectedRowKeys
  if (currentDataSource.value.length > 0) {
    getCurrentSelectedRowLength()
  } else {
    selectedRowLength.value = newSelectedRowKeys.length
  }
}

const clearSelectedRows = () => {
  selectedRowKeys.value = []
  selectedRowLength.value = 0
}

const setZoomToFeature = () => {
  if (associateMap.value && viewModel) {
    viewModel.zoomToFeatures(selectedRowKeys.value)
  }
}

const handleChange = (
  pagination: { current: number },
  filters: {},
  newSorter: Object,
  { currentDataSource }: any
) => {
  currentDataSource.value = currentDataSource
  if (filters && Object.keys(filters).length) {
    paginationOptions.value.total = currentDataSource.length
  }
  getCurrentSelectedRowLength()
  paginationOptions.value = pagination
  sorter.value = newSorter
  emit('change', pagination, filters, newSorter, { currentDataSource })
}

const bindEvents = () => {
  viewModel.on('dataChanged', (datas: { content: any; totalCount: any; columns: any }) => {
    const { content, totalCount: newTotalCount, columns: newColumns } = datas
    if (newTotalCount) {
      totalCount.value = newTotalCount
      paginationOptions.value.total = newTotalCount
    }
    const hideColumns = columns.value.filter(item => !item.visible)
    hideColumns.forEach(element => {
      newColumns.forEach((element2: { dataIndex: string }, index: string | number) => {
        if (element.dataIndex === element2.dataIndex) {
          newColumns[index].visible = false
        }
      })
    })
    columns.value = newColumns
    tableData.value = content
  })

  viewModel.on('clearselectedrows', () => {
    clearSelectedRows()
  })

  viewModel.on('changeSelectLayer', (feature: any) => {
    handleMapSelectedFeature(feature)
  })
}

const refreshData = () => {
  clearSelectedRows()
  tableData.value = []
  viewModel.refresh()
}

const handleSearch = (selectedKeys: string[], confirm: () => void, dataIndex: string) => {
  searchedColumn.value = dataIndex
  searchText.value = selectedKeys[0]
  viewModel.setSearchText(searchText.value, searchedColumn.value)
  confirm()
}

const handleSearchReset = (clearFilters: () => void) => {
  clearFilters()
  searchText.value = ''
  viewModel.setSearchText()
}

const getPopupContainerFn = () => {
  return tableInstance.value.$el.querySelector('.sm-attributes-table .sm-component-table-content');
}

const removed = () => {
  viewModel.off('dataChanged')
  viewModel.off('clearselectedrows')
  viewModel.off('changeSelectLayer')
  viewModel = null
}

watch(() => fieldInfo, newVal => {
  viewModel.setFieldInfo(newVal.value)
}, { deep: true })

watch(selectedRowKeys, newVal => {
  emit('rowSelect', newVal)
  if (associateMap.value && viewModel) {
    viewModel.addOverlaysToMap(newVal, props.layerStyle, props.title)
  }
})

watch(
  () => props.table,
  (newVal, oldVal) => {
    if (!isEqual(newVal, oldVal)) {
      tableOptions.value = Object.assign({}, tableOptions.value, newVal)
      paginationOptions.value = Object.assign({}, paginationOptions.value, newVal.pagination)
    }
  },
  { immediate: true }
)

watch(
  () => props.fieldConfigs,
  newVal => {
    if (!isEqual(newVal, fieldInfo.value)) {
      let total = 0
      newVal.forEach(item => {
        total += +item.width || 128
      })
      xScrollWidth.value = total
      fieldInfo.value = newVal
    }
  },
  { immediate: true }
)

onBeforeMount(() => {
  fieldInfo.value = cloneDeep(props.fieldConfigs)
  viewModel = new AttributesViewModel({
    paginationOptions: paginationOptions.value,
    ...props,
    fieldConfigs: fieldInfo.value
  })
  setViewModel(viewModel)
  setViewModelMap(viewModel)
  bindEvents()
})

onBeforeUnmount(() => {
  removed()
})
</script>
