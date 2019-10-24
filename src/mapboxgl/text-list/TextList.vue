<template>
  <div class="sm-component-text-list">
    <div
      class="sm-component-text-list__header"
      :style="[listStyle.headerHeight,{background: getColor(0)},getTextColorStyle]"
    >
      <div class="sm-component-text-list__header-content">
        <template v-if="animateContent && animateContent.length>0">
          <template
            v-for="(item,index) in ((header && header.length>0 && header) || Object.keys(animateContent[0]))"
          >
            <div
              :key="index"
              :style="[listStyle.headerLineHeight, fontSizeStyle]"
              :title="item"
            >{{ item }}</div>
          </template>
        </template>
      </div>
    </div>
    <div
      class="sm-component-text-list__animate"
      :style="[listStyle.contentHeight, getTextColorStyle, fontSizeStyle, getColorStyle]"
    >
      <div
        ref="listContent"
        :class="['sm-component-text-list__body-content',animate && 'sm-component-text-list__body-content--anim']"
      >
        <template v-if="animateContent && animateContent.length>0">
          <div
            v-for="(item,index) in animateContent"
            :key="index"
            class="sm-component-text-list__list"
            :style="[listStyle.rowStyle, getRowStyle(index)]"
          >
            <div
              v-for="(items,index2) in item"
              :key="index2"
              :style="listStyle.rowHeight"
            >{{ items }}</div>
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
import getFeatures from '../../mapboxgl/_utils/get-features';
import Theme from '../../common/_mixin/theme';
import { getColorWithOpacity } from '../../common/_utils/util';
import isEqual from 'lodash.isequal';

@Component({
  name: 'SmTextList'
})
class SmTextList extends Mixins(Theme) {
  animate: Boolean = false;

  spinning: Boolean = false;

  listData: Array<Object> = [];

  animateContent: Array<Object> = [];

  startInter: any;

  containerHeight: number = 0;

  resizeHandler: Function;

  listStyle: any = {};

  featuresData: any = {};

  @Prop() content: any; // 显示内容（JSON），dataset 二选一

  @Prop() dataset: any;

  @Prop() header: Array<string>; // 表头

  @Prop({ default: 6 }) rows: number; // 显示行数

  @Prop({ default: false }) autoRolling: Boolean; // 是否逐条滚动

  @Prop() fontSize: number | string;

  @Prop({ default: true }) autoResize: Boolean; // 是否自适应大小

  @Prop() fields: Array<string>; // 显示的字段名

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
      if (this.dataset && this.dataset.url) {
        this.getFeaturesFromDataset();
      } else {
        this.featuresData = [];
        this.listData = [];
        this.animateContent = [];
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

  @Watch('containerHeight')
  containerHeightChanged(newVal, oldVal) {
    if (newVal !== oldVal) {
      clearInterval(this.startInter);
      this.getListHeightStyle();
    }
  }

  get getContentStyle() {
    return { background: getColorWithOpacity(this.getBackground, 0.6) };
  }

  get getRowStyle() {
    return function(index) {
      if (index % 2 !== 0) {
        return {
          background: getColorWithOpacity(this.getColor(0), 0.4)
        };
      } else {
        return {
          background: getColorWithOpacity(this.getBackground, 0.4)
        };
      }
    };
  }

  get fontSizeStyle() {
    return {
      fontSize: typeof this.fontSize === 'string' ? this.fontSize : this.fontSize * 1.1 + 'px'
    };
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
    }, 0);
  }

  setListData() {
    if (this.content && this.content.length > 0) {
      this.listData = this.handleContent(this.content);
    } else if (this.dataset && this.dataset.url) {
      this.getFeaturesFromDataset();
    }
  }

  getFeaturesFromDataset() {
    this.spinning = true;
    getFeatures(this.dataset).then(data => {
      this.spinning = false;
      this.featuresData = data;
      this.listData = this.handleFeatures(data);
      this.getListHeightStyle();
    });
  }

  getListHeightStyle() {
    this.animateContent = this.listData && this.listData.concat();
    if (!this.containerHeight || !this.listData) {
      return;
    }
    let height = this.containerHeight;
    let headerHeight = { height: height * 0.15 + 'px' };
    let headerLineHeight = { lineHeight: height * 0.15 + 'px' };
    let contentHeight = { height: height - height * 0.15 + 'px' };
    let rowHeight;
    if (this.listData.length < this.rows) {
      rowHeight = (height - height * 0.15) / this.listData.length;
    } else {
      rowHeight = (height - height * 0.15) / this.rows;
    }
    let rowStyle = { height: rowHeight + 'px' };
    rowHeight = { lineHeight: rowHeight + 'px' };

    if (this.autoRolling) {
      if (this.listData.length > 2) {
        this.itemByItem();
      }
    } else {
      clearInterval(this.startInter);
    }
    this.listStyle = { headerHeight, headerLineHeight, contentHeight, rowHeight, rowStyle };
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
            contentObj[field] = properties[field] || '-';
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
        wrapper['style'].marginTop = '0px'; // 保持滚动距离初始值一直为 0
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
