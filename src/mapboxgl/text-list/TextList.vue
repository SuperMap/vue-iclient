<template>
  <div class="sm-component-text-list" :style="getBackgroundStyle">
    <div
      v-if="headerStyleData.show"
      class="sm-component-text-list__header"
      :style="[listStyle.headerHeight, { background: headerStyleData.background, color: headerStyleData.color }]"
    >
      <div class="sm-component-text-list__header-content">
        <template v-if="animateContent && animateContent.length > 0">
          <template v-for="(item, index) in (header && header.length > 0 && header) || Object.keys(animateContent[0])">
            <div :key="index" :style="[fontSizeStyle, { flex: getColumnWidth(index) }]" :title="item">{{ item }}</div>
          </template>
        </template>
      </div>
    </div>
    <div class="sm-component-text-list__animate" :style="[listStyle.contentHeight, getTextColorStyle, fontSizeStyle]">
      <div
        ref="listContent"
        :class="['sm-component-text-list__body-content', animate && 'sm-component-text-list__body-content--anim']"
      >
        <template v-if="animateContent && animateContent.length > 0">
          <div
            v-for="(item, index) in animateContent"
            :key="index"
            class="sm-component-text-list__list"
            :style="getRowStyle(index)"
          >
            <div
              v-for="(items, index2, itemIndex) in item"
              :key="index2"
              :style="[listStyle.rowStyle, { flex: getColumnWidth(itemIndex) }, getCellStyle(items, itemIndex)]"
            >
              {{ items }}
            </div>
          </div>
        </template>
      </div>
    </div>
    <a-spin v-if="spinning" size="large" :tip="$t('info.loading')" :spinning="spinning" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Mixins } from 'vue-property-decorator';
import { addListener, removeListener } from 'resize-detector';
import debounce from 'lodash/debounce';
import getFeatures from '../../common/_utils/get-features';
import Theme from '../../common/_mixin/theme';
import Timer from '../../common/_mixin/timer';
import { getColorWithOpacity } from '../../common/_utils/util';
import isEqual from 'lodash.isequal';
import merge from 'lodash.merge';

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
  compare: string;
  value: number;
  color: string;
}

interface CellStyleRangeGroupParams {
  type: 'background' | 'color';
  data: StyleRangeParams[];
}

@Component({
  name: 'SmTextList'
})
class SmTextList extends Mixins(Theme, Timer) {
  animate: Boolean = false;

  spinning: Boolean = false;

  listData: Array<Object> = [];

  animateContent: Array<Object> = [];

  startInter: any;

  containerHeight: number = 0;

  containerWidth: number = 0;

  resizeHandler: Function;

  listStyle: any = {};

  featuresData: any = {};

  headerStyleData: HeaderStyleParams;

  rowStyleData: RowStyleParams;

  @Prop() content: any; // 显示内容（JSON），dataset 二选一

  @Prop() dataset: any;

  @Prop() header: Array<string>; // 表头

  @Prop({ default: 6 }) rows: number; // 显示行数

  @Prop({ default: false }) autoRolling: Boolean; // 是否逐条滚动

  @Prop() fontSize: number | string;

  @Prop({ default: true }) autoResize: Boolean; // 是否自适应大小

  @Prop() fields: Array<string>; // 显示的字段名

  @Prop() columnWidths: Array<number>; // 列宽

  @Prop() rowStyle: RowStyleParams;

  @Prop({ default: () => ({ show: true }) }) headerStyle: HeaderStyleParams; // 表头样式

  @Prop() cellStyleRangeGroup: CellStyleRangeGroupParams[];

  @Watch('content')
  contentChanged(newVal, oldVal) {
    if (!isEqual(newVal, oldVal)) {
      this.listData = this.content;
      this.getListHeightStyle();
    }
  }

  @Watch('dataset')
  datasetChanged(newVal, oldVal) {
    if (!isEqual(newVal, oldVal)) {
      if (this.dataset && (this.dataset.url || this.dataset.geoJSON)) {
        this.getFeaturesFromDataset();
      } else {
        // this.featuresData = [];
        // this.listData = [];
        // this.animateContent = [];
        clearInterval(this.startInter);
      }
    }
  }

  @Watch('fields')
  fieldsChanged(newVal, oldVal) {
    if (!isEqual(newVal, oldVal) && this.listData) {
      this.listData = this.content ? this.handleContent(this.content) : this.handleFeatures(this.featuresData);
      this.getListHeightStyle();
    }
  }

  @Watch('autoRolling')
  autoRollingChanged() {
    this.animateContent = this.listData && this.listData.concat();
    if (this.autoRolling) {
      if (this.listData.length > 2) {
        this.itemByItem();
      }
    } else {
      clearInterval(this.startInter);
    }
  }

  @Watch('rows')
  rowsChanged() {
    this.getListHeightStyle();
  }

  @Watch('rowStyle')
  rowStyleChanged(next) {
    this.rowStyleData = Object.assign({}, this.rowStyleData, next);
    this.getListHeightStyle();
  }

  @Watch('headerStyle')
  headerHeightChanged(next) {
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

  get getRowStyle() {
    return function(index) {
      if ((index + 1) % 2 !== 0) {
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
      if (isNaN(+value) || !this.cellStyleRangeGroup || !this.cellStyleRangeGroup[columnIndex]) {
        return {};
      }
      const rangeGroup = this.cellStyleRangeGroup[columnIndex];
      let colorRangeInfo = rangeGroup.data.map(item => ({ ...item }));
      colorRangeInfo.sort((a: StyleRangeParams, b: StyleRangeParams) => {
        return a.value - b.value;
      });
      const matchColorRange = colorRangeInfo.find(
        /* eslint-disable no-new-func */
        item => !isNaN(item.value) && new Function(`return ${+value} ${item.compare} ${+item.value}`)()
      );
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
      if (this.columnWidths && this.columnWidths.length > 0) {
        const width = this.columnWidths[index];
        return width ? `0 0 ${(width / 100) * this.containerWidth}px` : 1;
      }
      return 1;
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
  }

  mounted() {
    this.setListData();

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
      getFeatures(this.dataset).then(data => {
        this.dataset.url && initLoading && (this.spinning = false);
        this.featuresData = data;
        this.listData = this.handleFeatures(data);
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
        rowHeight = contentHeightNum / this.listData.length;
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
    if (this.fields) {
      let listData = [];
      content.forEach(data => {
        let obj = {};
        this.fields.forEach(field => {
          obj[field] = data[field] || '-';
        });
        JSON.stringify(obj) !== '{}' && listData.push(obj);
      });
      return listData;
    } else {
      return content;
    }
  }

  handleFeatures(data) {
    let { features } = data;
    let content = [];
    features &&
      features.forEach(feature => {
        let properties = feature.properties;
        if (!properties) {
          return;
        }
        let contentObj = {};
        if (this.fields) {
          this.fields.forEach((field, index) => {
            contentObj[`${field}-${index}`] = properties[field] || '-';
          });
        } else {
          contentObj = properties;
        }
        JSON.stringify(contentObj) !== '{}' && content.push(contentObj);
      });

    return content;
  }

  itemByItem() {
    clearInterval(this.startInter);
    this.animateContent = this.animateContent.concat(this.animateContent);
    this.startInter = setInterval(() => {
      let wrapper = this.$refs.listContent;
      wrapper && wrapper['style'] && (wrapper['style'].marginTop = `-${this.listStyle.rowStyle.height}`);
      this.animate = !this.animate;
      setTimeout(() => {
        let first =
          this.$refs.listContent && this.$refs.listContent['children'] && this.$refs.listContent['children'][0];
        // @ts-ignore
        first && this.$refs.listContent.appendChild(first);
        wrapper && wrapper['style'] && (wrapper['style'].marginTop = '0px'); // 保持滚动距离初始值一直为 0
        this.animate = !this.animate;
      }, 500);
    }, 2000);
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
