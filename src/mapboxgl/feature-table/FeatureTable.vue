<template>
  <div class="sm-component-feature-table">
    <div class="sm-component-feature-table__header">
      <div class="sm-component-feature-table__count">
        <span v-if="layerName" class="layer-name">{{ layerName }}</span>
        <span v-if="statistics.showTotal" class="total-numbers">({{ this.$t('featureTable.feature') }}：{{ tableData.length || 0 }},</span
        >
        <span v-if="statistics.showSelect" class="select-numbers">{{ this.$t('featureTable.selected') }}：{{ selectedRowKeys.length || 0 }})</span
        >
      </div>
      <div class="sm-component-feature-table__menu">
        <sm-dropdown v-if="toolbar.enabled">
          <div class="ant-dropdown-link"><sm-icon type="menu" /></div>
          <sm-menu slot="overlay">
            <sm-menu-item>
              <div v-if="toolbar.showClearSelected" @click="clearSelectedRowKeys">
                {{ this.$t('featureTable.clearSelected') }}
              </div>
            </sm-menu-item>
            <sm-menu-item v-if="toolbar.showZoomToFeature">
              <div @click="setZoomToFeature">{{ this.$t('featureTable.zoomToFeatures') }}</div>
            </sm-menu-item>
            <sm-sub-menu
              v-if="toolbar.showColumnsControl"
              key="columnsControl"
              :title="this.$t('featureTable.columnsControl')"
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
      @change="handleChange"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Mixins } from 'vue-property-decorator';
import Theme from '../../common/_mixin/Theme';
import MapGetter from '../_mixin/map-getter';
import SmTable from '../../common/table/Table.vue';
import CircleStyle from '../_types/CircleStyle';
import FillStyle from '../_types/FillStyle';
import LineStyle from '../_types/LineStyle';
import FeatureTableViewModel from './FeatureTableViewModel';
import clonedeep from 'lodash.clonedeep';
import isequal from 'lodash.isequal';

interface PaginationParams {
  current?: number;
  pageSize?: number;
}

interface FieldConfigParams {
  title?: string;
  value: string;
  visible?: boolean;
  align?: string;
  filtered?: boolean;
  onFilter?: Function;
  onFilterDropdownVisibleChange?: Function;
  sorter?: Function | boolean;
  sortOrder?: boolean | string;
  sortDirections?: Array<string>;
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
}

@Component({
  name: 'SmFeatureTable',
  components: {
    SmTable
  }
})
class SmFeatureTable extends Mixins(MapGetter, Theme) {
  tableData: Array<Object> = [];
  selectedRowKeys: Array<number> = [];
  columns: Array<Object> = [];
  paginationOptions: PaginationParams = {
    pageSize: 15,
    current: 1
  };

  featureMap: Object;

  @Prop() layerName: string; // 图层名

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
      return { enabled: true, showZoomToFeature: true, showClearSelected: true, showColumnsControl: true };
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
    if (val.enabled) {
      this.viewModel.startSelectFeature();
    } else {
      this.viewModel.endSelectFeature();
    }
  }
  @Watch('selectedRowKeys')
  selectedRowKeysChanged(val) {
    this.$emit('rowSelect', val, this.featureMap);
    if (this.associateWithMap) {
      let highLightList = this.handleCoords(val);
      this.viewModel.addOverlaysToMap(highLightList, this.associateWithMap);
    }
  }
  @Watch('layerName')
  layerNameChanged(val) {
    this.initViewModel({ layerName: val, layerStyle: this.layerStyle });
    this._initFeatures();
  }

  @Watch('table')
  tableChanged(val) {
    if (!isequal(this.paginationOptions, val.pagination)) {
      this.paginationOptions = val.pagination;
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
    this.featureMap = {};
    this.initViewModel({ layerName: this.layerName, layerStyle: this.layerStyle });
    this._eventsInit();
  }

  initViewModel(options) {
    this.viewModel = new FeatureTableViewModel(options);
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
          this.featureMap[index] = feature;
        }
        properties.key = index;
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
    this.paginationOptions.current = pageNumber;
    // @ts-ignore
    let tableWrap = this.$refs.tableInstance.$el;
    if (tableWrap && tableWrap.scrollHeight > tableWrap.clientHeight) {
      tableWrap.scrollTop = 0;
      this.handleScrollSelectedFeature(featureIndex, tableWrap);
    }
  }
  handleScrollSelectedFeature(featureIndex, tableWrap) {
    const rowHeight = document.querySelector('.sm-component-feature-table .sm-component-table-row').clientHeight;
    const selectFeatureScrollTop = (featureIndex + 1) * rowHeight;
    if (selectFeatureScrollTop > tableWrap.clientHeight) {
      tableWrap.scrollTop = selectFeatureScrollTop;
    }
  }
  handleColumns(headers) {
    let columns = [];

    Object.keys(headers).forEach(propertyName => {
      if (propertyName === 'index') {
        return;
      }
      const columnConfig = {
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
          Object.assign(columnConfig, copyConfig);
        }
      }

      columns.push(columnConfig);
    });
    this.columns = columns;
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
    if (!this.associateWithMap.enabled) {
      return;
    }
    let highLightList = this.handleCoords(this.selectedRowKeys);
    this.viewModel && this.viewModel.zoomToFeatures(highLightList, this.associateWithMap);
  }
  clearSelectedRowKeys() {
    this.selectedRowKeys = [];
  }
  handleChange(pagination, filters, sorter, { currentDataSource }) {
    this.paginationOptions.current = pagination.current;
    this.$emit('change', pagination, filters, sorter, { currentDataSource });
  }
  _eventsInit() {
    const { enabled } = this.associateWithMap;
    this.viewModel.on('mapLoaded', map => {
      this._initFeatures();
      if (enabled) {
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
      const features = this.viewModel._initFeatures(this.layerName);
      this.tableData = this.handleFeatures(features);
    }
  }

  loaded() {}
  removed() {
    this.viewModel.off('mapLoaded');
    this.viewModel.off('changeSelectLayer');
    this.viewModel = null;
  }
  beforeDestory() {
    this.$options.removed.call(this);
  }
}

export default SmFeatureTable;
</script>
