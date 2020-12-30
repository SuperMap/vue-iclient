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
      <sm-collapse
        v-if="(mode === 'panel' || (layerNames.length > 1 && mode !== 'simple')) && JSON.stringify(legendList) !== '{}'"
        v-model="activeLegend"
        class="sm-component-legend__table"
      >
        <sm-collapse-panel
          v-for="(layerValue, layerKey) in legendList"
          :key="layerKey"
          :disabled="!isShowTitle"
          :showArrow="false"
          :class="[isShowTitle ? '' : 'sm-component-legend__panel']"
        >
          <template slot="header">
            <div v-if="isShowTitle" class="header-wrap" :style="headingTextColorStyle">
              <div class="sm-component-legend__title add-ellipsis">{{ layerValue.layerId }}</div>
              <i
                :class="
                  activeLegend.includes(layerKey)
                    ? 'sm-components-icon-solid-triangle-down'
                    : 'sm-components-icon-solid-triangle-right'
                "
              />
            </div>
          </template>
          <div v-if="isShowField" class="sm-component-legend__themefield add-ellipsis" :style="secondaryTextColorStyle">
            {{ $t('legend.themeField') }}:{{ layerValue.themeField }}
          </div>
          <div v-if="layerValue.layerType === 'UNIQUE'" class="sm-component-legend__wrap">
            <div class="sm-component-legend__point">
              <div v-for="(item, j) in layerValue.styleGroup" :key="j" class="sm-component-legend__item">
                <div class="sm-component-legend__rank-icon">
                  <i :class="layerValue.featureType | selectLayerType(item.style)" :style="uniqueSymbolStyle(item)" />
                </div>
                <span class="add-ellipsis">
                  {{ item.value }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="layerValue.layerType === 'HEAT'" class="sm-component-legend__wrap">
            <div class="sm-component-legend__heatbox">
              <div class="sm-component-legend__heat">
                <i :style="{ background: `linear-gradient(to top,${layerValue.styleGroup.join(',')})` }" />
              </div>
              <div class="sm-component-legend__heatText">
                <span class="sm-component-legend__top">
                  <i class="sm-components-icon-solid-triangle-left" />
                  {{ $t('legend.top') }}
                </span>
                <span class="sm-component-legend__bottom">
                  <i class="sm-components-icon-solid-triangle-left" />
                  {{ $t('legend.bottom') }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="layerValue.layerType === 'RANGE'" class="sm-component-legend__wrap">
            <div class="sm-component-legend__range">
              <div v-for="(item, j) in layerValue.styleGroup" :key="j" class="sm-component-legend__range-item">
                <div>
                  <i :style="{ background: item.color }" />
                </div>
                <span class="add-ellipsis">
                  <i class="sm-components-icon-solid-triangle-left" />
                  {{ showRangeInfo(item, layerKey) }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="layerValue.layerType === 'RANK_SYMBOL'" class="sm-component-legend__wrap">
            <div class="sm-component-legend__rank">
              <div v-for="(item, j) in layerValue.styleGroup" :key="j" class="sm-component-legend__rank-item">
                <div class="sm-component-legend__rank-icon">
                  <i :class="item.style.className" :style="rankSymbolStyle(item)" />
                </div>
                <span class="add-ellipsis">
                  <i class="sm-components-icon-solid-triangle-left" />
                  {{ item.start }}-{{ item.end }}
                </span>
              </div>
            </div>
          </div>
        </sm-collapse-panel>
      </sm-collapse>
      <div
        v-for="(layerValue, layerKey, index) in legendList"
        v-else-if="mode === 'simple' || layerNames.length === 1"
        :key="index"
        class="sm-component-legend__noBorder"
      >
        <div v-if="isShowTitle" class="sm-component-legend__title add-ellipsis" :style="headingTextColorStyle">
          {{ layerValue.layerId }}
        </div>
        <div v-if="isShowField" class="sm-component-legend__themefield add-ellipsis" :style="secondaryTextColorStyle">
          {{ $t('legend.themeField') }}:{{ layerValue.themeField }}
        </div>
        <div v-if="layerValue.layerType === 'UNIQUE'" class="sm-component-legend__wrap">
          <div class="sm-component-legend__point">
            <div v-for="(item, j) in layerValue.styleGroup" :key="j" class="sm-component-legend__item">
              <div class="sm-component-legend__rank-icon">
                <i :class="layerValue.featureType | selectLayerType(item.style)" :style="uniqueSymbolStyle(item)" />
              </div>
              <span class="add-ellipsis">
                {{ item.value }}
              </span>
            </div>
          </div>
        </div>
        <div v-if="layerValue.layerType === 'HEAT'" class="sm-component-legend__wrap">
          <div class="sm-component-legend__heatbox">
            <div class="sm-component-legend__heat">
              <i :style="{ background: `linear-gradient(to top,${layerValue.styleGroup.join(',')})` }" />
            </div>
            <div class="sm-component-legend__heatText">
              <span class="sm-component-legend__top">
                <i class="sm-components-icon-solid-triangle-left" />
                {{ $t('legend.top') }}
              </span>
              <span class="sm-component-legend__bottom">
                <i class="sm-components-icon-solid-triangle-left" />
                {{ $t('legend.bottom') }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="layerValue.layerType === 'RANGE'" class="sm-component-legend__wrap">
          <div class="sm-component-legend__range">
            <div v-for="(item, l) in layerValue.styleGroup" :key="l" class="sm-component-legend__range-item">
              <div>
                <i :style="{ background: item.color }" />
              </div>
              <span class="add-ellipsis">
                <i class="sm-components-icon-solid-triangle-left" />
                {{ showRangeInfo(item, layerKey) }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="layerValue.layerType === 'RANK_SYMBOL'" class="sm-component-legend__wrap">
          <div class="sm-component-legend__rank">
            <div v-for="(item, l) in layerValue.styleGroup" :key="l" class="sm-component-legend__rank-item">
              <div class="sm-component-legend__rank-icon">
                <i :class="item.style.className" :style="rankSymbolStyle(item)" />
              </div>
              <span class="add-ellipsis">
                <i class="sm-components-icon-solid-triangle-left" />
                {{ item.start }}-{{ item.end }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </sm-card>
  </sm-collapse-card>
</template>

<script>
import Theme from '../../../../common/_mixin/Theme';
import Control from '../../../_mixin/control';
import MapGetter from '../../../_mixin/map-getter';
import BaseCard from '../../../../common/_mixin/Card';
import SmCard from '../../../../common/card/Card';
import SmCollapse from '../../../../common/collapse/Collapse';
import SmCollapsePanel from '../../../../common/collapse/Panel';
import LegendViewModel from './LegendViewModel';
import { getColorWithOpacity } from '../../../../common/_utils/util';

export default {
  name: 'SmLegend',
  components: {
    SmCard,
    SmCollapse,
    SmCollapsePanel
  },
  filters: {
    selectLayerType(featureType, style) {
      if (style.className) {
        return style.className;
      }
      const result = {
        POLYGON: 'sm-components-icon-ploygon',
        POINT: 'sm-components-icon-multi-point',
        LINE: 'sm-components-icon-line'
      }[featureType];
      if (featureType === 'POINT' && style.type !== 'BASIC_POINT') {
        return '';
      }
      return result;
    }
  },
  mixins: [MapGetter, Control, Theme, BaseCard],
  props: {
    collapsed: {
      type: Boolean, // 是否折叠
      default: true
    },
    splitLine: {
      type: Boolean,
      default: false
    },
    headerName: {
      type: String,
      default: function() {
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
      activeLegend: [],

      themeStyle: {}
    };
  },
  computed: {
    uniqueSymbolStyle() {
      return function(styleItem) {
        const { style, radius, color } = styleItem;
        let generateStyle = {};
        switch (style.type) {
          case 'BASIC_POINT':
            generateStyle.color = getColorWithOpacity(style.fillColor || color, style.fillOpacity);
            break;
          case 'SYMBOL_POINT':
            generateStyle.color = getColorWithOpacity(style.fillColor || color, style.fillOpacity);
            generateStyle.fontSize = `${radius * 2}px`;
            break;
          case 'IMAGE_POINT':
            generateStyle.background = `url(${style.imageInfo.url})`;
            generateStyle.backgroundSize = 'contain';
            generateStyle.width = `${(style.radius || radius) * 2}px`;
            generateStyle.height = `${(style.radius || radius) * 2}px`;
            break;
          case 'SVG_POINT':
            generateStyle['-webkit-mask'] = `url(${style.url})`;
            generateStyle.backgroundColor = getColorWithOpacity(style.fillColor || color, style.fillOpacity);
            generateStyle['-webkit-mask-size'] = 'contain';
            generateStyle.width = `${(style.radius || radius) * 2}px`;
            generateStyle.height = `${(style.radius || radius) * 2}px`;
            break;
          default:
            generateStyle.color = getColorWithOpacity(style.fillColor || color, style.fillOpacity);
            break;
        }
        return generateStyle;
      };
    },
    rankSymbolStyle() {
      return function(styleItem) {
        const { style, radius, color } = styleItem;
        let generateStyle = {};
        switch (style.type) {
          case 'BASIC_POINT':
            generateStyle.background = getColorWithOpacity(color || style.fillColor, style.fillOpacity);
            generateStyle.width = `${radius * 2}px`;
            generateStyle.height = `${radius * 2}px`;
            generateStyle.borderRadius = `${radius}px`;
            break;
          case 'SYMBOL_POINT':
            generateStyle.color = getColorWithOpacity(color || style.fillColor, style.fillOpacity);
            generateStyle.fontSize = `${radius * 2}px`;
            break;
          case 'IMAGE_POINT':
            generateStyle.background = `url(${style.imageInfo.url})`;
            generateStyle.backgroundSize = 'contain';
            generateStyle.width = `${radius * 2}px`;
            generateStyle.height = `${radius * 2}px`;
            break;
          default:
            break;
        }
        return generateStyle;
      };
    },
    showRangeInfo() {
      return (item, layerKey) => {
        const { start, end } = item;
        if (start !== undefined && end !== undefined) {
          if (this.legendList[layerKey].integerType) {
            return this.getIntegerRangeInfo(start, end);
          }
          return `${start} - ${end}`;
        }
        return start !== undefined ? `≥${start}` : `≤${end}`;
      };
    }
  },
  watch: {
    layerNames: function(newVal) {
      this.layerNames = newVal;
      this.initLegendList();
    }
  },
  methods: {
    initLegendList() {
      this.legendList = {};
      if (this.viewModel) {
        this.layerNames.forEach(layer => {
          let style = this.viewModel.getStyle(layer);
          if (!style) {
            return;
          }
          if (!this.legendList[layer]) {
            this.$set(this.legendList, layer, style);
          }
        });
        this.activeLegend = JSON.stringify(this.legendList) !== '{}' ? Object.keys(this.legendList)[0] : [];
        this.activeLegend = this.isShowTitle ? this.activeLegend : Object.keys(this.legendList);
      }
    },
    getIntegerRangeInfo(start, end) {
      if (end - 1 === start || end === start) {
        return `${start}`;
      }
      return `${start} - ${end - 1}`;
    }
  },
  loaded() {
    // show用来控制图例列表的显示
    this.viewModel = new LegendViewModel(this.webmap);
    this.initLegendList();
  },
  removed() {
    this.legendList = {};
  }
};
</script>
