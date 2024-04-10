<template>
  <sm-collapse-card
    v-show="isShow"
    :icon-class="mode === 'simple' ? '' : iconClass"
    :icon-position="position"
    :header-name="mode === 'simple' ? '' : headerName"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :background="background"
    :textColor="textColor"
    :split-line="splitLine"
    class="sm-component-legend"
  >
    <sm-card :bordered="false" :style="mode !== 'simple' && collapseCardBackgroundStyle">
      <template v-if="Object.keys(legendList).length > 0">
      <sm-collapse
        v-if="mode === 'panel'"
        v-model="activeLegend"
        class="sm-component-legend__table"
      >
        <sm-collapse-panel
          v-for="(layerStyles, layerName) in legendList"
          :key="layerName"
          :disabled="!isShowTitle"
          :showArrow="false"
          :class="[isShowTitle ? '' : 'sm-component-legend__panel']"
        >
          <template slot="header">
            <div v-if="isShowTitle" class="header-wrap" :style="headingTextColorStyle">
              <div class="sm-component-legend__title add-ellipsis">{{ layerName }}</div>
              <i
                :class="
                  activeLegend.includes(layerName)
                    ? 'sm-components-icon-solid-triangle-down'
                    : 'sm-components-icon-solid-triangle-right'
                "
              />
            </div>
          </template>
          <template v-for="(style, index) in layerStyles">
            <StyleField
              v-if="isShowField"
              :key="`field_${index}`"
              :theme-field="style.themeField"
              :style-field="style.styleField"
            />
            <div :key="`style_${index}`" class="sm-component-legend__wrap">
              <StyleItem
                v-for="(item, j) in style.styleGroup"
                :key="`style_${index}_${j}`"
                :style-data="item"
              />
            </div>
          </template>
        </sm-collapse-panel>
      </sm-collapse>
      <div
        v-for="(layerStyles, layerName) in legendList"
        v-else
        :key="layerName"
        class="sm-component-legend__noBorder"
      >
        <div v-if="isShowTitle" class="sm-component-legend__title add-ellipsis" :style="headingTextColorStyle">
          {{ layerName }}
        </div>
        <template v-for="(style, index) in layerStyles">
          <StyleField v-if="isShowField" :key="`field_${index}`" :theme-field="style.themeField" :style-field="style.styleField" />
          <div :key="`style_${index}`" class="sm-component-legend__wrap">
            <StyleItem v-for="(item, j) in style.styleGroup" :key="`style_${index}_${j}`" :style-data="item" />
          </div>
        </template>
      </div>
      </template>
    </sm-card>
  </sm-collapse-card>
</template>

<script>
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import Control from 'vue-iclient/src/mapboxgl/_mixin/control';
import MapGetter from 'vue-iclient/src/mapboxgl/_mixin/map-getter';
import BaseCard from 'vue-iclient/src/common/_mixin/Card';
import SmCard from 'vue-iclient/src/common/card/Card.vue';
import SmCollapse from 'vue-iclient/src/common/collapse/Collapse.vue';
import SmCollapsePanel from 'vue-iclient/src/common/collapse/Panel.vue';
import LegendViewModel from './LegendViewModel';
import StyleItem from './subs/StyleItem.vue';
import StyleField from './subs/StyleField.vue';

export default {
  name: 'SmLegend',
  components: {
    SmCard,
    SmCollapse,
    SmCollapsePanel,
    StyleItem,
    StyleField
  },
  mixins: [MapGetter, Control, Theme, BaseCard],
  props: {
    headerName: {
      type: String,
      default: function () {
        return this.$t('legend.title');
      }
    },
    iconClass: {
      type: String,
      default: 'sm-components-icon-list'
    },
    layerNames: {
      type: Array,
      required: true
    },
    isShowTitle: {
      type: Boolean,
      default: false
    },
    isShowField: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'simple',
      validator(mode) {
        return ['simple', 'panel'].includes(mode);
      }
    },
    position: {
      type: String,
      default: 'bottom-left'
    }
  },
  data() {
    return {
      legendList: {},
      // 控制第一个图例默认展开
      activeLegend: []
    };
  },
  watch: {
    layerNames: function () {
      this.initLegendList();
    }
  },
  methods: {
    initLegendList() {
      this.legendList = {};
      let defaultChoosenLayers = [];
      if (this.viewModel) {
        this.legendList = this.layerNames.reduce((list, name) => {
          const styles = this.viewModel.getStyle(name);
          if (styles) {
            list[name] = styles;
            !defaultChoosenLayers.length && defaultChoosenLayers.push(name);
          }
          return list;
        }, {});
        this.activeLegend = this.isShowTitle ? defaultChoosenLayers : Object.keys(this.legendList);
      }
    }
  },
  loaded() {
    this.viewModel = new LegendViewModel(this.webmap);
    this.initLegendList();
  },
  removed() {
    this.legendList = {};
  }
};
</script>
