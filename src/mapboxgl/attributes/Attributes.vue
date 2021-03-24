<template>
  <div class="sm-component-attributes" :style="[getTextColorStyle, getBackgroundStyle]">
    <div class="sm-component-attributes__header">
      <div class="sm-component-attributes__count">
        <span v-if="title.enabled" class="layer-name">{{ title.value }}</span>
        <span v-if="statistics.showTotal || statistics.showSelect">（</span>
        <span v-if="statistics.showTotal" class="total-numbers">{{ this.$t('attributes.feature') }}：{{ tableData.length || 0 }}</span>
        <span v-if="statistics.showTotal && statistics.showSelect">，</span>
        <span v-if="statistics.showSelect" class="select-numbers">{{ this.$t('attributes.selected') }}：{{ selectedRowKeys.length || 0 }}</span>
        <span v-if="statistics.showTotal || statistics.showSelect">）</span>
      </div>
      <div class="sm-component-attributes__menu">
        <sm-dropdown v-if="toolbar.enabled" placement="bottomRight">
          <div class="ant-dropdown-link"><sm-icon :icon-style="{ color: '#ccc' }" type="menu" /></div>
          <sm-menu slot="overlay">
            <sm-menu-item>
              <div v-if="toolbar.showClearSelected" @click="clearSelectedRowKeys">
                {{ this.$t('attributes.clearSelected') }}
              </div>
            </sm-menu-item>
            <sm-menu-item v-if="toolbar.showZoomToFeature">
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
      :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
      :pagination="paginationOptions"
      :bordered="table.showBorder"
      :showHeader="table.showHeader"
      :customHeaderRow="customHeaderRow"
      :customRow="customRow"
      :loading="loading"
      table-layout="fixed"
      @change="handleChange"
    >
      <div
        slot="filterDropdown"
        slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
        :style="{ ...background, padding: '8px'}"
      >
        <sm-input
          v-ant-ref="c => (searchInput = c)"
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
        <sm-button size="small" style="width: 90px;" @click="() => handleReset(clearFilters)">
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
import mergewith from 'lodash.mergewith';
import isequal from 'lodash.isequal';
import getFeatures from '../../common/_utils/get-features';

interface titleParams {
  enabled?: boolean;
  value?: string;
}

interface PaginationParams {
  defaultCurrent?: number;
  current?: number;
  pageSize?: number;
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
  }
})
class SmAttributes extends Mixins(MapGetter, Theme) {
  tableData: Array<Object> = [];
  selectedRowKeys: Array<number> = [];
  columns: Array<Object> = [];
  paginationOptions: PaginationParams = {
    pageSize: 15,
    defaultCurrent: 2
  };

  featureMap: Object;

  openKeys: Array<string> = [];

  loading: boolean = false;

  searchText: string = '';

  searchInput: any = null;

  searchedColumn: string = '';

  @Prop() layerName: string; // 图层名

  @Prop() customRow: Function;

  @Prop() customHeaderRow: Function;

  @Prop({
    default: () => {
      return {
        enabled: false
      };
    }
  })
  title: titleParams;

  @Prop() dataset: any;

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

  @Watch('associateWithMap', { deep: true })
  associateWithMapChanged(val) {
    if (this.associateMap && this.layerName) {
      this.viewModel.startSelectFeature();
    } else {
      this.viewModel.endSelectFeature();
    }
  }
  @Watch('selectedRowKeys')
  selectedRowKeysChanged(val) {
    this.$emit('rowSelect', val);
    if (this.associateMap) {
      let highLightList = this.handleCoords(val);
      this.viewModel.addOverlaysToMap(
        highLightList,
        this.associateWithMap,
        this.featureMap,
        this.layerStyle,
        this.title.value
      );
    }
  }
  @Watch('layerName')
  layerNameChanged(val) {
    this.viewModel.reset({ layerName: val, layerStyle: this.layerStyle });
    this._initFeatures();
  }

  @Watch('table', { immediate: true })
  tableChanged(val) {
    if (!isequal(this.paginationOptions, val.pagination)) {
      this.paginationOptions = Object.assign({}, this.paginationOptions, val.pagination);
    }
  }

  @Watch('dataset', { deep: true, immediate: true })
  datasetChanged(newVal, oldVal) {
    if (this.dataset && (this.dataset.url || this.dataset.geoJSON)) {
      this.getFeaturesFromDataset();
    } else {
      this.featureMap = {};
      this.initViewModel({ layerName: this.layerName, layerStyle: this.layerStyle });
      this._eventsInit();
    }
  }

  get associateMap() {
    return this.associateWithMap.enabled;
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
    this.featureMap = {};
    this.initViewModel({ layerName: this.layerName, layerStyle: this.layerStyle });
    this._eventsInit();
  }

  initViewModel(options) {
    this.viewModel = new AttributesViewModel(options);
  }

  getFeaturesFromDataset(initLoading = true) {
    let { url, geoJSON } = this.dataset;
    this.loading = true;
    if (url || geoJSON) {
      let dataset = clonedeep(this.dataset);
      getFeatures(dataset).then(data => {
        if (data && data.features) {
          this.tableData = this.handleFeatures(data.features);
          this.loading = false;
        }
      });
    }
  }

  handleFeatures(data) {
    let features = data;
    let content = [];
    let headers = features[0].properties;
    this.handleColumns(headers);
    features &&
      features.forEach((feature, index) => {
        let properties = feature.properties;
        let coordinates = feature.geometry && feature.geometry.coordinates;

        if (!properties) {
          return;
        }

        if (coordinates && coordinates.length) {
          this.featureMap[properties.index] = feature;
        }
        properties.key = +properties.index;
        JSON.stringify(properties) !== '{}' && content.push(properties);
      });
    return content;
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
  handleColumns(headers) {
    let columns = [];

    Object.keys(headers).forEach((propertyName, index) => {
      let columnConfig = {
        title: propertyName,
        dataIndex: propertyName,
        visible: true
      };
      if (typeof +headers[propertyName] === 'number' && !isNaN(+headers[propertyName])) {
        // @ts-ignore
        columnConfig.sorter = (a, b) => a[propertyName] - b[propertyName];
      }
      // @ts-ignore
      if (this.fieldConfigs && this.fieldConfigs.length) {
        // @ts-ignore
        const config = this.fieldConfigs.find(fieldConfig => {
          return fieldConfig.value === propertyName;
        });
        if (config) {
          let copyConfig = clonedeep(config);

          copyConfig.dataIndex = copyConfig.value;
          delete copyConfig.value;
          columnConfig = mergewith(columnConfig, copyConfig, (obj, src) => {
            if (typeof src === 'undefined') {
              return obj;
            }
          });
          // @ts-ignore
          if (columnConfig.sorter && typeof columnConfig.sorter === 'boolean') {
            // @ts-ignore
            columnConfig.sorter = (a, b) => a[propertyName] - b[propertyName];
          }
          // @ts-ignore
          if (columnConfig.search) {
            // @ts-ignore
            if (!columnConfig.onFilter) {
              // @ts-ignore
              columnConfig.onFilter = (value, record) => (record[propertyName] + '').indexOf(value) === 0;
            }
            // @ts-ignore
            columnConfig.scopedSlots = {
              filterDropdown: 'filterDropdown',
              filterIcon: 'filterIcon',
              customRender: 'customRender'
            };
          }
          // @ts-ignore
          if (!columnConfig.customCell) {
            // @ts-ignore
            columnConfig.customCell = (record) => {
              return {
                attrs: {
                  title: record[copyConfig.dataIndex]
                }
              };
            };
          }
        }
      }
      columns.push(columnConfig);
    });
    let columnOrder = [];
    let columnsResult = [];
    // @ts-ignore
    this.fieldConfigs && this.fieldConfigs.forEach(element => {
      columnOrder.push(element.value);
    });
    columnOrder.forEach(str => {
      columns.forEach(element => {
        if (element.dataIndex === str) {
          columnsResult.push(element);
        }
      });
    });
    this.columns = columnsResult.length === 0 ? columns : columnsResult;
  }
  handleColumnVisible(column) {
    const columnIndex = this.columns.indexOf(column);
    column.visible = !column.visible;
    this.$set(this.columns, columnIndex, column);
  }
  onSelectChange(selectedRowKeys) {
    this.selectedRowKeys = selectedRowKeys;
  }
  handleCoords(selectedKeys) {
    let highLightList = {};
    selectedKeys.forEach(key => {
      if (this.featureMap[key]) {
        highLightList[key] = this.featureMap[key];
      }
    });
    return highLightList;
  }
  setZoomToFeature() {
    if (!this.associateMap) {
      return;
    }
    let highLightList = this.handleCoords(this.selectedRowKeys);
    this.viewModel && this.viewModel.zoomToFeatures(highLightList, { zoomToFeature: true });
  }
  clearSelectedRowKeys() {
    this.selectedRowKeys = [];
  }
  handleChange(pagination, filters, sorter, { currentDataSource }) {
    this.$set(this.paginationOptions, 'current', pagination.current);
    this.$emit('change', pagination, filters, sorter, { currentDataSource });
  }
  _eventsInit() {
    this.viewModel.on('mapLoaded', map => {
      this._initFeatures();
      if (this.associateMap) {
        this.viewModel.startSelectFeature();
      } else {
        this.viewModel.endSelectFeature();
      }
    });
    this.viewModel.on('changeSelectLayer', feature => {
      this.handleMapSelectedFeature(feature);
    });
  }

  _initFeatures() {
    if (this.layerName) {
      this.loading = true;
      const features = this.viewModel._initFeatures(this.layerName);
      this.tableData = this.handleFeatures(features);
      setTimeout(() => {
        this.loading = false;
      }, 0);
    }
  }

  refreshData() {
    this.selectedRowKeys = [];
    this.tableData = [];
    this.$set(this.paginationOptions, 'current', 1);
    if (this.dataset) {
      if (this.dataset && (this.dataset.url || this.dataset.geoJSON)) {
        this.getFeaturesFromDataset();
      }
    } else {
      this._initFeatures();
    }
  }

  handleSearch(selectedKeys, confirm, dataIndex) {
    confirm();
    this.searchText = selectedKeys[0];
    this.searchedColumn = dataIndex;
  }

  handleReset(clearFilters) {
    clearFilters();
    this.searchText = '';
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
