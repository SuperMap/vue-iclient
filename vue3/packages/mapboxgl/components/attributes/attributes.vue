<template>
  <div class="sm-component-attributes">
    <div class="sm-component-attributes__header">
      <div class="sm-component-attributes__count">
        <span v-if="title" class="layer-name">{{ title }}</span>
        <span v-if="statistics.showTotal || statistics.showSelect">（</span>
        <span v-if="statistics.showTotal" class="total-numbers">attributes.feature：{{ allCount }}</span>
        <span v-if="statistics.showTotal && statistics.showSelect">，</span>
        <span v-if="statistics.showSelect" class="select-numbers">attributes.selected：{{ selectedRowLength
          || 0 }}</span>
        <span v-if="statistics.showTotal || statistics.showSelect">）</span>
      </div>
      <div class="sm-component-attributes__menu">
        <a-dropdown v-if="toolbar.enabled" placement="bottomRight">
          <div class="sm-component-dropdown-link"><MenuOutlined /></div>
          <template #overlay>
            <a-menu class="sm-component-attribute_dropdown-menu">
              <a-menu-item>
                <div v-if="toolbar.showClearSelected" @click="clearSelectedRows">
                  attributes.clearSelected
                </div>
              </a-menu-item>
              <a-menu-item v-if="toolbar.showZoomToFeature && associateMap">
                <div @click="setZoomToFeature">attributes.zoomToFeatures</div>
              </a-menu-item>
              <a-menu-item v-if="toolbar.showRefresh">
                <div @click="refreshData">attributes.refreshData</div>
              </a-menu-item>
              <a-sub-menu v-if="toolbar.showColumnsControl" key="columnsControl" title="attributes.columnsControl">
                <a-menu-item v-for="(column, index) in columns" :key="index">
                  <a-checkbox :checked="column.visible" @change="handleColumnVisible(column)" />
                  {{ column.title }}
                </a-menu-item>
              </a-sub-menu>
            </a-menu>
          </template>

        </a-dropdown>
      </div>
    </div>
    <a-table ref="tableInstance" class="sm-attributes-table" :data-source="tableData" :columns="compColumns"
      :row-selection="tableOptions.showRowSelection ? { selectedRowKeys: selectedRowKeys, onChange: changeSelectedRows } : null"
      :pagination="paginationOptions" :bordered="tableOptions.showBorder" :showHeader="tableOptions.showHeader"
      :customHeaderRow="customHeaderRow" :customRow="customRow" :loading="loading" :scroll="{ x: xScrollWidth }"
      table-layout="fixed" @change="handleChange">
      <template #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }">
        <div class="sm-component-table-custom-filter-dropdown" :style="{  }">
          <a-input :placeholder="`Search ${column.dataIndex}`" :value="selectedKeys[0]"
            style="width: 188px; margin-bottom: 8px; display: block"
            @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
            @pressEnter="() => handleSearch(selectedKeys, confirm, column.dataIndex)" />
          <a-button type="primary" size="small" style="width: 90px; margin-right: 8px"
            @click="() => handleSearch(selectedKeys, confirm, column.dataIndex)">
            <template #icon><SearchOutlined /></template>
            attributes.search
          </a-button>
          <a-button size="small" style="width: 90px" @click="() => handleSearchReset(clearFilters)">
            attributes.reset
          </a-button>
        </div>
      </template>
      <template #customFilterIcon="{column}">
        <SearchOutlined v-if="column.customFilterDropdown"/>
        <FilterOutlined v-else/>
      </template>
      <!-- <template #filterIcon>
        <SearchOutlined/>
      </template> -->
      <template #customRender="{ text, column }">
        <span v-if="searchText && searchedColumn === column.dataIndex">
          <template v-for="fragment in text.toString().split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i'))">
            <template>{{ fragment }}</template>
          </template>
        </span>
        <template v-else>
          {{ text }}
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import clonedeep from 'lodash.clonedeep';
import isequal from 'lodash.isequal';
import AttributesViewModel from 'vue-iclient-core/controllers/mapboxgl/AttributesViewModel';
import CircleStyle from 'vue-iclient-core/controllers/mapboxgl/_types/CircleStyle';
import FillStyle from 'vue-iclient-core/controllers/mapboxgl/_types/FillStyle';
import LineStyle from 'vue-iclient-core/controllers/mapboxgl/_types/LineStyle';
import { useVmUpdater } from '@supermapgis/common/utils/hooks/VmUpdater'; 
import { useMapGetter } from '@supermapgis/common/utils/hooks/useMapGetter'; 
import { Table as ATable, Dropdown as ADropdown, Menu as AMenu, MenuItem as AMenuItem, SubMenu as ASubMenu, Checkbox as ACheckbox, Button as AButton, Input as AInput } from 'ant-design-vue';
import { MenuOutlined, SearchOutlined, FilterOutlined  } from '@ant-design/icons-vue';

export interface PaginationParams {
  defaultCurrent?: number;
  current?: number;
  pageSize?: number;
  total?: number;
}

export interface FieldConfigParams {
  title?: string;
  value: string;
  visible?: boolean;
  align?: string;
  filterMultiple?: boolean;
  onFilter?: Function;
  onFilterDropdownVisibleChange?: Function;
  sorter?: Function | boolean;
  defaultSortOrder?: string;
  width?: string | number;
  search?: boolean;
  customCell?: Function;
  customHeaderCell?: Function;
}

export interface AssociateWithMapParams {
  enabled?: boolean;
  zoomToFeature?: boolean;
  centerToFeature?: boolean;
}

export interface StatisticsParams {
  showTotal?: boolean;
  showSelect?: boolean;
}

export interface TableParams {
  showBorder?: boolean;
  showHeader?: boolean;
  showRowSelection?: boolean;
  pagination?: PaginationParams;
}

export interface ToolbarParams {
  enabled?: boolean;
  showZoomToFeature?: boolean;
  showClearSelected?: boolean;
  showColumnsControl?: boolean;
  showRefresh?: boolean;
}

const emit = defineEmits(['rowSelect', 'change', 'loaded']);

const props = defineProps({
  layerName: {
    type: String,
    default: ''
  },
  customRow: {
    type: Function,
    default: () => () => { }
  },
  customHeaderRow: {
    type: Function,
    default: () => () => { }
  },
  title: {
    type: String,
    default: ''
  },
  dataset: {
    type: null,
    default: null
  },
  lazy: {
    type: Boolean,
    default: true
  },
  associateWithMap: {
    type: Object as () => AssociateWithMapParams,
    default: () => ({
      enabled: true,
      zoomToFeature: false,
      centerToFeature: false
    })
  },
  fieldConfigs: {
    type: Array as () => FieldConfigParams[],
    default: () => []
  },
  table: {
    type: Object as () => TableParams,
    default: () => ({
      showHeader: true,
      showBorder: true,
      showRowSelection: true,
      pagination: {}
    })
  },
  toolbar: {
    type: Object as () => ToolbarParams,
    default: () => ({
      enabled: true,
      showZoomToFeature: true,
      showClearSelected: true,
      showColumnsControl: true,
      showRefresh: true
    })
  },
  layerStyle: {
    type: Object,
    default: () => ({
      line: new LineStyle({
        'line-width': 3,
        'line-color': '#409eff',
        'line-opacity': 1
      }),
      circle: new CircleStyle({
        'circle-color': '#409eff',
        'circle-opacity': 0.6,
        'circle-radius': 8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#409eff',
        'circle-stroke-opacity': 1
      }),
      fill: new FillStyle({
        'fill-color': '#409eff',
        'fill-opacity': 0.6,
        'fill-outline-color': '#409eff'
      }),
      stokeLine: new LineStyle({
        'line-width': 3,
        'line-color': '#409eff',
        'line-opacity': 1
      })
    })
  },
  statistics: {
    type: Object,
    default: () => ( { showTotal: true, showSelect: true })
  }
});

const tableData = ref<Array<Object>>([]);
const selectedRowKeys = ref<Array<number>>([]);
const columns = ref<Array<Object>>([]);
const currentDataSource = ref<Array<Object>>([]);
const totalCount = ref<number>(0);
const selectedRowLength = ref<number>(0);
let paginationOptions = ref<PaginationParams>({
  pageSize: 15,
  defaultCurrent: 1
});
const sorter = ref<Object>({});
const openKeys = ref<Array<string>>([]);
const loading = ref<boolean>(false);
const searchText = ref<string>('');
const searchedColumn = ref<string>('');
const fieldInfo = ref<Array<Object>>([]);
const xScrollWidth = ref<number>(0);
let tableOptions = ref<TableParams>({
  showHeader: true,
  showBorder: true,
  showRowSelection: true,
  pagination: {}
});
const viewModel = ref<AttributesViewModel | null>(null);
const tableInstance = ref();
const viewModelProps = computed(() => {
  return {
    layerName: props.layerName,
    dataset: props.dataset,
    lazy: props.lazy,
    associateWithMap: props.associateWithMap,
    fieldInfo: fieldInfo.value,
    paginationOptions: paginationOptions.value,
    sorter: sorter.value
  }
});

useVmUpdater(viewModelProps, viewModel);


const associateMap = computed(() => props.associateWithMap.enabled);

const allCount = computed(() => {
  if ('total' in paginationOptions) {
    return paginationOptions.value.total;
  }
  return totalCount.value;
});

const compColumns = computed(() => {
  return clonedeep(columns.value)
    .filter(column => column.visible)
    .map(column => {
      delete column.visible;
      return column;
    });
});

const handleMapSelectedFeature = (feature) => {
  let index = +feature.properties.index;
  if (!selectedRowKeys.value.includes(index)) {
    selectedRowKeys.value.push(index);
  }
  selectedRowLength.value = selectedRowKeys.value.length;
  let pageNumber = Math.ceil((index + 1) / paginationOptions.value.pageSize);
  let featureIndex = index % paginationOptions.value.pageSize;
  paginationOptions.value.current = pageNumber;
  const tableWrap = tableInstance.value.$el;
  if (tableWrap && tableWrap.scrollHeight > tableWrap.clientHeight) {
    tableWrap.scrollTop = 0;
    handleScrollSelectedFeature(featureIndex, tableWrap);
  }
};

const handleScrollSelectedFeature = (featureIndex, tableWrap) => {
  const rowHeight = document.querySelector('.sm-component-attributes .sm-component-table-row').clientHeight;
  const selectFeatureScrollTop = (featureIndex + 1) * rowHeight;
  if (selectFeatureScrollTop > tableWrap.clientHeight) {
    tableWrap.scrollTop = selectFeatureScrollTop;
  }
};

const handleColumnVisible = (column) => {
  const columnIndex = columns.value.indexOf(column);
  column.visible = !column.visible;
  columns.value[columnIndex] = column;
  fieldInfo.value.forEach(item => {
    if (item.value === column.dataIndex) {
      item.visible = column.visible;
    }
  });
};

const getCurrentSelectedRowLength = () => {
  let currentSelectedRowKeys = [];
  currentDataSource.value.forEach(data => {
    if (selectedRowKeys.value.indexOf(+data['index']) !== -1) {
      currentSelectedRowKeys.push(+data['index']);
    }
  });
  selectedRowLength.value = currentSelectedRowKeys.length;
};

const changeSelectedRows = (newSelectedRowKeys) => {
  selectedRowKeys.value = newSelectedRowKeys;
  if (currentDataSource.value.length > 0) {
    getCurrentSelectedRowLength();
  } else {
    selectedRowLength.value = newSelectedRowKeys.length;
  }
};

const clearSelectedRows = () => {
  selectedRowKeys.value = [];
  selectedRowLength.value = 0;
};

const setZoomToFeature = () => {
  if (associateMap.value && viewModel.value) {
    viewModel.value.zoomToFeatures(selectedRowKeys.value, { zoomToFeature: true });
  }
};

const handleChange = (pagination, filters, newSorter, { currentDataSource }) => {
  currentDataSource.value = currentDataSource;
  if (filters && Object.keys(filters).length) {
    paginationOptions.value.total = currentDataSource.length;
  }
  getCurrentSelectedRowLength();
  paginationOptions.value.current = pagination.current;
  sorter.value = newSorter;
  emit('change', pagination, filters, newSorter, { currentDataSource });
};

const bindEvents = () => {
  viewModel.value.on('dataChanged', (datas) => {
    const { content, totalCount: newTotalCount, columns: newColumns } = datas;
    if (newTotalCount) {
      totalCount.value = newTotalCount;
      paginationOptions.value.total = newTotalCount;
    }
    const hideColumns = columns.value.filter(item => !item.visible);
    hideColumns.forEach(element => {
      newColumns.forEach((element2, index) => {
        if (element.dataIndex === element2.dataIndex) {
          newColumns[index].visible = false;
        }
      });
    });
    columns.value = newColumns;
    tableData.value = content;
  });

  viewModel.value.on('clearselectedrows', () => {
    clearSelectedRows();
  });

  viewModel.value.on('changeSelectLayer', (feature) => {
    handleMapSelectedFeature(feature);
  });
};

const refreshData = () => {
  clearSelectedRows();
  tableData.value = [];
  viewModel.value.refresh();
};

const handleSearch = (selectedKeys, confirm, dataIndex) => {
  console.log('selectedKeys, confirm, dataIndex', selectedKeys, dataIndex);
  searchedColumn.value = dataIndex;
  searchText.value = selectedKeys[0];
  viewModel.value.setSearchText(searchText.value, searchedColumn.value);
  confirm();
};

const handleSearchReset = (clearFilters) => {
  clearFilters();
  searchText.value = '';
  viewModel.value.setSearchText();
};

// const getPopupContainerFn = () => {
//   return tableInstance.value.$el.querySelector('.sm-attributes-table .sm-component-table-content');
// };

const removed = () => {
  viewModel.value.off('dataChanged');
  viewModel.value.off('clearselectedrows');
  viewModel.value.off('changeSelectLayer');
  viewModel.value = null;
};

watch(selectedRowKeys, (newVal) => {
  emit('rowSelect', newVal);
  if (associateMap.value && viewModel.value) {
    viewModel.value.addOverlaysToMap(newVal, props.layerStyle, props.title);
  }
});

watch(() => props.table, (newVal, oldVal) => {
  if (!isequal(newVal, oldVal)) {
    tableOptions.value = Object.assign({}, tableOptions.value, newVal);
    paginationOptions.value = Object.assign({}, paginationOptions.value, newVal.pagination);
  }
});

watch(() => props.fieldConfigs, (newVal) => {
  if (!isequal(newVal, fieldInfo.value)) {
    let total = 0;
    newVal.forEach((item) => {
      total += item.width || 128;
    });
    xScrollWidth.value = total;
    fieldInfo.value = newVal;
  }
});

onMounted(() => {
  fieldInfo.value = clonedeep(props.fieldConfigs);
  viewModel.value = new AttributesViewModel({
    paginationOptions: paginationOptions.value,
    ...props,
    fieldConfigs: fieldInfo.value
  });
  bindEvents();
});

onBeforeUnmount(() => {
  removed();
});

</script>