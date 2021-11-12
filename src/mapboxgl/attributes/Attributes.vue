<template>
  <div class="sm-component-attributes" :style="[getTextColorStyle, getBackgroundStyle]">
    <div class="sm-component-attributes__header">
      <div class="sm-component-attributes__count">
        <span v-if="title" class="layer-name">{{ title }}</span>
        <span v-if="statistics.showTotal || statistics.showSelect">（</span>
        <span v-if="statistics.showTotal" class="total-numbers"
          >{{ this.$t('attributes.feature') }}：{{ paginationOptions.total || 0 }}</span
        >
        <span v-if="statistics.showTotal && statistics.showSelect">，</span>
        <span v-if="statistics.showSelect" class="select-numbers"
          >{{ this.$t('attributes.selected') }}：{{ selectedRowKeys.length || 0 }}</span
        >
        <span v-if="statistics.showTotal || statistics.showSelect">）</span>
      </div>
      <div class="sm-component-attributes__menu">
        <sm-dropdown v-if="toolbar.enabled" placement="bottomRight">
          <div class="ant-dropdown-link"><sm-icon :icon-style="{ color: '#ccc' }" type="menu" /></div>
          <sm-menu slot="overlay">
            <sm-menu-item>
              <div v-if="toolbar.showClearSelected" @click="clearSelectedRows">
                {{ this.$t('attributes.clearSelected') }}
              </div>
            </sm-menu-item>
            <sm-menu-item v-if="toolbar.showZoomToFeature && associateMap">
              <div @click="setZoomToFeature">{{ this.$t('attributes.zoomToFeatures') }}</div>
            </sm-menu-item>
            <sm-menu-item v-if="toolbar.showRefresh">
              <div @click="refreshData">{{ this.$t('attributes.refreshData') }}</div>
            </sm-menu-item>
            <sm-sub-menu
              v-if="toolbar.showColumnsControl"
              key="columnsControl"
              :title="this.$t('attributes.columnsControl')"
            >
              <sm-menu-item v-for="(column, index) in columns" :key="index">
                <sm-checkbox :checked="column.visible" @change="handleColumnVisible(column)" />
                {{ column.title }}
              </sm-menu-item>
            </sm-sub-menu>
          </sm-menu>
        </sm-dropdown>
      </div>
    </div>
    <sm-table
      ref="tableInstance"
      :data-source="tableData"
      :columns="compColumns"
      :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: changeSelectedRows }"
      :pagination="paginationOptions"
      :bordered="table.showBorder"
      :showHeader="table.showHeader"
      :customHeaderRow="customHeaderRow"
      :customRow="customRow"
      :loading="loading"
      :getPopupContainer="triggerNode => triggerNode.parentNode"
      table-layout="fixed"
      @change="handleChange"
    >
      <div
        slot="filterDropdown"
        slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
        :style="{ ...background, padding: '8px' }"
      >
        <sm-input
          :placeholder="`Search ${column.dataIndex}`"
          :value="selectedKeys[0]"
          style="width: 188px; margin-bottom: 8px; display: block;"
          @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
          @pressEnter="() => handleSearch(selectedKeys, confirm, column.dataIndex)"
        />
        <sm-button
          type="primary"
          icon="search"
          size="small"
          style="width: 90px; margin-right: 8px;"
          @click="() => handleSearch(selectedKeys, confirm, column.dataIndex)"
        >
          {{ $t('attributes.search') }}
        </sm-button>
        <sm-button size="small" style="width: 90px;" @click="() => handleSearchReset(clearFilters)">
          {{ $t('attributes.reset') }}
        </sm-button>
      </div>
      <sm-icon slot="filterIcon" icon-class="search" />
      <template slot="customRender" slot-scope="text, record, index, column">
        <span v-if="searchText && searchedColumn === column.dataIndex">
          <template v-for="fragment in text.toString().split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i'))">
            <template>{{ fragment }}</template>
          </template>
        </span>
        <template v-else>
          {{ text }}
        </template>
      </template>
    </sm-table>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Mixins } from 'vue-property-decorator';
import Theme from '../../common/_mixin/Theme';
import MapGetter from '../_mixin/map-getter';
import SmTable from '../../common/table/Table.vue';
import SmDropdown from '../../common/dropdown/Dropdown.vue';
import SmMenu from '../../common/menu/Menu.vue';
import SmMenuItem from '../../common/menu/MenuItem.vue';
import SmSubMenu from '../../common/menu/SubMenu.vue';
import SmButton from '../../common/button/Button.vue';
import SmInput from '../../common/input/Input.vue';
import SmIcon from '../../common/icon/Icon.vue';
import SmCheckbox from '../../common/checkbox/Checkbox.vue';
import CircleStyle from '../_types/CircleStyle';
import FillStyle from '../_types/FillStyle';
import LineStyle from '../_types/LineStyle';
import AttributesViewModel from './AttributesViewModel';
import clonedeep from 'lodash.clonedeep';
import isequal from 'lodash.isequal';
import VmUpdater from '../../common/_mixin/VmUpdater';

interface PaginationParams {
  defaultCurrent?: number;
  current?: number;
  pageSize?: number;
  total?: number;
}

interface FieldConfigParams {
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

interface AssociateWithMapParams {
  enabled?: boolean;
  zoomToFeature?: boolean;
  centerToFeature?: boolean;
}

interface StatisticsParams {
  showTotal?: boolean;
  showSelect?: boolean;
}

interface TableParams {
  showBorder?: boolean;
  showHeader?: boolean;
  pagination?: PaginationParams;
}

interface ToolbarParams {
  enabled?: boolean;
  showZoomToFeature?: boolean;
  showClearSelected?: boolean;
  showColumnsControl?: boolean;
  showRefresh?: boolean;
}

@Component({
  name: 'SmAttributes',
  components: {
    SmTable,
    SmDropdown,
    SmMenu,
    SmMenuItem,
    SmSubMenu,
    SmButton,
    SmInput,
    SmIcon,
    SmCheckbox
  },
  viewModelProps: ['layerName', 'dataset', 'lazy', 'associateWithMap', 'fieldInfo', 'paginationOptions', 'sorter']
})
class SmAttributes extends Mixins(MapGetter, Theme, VmUpdater) {
  tableData: Array<Object> = [];
  selectedRowKeys: Array<number> = [];
  columns: Array<Object> = [];
  paginationOptions: PaginationParams = {
    pageSize: 15,
    defaultCurrent: 2
  };

  sorter: Object = {};

  openKeys: Array<string> = [];

  loading: boolean = false;

  searchText: string = '';

  searchedColumn: string = '';

  fieldInfo: Array<Object> = [];

  @Prop() layerName: string; // 图层名

  @Prop() customRow: Function;

  @Prop() customHeaderRow: Function;

  @Prop() title: string;

  @Prop() dataset: any;

  @Prop({ default: true }) lazy: boolean;

  @Prop({
    default: () => {
      return { enabled: true, zoomToFeature: false, centerToFeature: false };
    }
  })
  associateWithMap: AssociateWithMapParams;

  @Prop({ default: () => [] }) fieldConfigs: FieldConfigParams;

  @Prop({
    default: () => {
      return {
        showHeader: true,
        showBorder: true,
        pagination: {}
      };
    }
  })
  table: TableParams;

  @Prop({
    default: () => {
      return {
        enabled: true,
        showZoomToFeature: true,
        showClearSelected: true,
        showColumnsControl: true,
        showRefresh: true
      };
    }
  })
  toolbar: ToolbarParams;

  @Prop({
    default: () => {
      return {
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
      };
    }
  })
  layerStyle: Object;

  @Prop({
    default: () => {
      return { showTotal: true, showSelect: true };
    }
  })
  statistics: StatisticsParams;

  @Watch('selectedRowKeys')
  selectedRowKeysChanged(val) {
    this.$emit('rowSelect', val);
    if (this.associateMap) {
      this.viewModel.addOverlaysToMap(val, this.layerStyle, this.title);
    }
  }

  @Watch('table', { immediate: true })
  tableChanged(val) {
    if (!isequal(this.paginationOptions, val.pagination)) {
      this.paginationOptions = Object.assign({}, this.paginationOptions, val.pagination);
    }
  }

  get associateMap() {
    return this.associateWithMap.enabled;
  }

  @Watch('fieldConfigs', { immediate: true })
  fieldConfigsChanged(val) {
    if (!isequal(val, this.fieldInfo)) {
      // @ts-ignore
      this.fieldInfo = val;
    }
  }

  get compColumns() {
    const columnsCopy = clonedeep(this.columns)
      .filter(column => {
        return column.visible;
      })
      .map(column => {
        delete column.visible;
        return column;
      });
    return columnsCopy;
  }

  created() {
    this.fieldInfo = clonedeep(this.fieldConfigs);
    this.viewModel = new AttributesViewModel({ paginationOptions: this.paginationOptions, ...this.$props, fieldConfigs: this.fieldInfo });
    this.bindEvents();
  }

  handleMapSelectedFeature(feature) {
    let index = +feature.properties.index;
    if (!this.selectedRowKeys.includes(index)) {
      this.selectedRowKeys.push(index);
    }
    let pageNumber = Math.ceil((index + 1) / this.paginationOptions.pageSize);
    let featureIndex = index % this.paginationOptions.pageSize;
    this.$set(this.paginationOptions, 'current', pageNumber);
    // @ts-ignore
    let tableWrap = this.$refs.tableInstance.$el;
    if (tableWrap && tableWrap.scrollHeight > tableWrap.clientHeight) {
      tableWrap.scrollTop = 0;
      this.handleScrollSelectedFeature(featureIndex, tableWrap);
    }
  }

  handleScrollSelectedFeature(featureIndex, tableWrap) {
    const rowHeight = document.querySelector('.sm-component-attributes .sm-component-table-row').clientHeight;
    const selectFeatureScrollTop = (featureIndex + 1) * rowHeight;
    if (selectFeatureScrollTop > tableWrap.clientHeight) {
      tableWrap.scrollTop = selectFeatureScrollTop;
    }
  }
  handleColumnVisible(column) {
    const columnIndex = this.columns.indexOf(column);
    column.visible = !column.visible;
    this.$set(this.columns, columnIndex, column);
    this.fieldInfo.forEach(item => {
      // @ts-ignore
      if (item.value === column.dataIndex) {
        // @ts-ignore
        item.visible = column.visible;
      }
    });
  }
  changeSelectedRows(selectedRowKeys) {
    this.selectedRowKeys = selectedRowKeys;
  }
  clearSelectedRows() {
    this.selectedRowKeys = [];
  }

  setZoomToFeature() {
    this.associateMap && this.viewModel && this.viewModel.zoomToFeatures(this.selectedRowKeys, { zoomToFeature: true });
  }

  handleChange(pagination, filters, sorter, { currentDataSource }) {
    this.paginationOptions = { ...this.paginationOptions, current: pagination.current };
    this.sorter = sorter;
    this.$emit('change', pagination, filters, sorter, { currentDataSource });
  }

  bindEvents() {
    this.viewModel.on('dataChanged', datas => {
      const { content, totalCount, columns } = datas;
      if (totalCount) {
        // @ts-ignore
        this.$set(this.paginationOptions, 'total', totalCount);
      }
      this.columns = columns;
      this.tableData = content;
    });
    this.viewModel.on('clearselectedrows', () => {
      this.clearSelectedRows();
    });
    this.viewModel.on('changeSelectLayer', feature => {
      this.handleMapSelectedFeature(feature);
    });
  }

  refreshData() {
    this.clearSelectedRows();
    this.tableData = [];
    this.viewModel.refresh();
  }

  handleSearch(selectedKeys, confirm, dataIndex) {
    this.searchedColumn = dataIndex;
    this.searchText = selectedKeys[0];
    this.viewModel.setSearchText(this.searchText, this.searchedColumn);
    confirm();
  }

  handleSearchReset(clearFilters) {
    clearFilters();
    this.searchText = '';
    this.viewModel.setSearchText();
  }

  removed() {
    this.viewModel.off('mapLoaded');
    this.viewModel.off('changeSelectLayer');
    this.viewModel = null;
  }
  beforeDestory() {
    this.$options.removed.call(this);
  }
}

export default SmAttributes;
</script>
