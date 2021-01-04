<template>
  <div class="sm-component-text-list" :style="getBackgroundStyle" @mouseleave="handleMouseLeaveFn({}, null, $event)">
    <div
      v-if="headerStyleData.show"
      class="sm-component-text-list__header"
      :style="[listStyle.headerHeight, { background: headerStyleData.background, color: headerStyleData.color }]"
    >
      <div class="sm-component-text-list__header-content">
        <template v-if="animateContent && animateContent.length > 0">
          <template
            v-for="(item, index) in (getColumns && getColumns.length > 0 && getColumns) ||
              Object.keys(animateContent[0])"
          >
            <div
              :key="index"
              class="sm-component-text-list__header-title"
              :style="[fontSizeStyle, { flex: getColumnWidth(index) }]"
              :title="item.header"
            >
              <div
                @click="
                  sortByField(
                    getColumns[index].field + '-' + index,
                    index,
                    !Number.isNaN(+listData[0][getColumns[index].field + '-' + index]) && getColumns[index].sort
                  )
                "
              >
                {{ getColumns[index].header }}
                <div
                  v-if="!Number.isNaN(+listData[0][getColumns[index].field + '-' + index]) && getColumns[index].sort"
                  class="arrow-wrap"
                  :style="{ borderColor: headerStyleData.sortBtnColor }"
                >
                  <i
                    :class="['up-triangle']"
                    :style="[
                      { borderBottomColor: headerStyleData.sortBtnColor },
                      sortType === 'ascend' &&
                        sortIndex === index && { borderBottomColor: headerStyleData.sortBtnSelectColor }
                    ]"
                  ></i>
                  <i
                    :class="['down-triangle']"
                    :style="[
                      { borderTopColor: headerStyleData.sortBtnColor },
                      sortType === 'descend' &&
                        sortIndex === index && { borderTopColor: headerStyleData.sortBtnSelectColor }
                    ]"
                  ></i>
                </div>
              </div>
            </div>
          </template>
        </template>
      </div>
    </div>
    <div
      ref="animate"
      class="sm-component-text-list__animate"
      :style="[
        listStyle.contentHeight,
        getTextColorStyle,
        fontSizeStyle,
        { 'overflow-y': autoRolling ? 'hidden' : 'auto' }
      ]"
    >
      <div
        ref="listContent"
        :class="['sm-component-text-list__body-content', animate && 'sm-component-text-list__body-content--anim']"
      >
        <template v-if="animateContent && animateContent.length > 0">
          <div
            v-for="(rowData, index) in animateContent"
            :key="index"
            class="sm-component-text-list__list"
            :style="getRowStyle(rowData['idx'], index)"
            :data-index="rowData['idx']"
            @click="handleClick(rowData, rowData['idx'], $event)"
            @mouseenter="handleMouseEnterFn(rowData, rowData['idx'], $event)"
            @mouseleave="handleMouseLeaveFn(rowData, rowData['idx'], $event)"
          >
            <div
              v-for="(items, key, itemIndex) in filterProperty(rowData, 'idx')"
              :key="key"
              :title="items"
              :style="[listStyle.rowStyle, { flex: getColumnWidth(itemIndex) }, getCellStyle(items, itemIndex)]"
            >
              <span v-if="getColumns[itemIndex]">{{ getColumns[itemIndex].fixInfo.prefix }}</span>
              {{ items }}
              <span v-if="getColumns[itemIndex]">{{ getColumns[itemIndex].fixInfo.suffix }}</span>
            </div>
          </div>
        </template>
      </div>
    </div>
    <sm-spin v-if="spinning" size="large" :tip="$t('info.loading')" :spinning="spinning" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Mixins } from 'vue-property-decorator';
import { addListener, removeListener } from 'resize-detector';
import debounce from 'lodash/debounce';
import getFeatures from '../../common/_utils/get-features';
import Theme from '../../common/_mixin/Theme';
import Timer from '../../common/_mixin/Timer';
import { getColorWithOpacity } from '../../common/_utils/util';
import merge from 'lodash.merge';
import clonedeep from 'lodash.clonedeep';
import SmSpin from '../../common/spin/Spin.vue';

interface HeaderStyleParams {
  show?: boolean;
  height?: number;
  background?: string;
  color?: string;
}

interface RowStyleParams {
  height: number;
  oddStyle?: {
    background?: string;
  };
  evenStyle?: {
    background?: string;
  };
}

interface StyleRangeParams {
  min: number;
  max: number;
  color: string;
}

interface CellStyleRangeGroupParams {
  type: 'background' | 'color';
  data: StyleRangeParams[];
}

interface ColumnParams {
  header: string;
  field: string;
  width: number;
  sort: true | false | undefined;
  defaultSortType: 'ascend' | 'descend' | 'none';
  fixInfo: Object;
}

@Component({
  name: 'SmTextList',
  components: {
    SmSpin
  }
})
class SmTextList extends Mixins(Theme, Timer) {
  animate: Boolean = false;

  spinning: Boolean = false;

  listData: Array<Object>;

  animateContent: Array<Object> = [];

  startInter: any;

  containerHeight: number = 0;

  containerWidth: number = 0;

  resizeHandler: Function;

  listStyle: any = {};

  featuresData: any;

  headerStyleData: HeaderStyleParams;

  rowStyleData: RowStyleParams;

  sortType: string = 'descend';

  sortTypeList: Array<string> = ['ascend', 'descend', 'none'];

  sortTypeIndex: number = 0;

  sortField: string = '';

  sortIndex: number;

  handleMouseEnterFn: Function;

  handleMouseLeaveFn: Function;

  activeHoverRowIndex: number = null;

  activeClickRowIndex: Array<number> = [];

  eventTriggerColorList: any = {
    clickColor: null
  };

  rowHoverColor: string = 'rgba(128, 128,128, 0.8 )';

  curRollingStartIndex: number = 0;

  @Prop() content: any; // 显示内容（JSON），dataset 二选一

  @Prop() dataset: any;

  @Prop({ default: () => [] }) header: Array<string>; // 表头

  @Prop({ default: 6 }) rows: number; // 显示行数

  @Prop({ default: false }) autoRolling: Boolean; // 是否逐条滚动

  @Prop() fontSize: number | string;

  @Prop({ default: true }) autoResize: Boolean; // 是否自适应大小

  @Prop({ default: () => [] }) fields: Array<string>; // 显示的字段名

  @Prop({ default: () => [] }) columnWidths: Array<number>; // 列宽

  @Prop() rowStyle: RowStyleParams;

  @Prop({ default: () => ({ show: true }) }) headerStyle: HeaderStyleParams; // 表头样式

  @Prop() thresholdsStyle: CellStyleRangeGroupParams[];

  @Prop() columns: Array<ColumnParams>;

  @Prop({
    default: () => {
      return [];
    }
  })
  highlightOptions: Array<number>;

  @Prop({ default: true }) highlightCurrentRow: Boolean;

  @Prop({ default: '#b9b9b9' }) highlightColor: String | Function;

  @Watch('content')
  contentChanged(newVal, oldVal) {
    this.listData = this.handleContent(this.content);
    this.getListHeightStyle();
  }

  @Watch('dataset', { deep: true })
  datasetChanged(newVal, oldVal) {
    if (this.dataset && (this.dataset.url || this.dataset.geoJSON)) {
      this.getFeaturesFromDataset();
    } else {
      this.featuresData = [];
      this.listData = [];
      this.animateContent = [];
      clearInterval(this.startInter);
    }
  }

  @Watch('columns')
  columnsChanged(newVal, oldVal) {
    if (this.content || this.featuresData) {
      this.listData = this.content ? this.handleContent(this.content) : this.handleFeatures(this.featuresData);
      this.getListHeightStyle();
      this.setDefaultSortType();
    }
  }

  @Watch('autoRolling', { immediate: true })
  autoRollingChanged() {
    if (!this.listData) {
      this.listData = [];
    }
    if (this.autoRolling) {
      if (this.listData.length > 2) {
        this.itemByItem();
      }
    } else {
      clearInterval(this.startInter);
    }
    this.getListHeightStyle();
    this.reset();
  }

  @Watch('rows')
  rowsChanged() {
    this.getListHeightStyle();
  }

  @Watch('rowStyle')
  rowStyleChanged(next, before) {
    this.rowStyleData = Object.assign({}, this.rowStyleData, next);
    this.getListHeightStyle();
  }

  @Watch('headerStyle')
  headerHeightChanged(next, before) {
    this.headerStyleData = Object.assign({}, this.headerStyleData, next);
    this.getListHeightStyle();
  }

  @Watch('containerHeight')
  containerHeightChanged(newVal, oldVal) {
    if (newVal !== oldVal) {
      clearInterval(this.startInter);
      this.getListHeightStyle();
    }
  }

  @Watch('sortType')
  sortTypeChanged(newVal, oldVal) {
    let rawContent = this.content ? this.handleContent(this.content) : this.handleFeatures(this.featuresData);
    this.listData = this.sortContent(rawContent);
    this.getListHeightStyle();
  }

  @Watch('sortField')
  sortFieldChanged(newVal, oldVal) {
    let rawContent = this.content ? this.handleContent(this.content) : this.handleFeatures(this.featuresData);
    this.listData = this.sortContent(rawContent);
    this.getListHeightStyle();
  }

  @Watch('highlightColor', { immediate: true })
  highlightColorChanged(newVal, oldVal) {
    if (newVal && typeof newVal === 'string') {
      Object.keys(this.eventTriggerColorList).forEach(colorType => {
        this.eventTriggerColorList[colorType] = newVal;
      });
    }
  }
  // 切换自动滚动与排序时重置。。。
  @Watch('highlightOptions', { immediate: true, deep: true })
  highlightOptionsChanged(newVal, oldVal) {
    let bounds = this.rowsIndexViewBounds();
    let autoBounds = this.getAutoRollingIndexBounds;
    if (!this.autoRolling && newVal && newVal.length && !this.clamp(newVal[0], bounds[0], bounds[1])) {
      // @ts-ignore
      this.$refs.animate &&
        // @ts-ignore
        (this.$refs.animate.scrollTop = newVal[0] * this.filterUnit(this.listStyle.rowStyle.height));
      // @ts-ignore
    } else if (this.autoRolling) {
      if (!this.clamp(newVal[0], autoBounds[0], autoBounds[1])) {
        let splitIndex;
        if (newVal[0] <= this.rows) {
          this.reset();
        } else {
          splitIndex = newVal[0] - this.rows;
          this.$nextTick(() => {
            this.animateContent = [];
            this.$nextTick(() => {
              let copyListData = clonedeep(this.listData);
              let tempArr = copyListData.splice(0, splitIndex + 1);
              copyListData = [...copyListData, ...tempArr];
              this.animateContent = copyListData;
            });
          });
        }
      }
    }
    this.setCurrentRow(newVal);
  }

  get getAutoRollingIndexBounds() {
    return [this.curRollingStartIndex + 1, this.curRollingStartIndex + 1 + this.rows];
  }

  get getRowStyle() {
    return function(index, rawIndex) {
      if (this.highlightCurrentRow) {
        if (this.activeClickRowIndex && this.activeClickRowIndex.includes(index)) {
          return {
            background: this.eventTriggerColorList.clickColor
          };
        }
      }
      if (this.activeHoverRowIndex === index) {
        return {
          background: this.rowHoverColor
        };
      }
      if ((rawIndex + 1) % 2 !== 0) {
        return {
          background: this.rowStyleData.oddStyle.background
        };
      } else {
        return {
          background: this.rowStyleData.evenStyle.background
        };
      }
    };
  }

  get getCellStyle() {
    return function(value, columnIndex) {
      if (isNaN(+value) || !this.thresholdsStyle || !this.thresholdsStyle[columnIndex]) {
        return {};
      }
      const rangeGroup = this.thresholdsStyle[columnIndex];
      let colorRangeInfo = rangeGroup.data.map(item => ({ ...item }));
      const matchColorRange = colorRangeInfo.find(item => {
        let status;
        if (item.min) {
          status = +value >= +item.min;
        }
        if (item.max) {
          status = status === void 0 ? true : status;
          status = status && +value <= +item.max;
        }
        return status;
      });
      if (matchColorRange) {
        return { [rangeGroup.type]: matchColorRange.color };
      }
      return {};
    };
  }

  get fontSizeStyle() {
    return {
      fontSize: typeof this.fontSize === 'string' ? this.fontSize : this.fontSize * 1.1 + 'px'
    };
  }

  get getColumnWidth() {
    return function(index) {
      if (this.getColumns && this.getColumns.length > 0 && index < this.getColumns.length) {
        const width = this.getColumns[index].width;
        return width ? `0 0 ${(width / 100) * this.containerWidth}px` : 1;
      }
      return 1;
    };
  }

  get getColumns() {
    if (Array.isArray(this.columns)) {
      return this.columns;
    } else {
      return this.fields.map((field, index) => {
        return {
          header: this.header[index],
          field: this.fields[index],
          width: this.columnWidths[index],
          fixInfo: { prefix: '', suffix: '' },
          sort: true,
          defaultSortType: 'none'
        };
      });
    }
  }

  get filterProperty() {
    return (rowData, propertyName) => {
      let copyRowData = { ...rowData };
      delete copyRowData[propertyName];
      return copyRowData;
    };
  }

  created() {
    this.headerStyleData = merge(
      { show: true, background: this.getColor(0), color: this.textColorsData },
      this.headerStyle
    );
    this.rowStyleData = merge(
      {
        oddStyle: { background: getColorWithOpacity(this.getBackground, 0.4) },
        evenStyle: { background: getColorWithOpacity(this.getColor(0), 0.4) }
      },
      this.rowStyle
    );
    this.handleMouseEnterFn = debounce(this.handleMouseEnter, 20, { leading: true });
    this.handleMouseLeaveFn = debounce(this.handleMouseLeave, 20, { leading: true });
  }

  mounted() {
    this.setListData();
    this.setDefaultSortType();
    // resize 监听
    if (this.autoResize) {
      this.resizeHandler = debounce(
        () => {
          if (this.$el) {
            // @ts-ignore
            this.containerHeight = this.$el.offsetHeight;
            // @ts-ignore
            this.containerWidth = this.$el.offsetWidth;
          }
        },
        500,
        { leading: true }
      );
      // @ts-ignore
      addListener(this.$el, this.resizeHandler);
    }

    // 等待元素渲染好 获取高度 计算 list 高度
    setTimeout(() => {
      // @ts-ignore
      this.containerHeight = this.$el.offsetHeight;
      // @ts-ignore
      this.containerWidth = this.$el.offsetWidth;
    }, 0);

    this.$on('theme-style-changed', this.handleThemeStyleChanged);
  }

  handleThemeStyleChanged() {
    this.headerStyleData = merge(this.headerStyleData, {
      background: this.getColor(0),
      color: this.textColorsData
    });
    this.rowStyleData = merge(this.rowStyleData, {
      oddStyle: {
        background: getColorWithOpacity(this.getBackground, 0.4)
      },
      evenStyle: {
        background: getColorWithOpacity(this.getColor(0), 0.4)
      }
    });
  }

  setListData() {
    if (this.content && this.content.length > 0) {
      this.listData = this.handleContent(this.content);
    } else if (this.dataset && (this.dataset.url || this.dataset.geoJSON)) {
      this.getFeaturesFromDataset();
    }
  }

  timing() {
    if (this.dataset && this.dataset.url) {
      this.getFeaturesFromDataset(false);
    }
  }

  getFeaturesFromDataset(initLoading = true) {
    // 如果是geojson就不加loading
    let { url, geoJSON } = this.dataset;
    url && initLoading && (this.spinning = true);
    // 有url或geojson ,dataset才发请求
    if (url || geoJSON) {
      let dataset = clonedeep(this.dataset);
      getFeatures(dataset).then(data => {
        this.dataset.url && initLoading && (this.spinning = false);
        this.featuresData = data;
        // 对定时刷新数据 按当前选择排序
        this.listData = this.sortContent(this.handleFeatures(data));
        this.getListHeightStyle();
      });
    }
  }

  getListHeightStyle() {
    this.animateContent = this.listData && this.listData.concat();
    if (!this.containerHeight || !this.listData) {
      return;
    }
    let height = this.containerHeight;
    const headerHeightNum = this.headerStyleData.show ? this.headerStyleData.height || height * 0.15 : 0;
    let headerHeight = { height: `${headerHeightNum}px` };
    const contentHeightNum = height - headerHeightNum;
    let contentHeight = { height: `${contentHeightNum}px` };
    let rowHeight = this.rowStyleData.height;
    if (!rowHeight) {
      if (this.listData.length < this.rows) {
        rowHeight = contentHeightNum / (this.listData.length - 1);
      } else {
        rowHeight = contentHeightNum / this.rows;
      }
    }
    let rowStyle = { height: `${rowHeight}px`, lineHeight: `${rowHeight}px` };

    if (this.autoRolling) {
      if (this.listData.length > 2) {
        this.itemByItem();
      }
    } else {
      clearInterval(this.startInter);
    }
    this.listStyle = { headerHeight, contentHeight, rowStyle };
  }

  handleContent(content) {
    if (content) {
      let listData = [];
      content.forEach((data, index) => {
        let obj = {};
        this.getColumns &&
          this.getColumns.forEach((column, index) => {
            obj[`${column.field}-${index}`] = data[column.field] || '-';
          });
        obj['idx'] = index;
        JSON.stringify(obj) !== '{}' && listData.push(obj);
      });
      return listData;
    } else {
      return content;
    }
  }

  handleFeatures(data) {
    let features = data && data.features;
    let content = [];
    features &&
      features.forEach((feature, index) => {
        let properties = feature.properties;
        if (!properties) {
          return;
        }
        let contentObj = {};
        if (this.getColumns) {
          this.getColumns.forEach((column, index) => {
            contentObj[`${column.field}-${index}`] = properties[column.field] || '-';
          });
          contentObj['idx'] = index;
        } else {
          contentObj = properties;
        }
        JSON.stringify(contentObj) !== '{}' && content.push(contentObj);
      });

    return content;
  }
  itemByItem() {
    clearInterval(this.startInter);
    this.startInter = setInterval(() => {
      let wrapper = this.$refs.listContent;
      wrapper && wrapper['style'] && (wrapper['style'].marginTop = `-${this.listStyle.rowStyle.height}`);
      this.animate = !this.animate;
      setTimeout(() => {
        let first =
          this.$refs.listContent && this.$refs.listContent['children'] && this.$refs.listContent['children'][0];
        if (first) {
          this.curRollingStartIndex = +first.dataset.index;
        }
        // @ts-ignore
        first && this.$refs.listContent.appendChild(first);
        wrapper && wrapper['style'] && (wrapper['style'].marginTop = '0px'); // 保持滚动距离初始值一直为 0
        this.animate = !this.animate;
      }, 500);
    }, 2000);
  }

  sortByField(fieldName, index, isSortField) {
    if (!isSortField) {
      return;
    }
    this.sortField = fieldName;
    this.sortIndex = index;
    this.sortTypeIndex++;
    if (this.sortTypeIndex > this.sortTypeList.length - 1) {
      this.sortTypeIndex = 0;
    }
    this.sortType = this.sortTypeList[this.sortTypeIndex];
    this.reset();
  }

  sortContent(content) {
    if (!content) {
      return null;
    }
    let sortContent = [];
    // 没有排序类型 或者 排序字段不存在
    if (this.sortType === 'none' || !this.sortField || content.length <= 1) {
      sortContent = content;
    } else {
      sortContent = clonedeep(content);
      if (this.sortType === 'descend') {
        sortContent.sort((a, b) => {
          return b[this.sortField] - a[this.sortField];
        });
      } else if (this.sortType === 'ascend') {
        sortContent.sort((a, b) => {
          return a[this.sortField] - b[this.sortField];
        });
      }
    }
    return sortContent;
  }

  setDefaultSortType() {
    let fieldIndex = 0;
    let column =
      this.columns &&
      this.columns.find((column, index) => {
        if (['ascend', 'descend'].includes(column.defaultSortType) && column.sort) {
          fieldIndex = index;
          return true;
        }
        return false;
      });
    if (column) {
      this.sortType = column.defaultSortType;
      let index = this.sortTypeList.findIndex(item => {
        return item === column.defaultSortType;
      });
      this.sortTypeIndex = index;
      this.sortField = `${column.field}-${fieldIndex}`;
      this.sortIndex = fieldIndex;
      return;
    }
    this.sortField = '';
    this.sortType = 'none';
  }

  handleClick(item, rowIndex, event) {
    if (this.highlightColor && typeof this.highlightColor === 'function') {
      this.eventTriggerColorList.clickColor = this.highlightColor(item, rowIndex, event);
    }
    this.$emit('row-click', item, rowIndex, event);
    this.$emit('cell-click', item, rowIndex, event);
  }

  handleMouseEnter(item, rowIndex, event) {
    this.activeHoverRowIndex = rowIndex;
    if (this.highlightColor && typeof this.highlightColor === 'function') {
      this.rowHoverColor = this.highlightColor(item, rowIndex, event);
    }
    this.$emit('cell-mouse-enter', item, rowIndex, event);
  }

  handleMouseLeave(item, rowIndex, event) {
    this.activeHoverRowIndex = null;
    this.$emit('cell-mouse-leave', item, rowIndex, event);
  }

  setCurrentRow(rowIndexList) {
    if (rowIndexList && rowIndexList.length) {
      this.activeClickRowIndex = rowIndexList;
    } else {
      this.activeClickRowIndex = null;
    }
  }

  filterUnit(str) {
    return str.match(/[\d\D]+(?=px)/gim)[0];
  }

  reset() {
    this.$nextTick(() => {
      this.animateContent = [];
      this.$nextTick(() => {
        this.animateContent = [...this.listData];
        // @ts-ignore
        this.$refs.animate && (this.$refs.animate.scrollTop = 0);
      });
    });
  }

  rowsIndexViewBounds() {
    if (this.$refs.animate && this.rows) {
      // @ts-ignore
      let beginIndex = Math.ceil(this.$refs.animate.scrollTop / this.filterUnit(this.listStyle.rowStyle.height));
      let endIndex = beginIndex + this.rows;
      return [beginIndex, endIndex];
    }
    return [];
  }

  clamp(num, min, max) {
    if ((min || min === 0) && (max || max === 0) && num > min && num < max) {
      return true;
    }
    return false;
  }

  destory(): void {
    if (this.autoResize) {
      clearInterval(this.startInter);
      // @ts-ignore
      removeListener(this.$el, this.resizeHandler);
    }
  }
}
export default SmTextList;
</script>
