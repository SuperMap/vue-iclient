<template>
  <sm-collapse-card
    v-show="isShow"
    :style="[noBorder]"
    :icon-class="mode === 'simple' ? '' : iconClass"
    :icon-position="position"
    :header-name="mode === 'simple' ? '' : headerName"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :background="getBackground"
    :textColor="textColor"
    class="sm-component-legend"
  >
    <a-card
      :style="mode !== 'simple' ? [getBackgroundStyle, getTextColorStyle, {border: 0, borderRadius: 0}] : [{border: 0, borderRadius: 0, background: 'transparent'}]"
      :bordered="false"
    >
      <a-collapse
        v-if="(mode === 'panel' || (layerNames.length > 1 && mode !== 'simple')) && JSON.stringify(legendList) !== '{}'"
        v-model="activeLegend"
        class="sm-component-legend__table"
      >
        <a-collapse-panel
          v-for="(layerValue,layerKey) in legendList"
          :key="layerKey"
          :disabled="!isShowTitle"
          :showArrow="false"
        >
          <template slot="header">
            <div v-if="isShowTitle" class="header-wrap" :style="[getTextColorStyle]">
              <div class="sm-component-legend__title add-ellipsis">{{ layerValue.layerId }}</div>
              <a-icon type="right" class="header-arrow" />
            </div>
          </template>
          <div
            v-if="isShowField"
            class="sm-component-legend__themefield add-ellipsis"
            :style="[getTextColorStyle]"
          >{{ $t("legend.themeField") }}:{{ layerValue.themeField }}</div>
          <div
            v-if="layerValue.layerType === 'UNIQUE'"
            :style="[getTextColorStyle]"
            class="sm-component-legend__wrap"
          >
            <ul class="sm-component-legend__point">
              <li
                v-for="(item,i) in layerValue.styleGroup"
                :key="i"
                class="sm-component-legend__item"
              >
                <i :class="layerValue.featureType | selectLayerType" :style="{color:item.color}"></i>
                <span class="sm-component-legend__field-value add-ellipsis">{{ item.value }}</span>
              </li>
            </ul>
          </div>

          <div
            v-if="layerValue.layerType === 'HEAT'"
            :style="[getTextColorStyle]"
            class="sm-component-legend__wrap"
          >
            <div class="sm-component-legend__heatbox">
              <div
                class="sm-component-legend__heat"
                :style="{background:`linear-gradient(to top,${layerValue.styleGroup.join(',')})`}"
              ></div>
              <div class="sm-component-legend__heatText">
                <span class="sm-component-legend__top">
                  <a-icon type="caret-left" />
                  {{ $t("legend.top") }}
                </span>
                <span class="sm-component-legend__bottom">
                  <a-icon type="caret-left" />
                  {{ $t("legend.bottom") }}
                </span>
              </div>
            </div>
          </div>

          <div
            v-if="layerValue.layerType === 'RANGE'"
            :style="[getTextColorStyle]"
            class="sm-component-legend__wrap"
          >
            <div class="sm-component-legend__range">
              <div
                v-for="(item,j) in layerValue.styleGroup"
                :key="j"
                class="sm-component-legend__range-item"
              >
                <div :style="{background: item.color}"></div>
                <span class="add-ellipsis">
                  <a-icon type="caret-left" />
                  {{ showRangeInfo(item, layerKey) }}
                </span>
              </div>
            </div>
          </div>

          <div
            v-if="layerValue.layerType === 'RANK_SYMBOL'"
            :style="[getTextColorStyle]"
            class="sm-component-legend__wrap"
          >
            <div class="sm-component-legend__rank">
              <div
                v-for="(item,j) in layerValue.styleGroup"
                :key="j"
                class="sm-component-legend__rank-item"
              >
                <div class="sm-component-legend__rank-icon">
                  <i :class="item.style.className" :style="rankSymbolStyle(item)" />
                </div>
                <span class="add-ellipsis">
                  <a-icon type="caret-left" />
                  {{ item.start }}-{{ item.end }}
                </span>
              </div>
            </div>
          </div>
        </a-collapse-panel>
      </a-collapse>
      <div
        v-for="(layerValue,layerKey,index) in legendList"
        v-else-if="mode === 'simple' || layerNames.length === 1"
        :key="index"
        :style="[getTextColorStyle]"
        class="sm-component-legend__noBorder"
      >
        <div
          v-if="isShowTitle"
          class="sm-component-legend__title add-ellipsis"
          :style="[getTextColorStyle]"
        >{{ layerValue.layerId }}</div>
        <div
          v-if="isShowField"
          class="sm-component-legend__themefield add-ellipsis"
          :style="[getTextColorStyle]"
        >{{ $t("legend.themeField") }}:{{ layerValue.themeField }}</div>

        <div v-if="layerValue.layerType === 'UNIQUE'" class="sm-component-legend__wrap">
          <ul class="sm-component-legend__point">
            <li
              v-for="(item,k) in layerValue.styleGroup"
              :key="k"
              class="sm-component-legend__item"
            >
              <i :class="layerValue.featureType | selectLayerType" :style="{color:item.color}"></i>
              <span class="sm-component-legend__field-value add-ellipsis">{{ item.value }}</span>
            </li>
          </ul>
        </div>

        <div v-if="layerValue.layerType === 'HEAT'" class="sm-component-legend__wrap">
          <div class="sm-component-legend__heatbox">
            <div
              class="sm-component-legend__heat"
              :style="{background:`linear-gradient(to top,${layerValue.styleGroup.join(',')})`}"
            ></div>
            <div class="sm-component-legend__heatText">
              <span class="sm-component-legend__top">
                <a-icon type="caret-left" />
                {{ $t("legend.top") }}
              </span>
              <span class="sm-component-legend__bottom">
                <a-icon type="caret-left" />
                {{ $t("legend.bottom") }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="layerValue.layerType === 'RANGE'" class="sm-component-legend__wrap">
          <div class="sm-component-legend__range">
            <div
              v-for="(item,l) in layerValue.styleGroup"
              :key="l"
              class="sm-component-legend__range-item"
            >
              <div :style="{background: item.color}"></div>
              <span class="add-ellipsis">
                <a-icon type="caret-left" />
                {{ showRangeInfo(item, layerKey) }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="layerValue.layerType === 'RANK_SYMBOL'" class="sm-component-legend__wrap">
          <div class="sm-component-legend__rank">
            <div
              v-for="(item,l) in layerValue.styleGroup"
              :key="l"
              class="sm-component-legend__rank-item"
            >
              <div class="sm-component-legend__rank-icon">
                <i :class="item.style.className" :style="rankSymbolStyle(item)" />
              </div>
              <span class="add-ellipsis">
                <a-icon type="caret-left" />
                {{ item.start }}-{{ item.end }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </a-card>
  </sm-collapse-card>
</template>

<script>
import Theme from '../../../../common/_mixin/Theme';
import Control from '../../../_mixin/control';
import MapGetter from '../../../_mixin/map-getter';
import Card from '../../../../common/_mixin/Card';
import LegendViewModel from './LegendViewModel';
import { getColorWithOpacity } from '../../../../common/_utils/util';

export default {
  name: 'SmLegend',
  filters: {
    selectLayerType(featureType) {
      return {
        POLYGON: 'sm-components-icons-polygon-layer',
        POINT: 'sm-components-icons-point-layer',
        LINE: 'sm-components-icons-line-layer'
      }[featureType];
    }
  },
  mixins: [MapGetter, Control, Theme, Card],
  props: {
    collapsed: {
      type: Boolean, // 是否折叠
      default: true
    },
    iconClass: {
      type: String,
      default: 'sm-components-icons-layer-style'
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
    getTitleColor() {
      return { color: this['colorGroupsData'][1] };
    },
    noBorder() {
      if (this.mode === 'simple') {
        return {
          background: 'transparent',
          'box-shadow': 'none'
        };
      } else {
        return {};
      }
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
