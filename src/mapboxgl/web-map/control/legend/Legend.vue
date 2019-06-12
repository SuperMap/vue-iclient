<template>
  <sm-card
    v-show="isShow"
    :style="[noBorder]"
    :icon-class="mode === 'simple' ? '' : iconClass"
    :icon-position="position"
    :header-name="mode === 'simple' ? '' : headerName"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
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
          v-for="(layerValue,layerKey,index) in legendList"
          :key="`${index+1}`"
          :showArrow="false"
        >
          <template slot="header">
            <div class="header-wrap" :style="[getColorStyle(0)]">
              <div class="sm-component-legend__title">{{ layerValue.layerId }}</div>
              <a-icon type="right" class="header-arrow"/>
            </div>
          </template>
          <div
            v-if="isShowField"
            class="sm-component-legend__themefield add-ellipsis"
            :style="[getColorStyle(0)]"
          >{{ $t("legend.themeField") }}:{{ layerValue.themeField }}</div>
          <div v-if="layerValue.layerType === 'UNIQUE'" :style="[getTextColorStyle]">
            <ul class="sm-component-legend__point">
              <li
                v-for="(item,i) in layerValue.styleGroup"
                :key="i"
                class="sm-component-legend__item"
              >
                <i :class="layerValue.featureType | selectLayerType" :style="{color:item.color}"></i>
                <span class="sm-component-legend__field-value">{{ item.value }}</span>
              </li>
            </ul>
          </div>

          <div v-if="layerValue.layerType === 'HEAT'" :style="[getTextColorStyle]">
            <!-- <div
            class="sm-component-legend__themefield add-ellipsis"
            >{{$t("legend.themeField")}}：{{layerValue.themeField}}</div>-->
            <div
              class="sm-component-legend__heat"
              :style="{background:`linear-gradient(to top,${layerValue.styleGroup.join(',')})`}"
            >
              <span class="sm-component-legend__top">
                <i class="c"></i>
                {{ $t("legend.top") }}
              </span>
              <span class="sm-component-legend__bottom">
                <a-icon type="caret-left"/>
                {{ $t("legend.bottom") }}
              </span>
            </div>
          </div>

          <div v-if="layerValue.layerType === 'RANGE'" :style="[getTextColorStyle]">
            <!-- <div
            class="sm-component-legend__themefield add-ellipsis"
            >{{$t("legend.themeField")}}:{{layerValue.themeField}}</div>-->
            <div class="sm-component-legend__range">
              <div
                v-for="(item,j) in layerValue.styleGroup"
                :key="j"
                :style="{background:item.color}"
                class="sm-component-legend__range-item"
              >
                <span class="add-ellipsis">
                  <a-icon type="caret-left"/>
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
          class="sm-component-legend__title"
          :style="[getColorStyle(0)]"
        >{{ layerValue.layerId }}</div>
        <div
          v-if="isShowField"
          class="sm-component-legend__themefield add-ellipsis"
          :style="[getColorStyle(0)]"
        >{{ $t("legend.themeField") }}:{{ layerValue.themeField }}</div>

        <div v-if="layerValue.layerType === 'UNIQUE'">
          <ul class="sm-component-legend__point">
            <li
              v-for="(item,k) in layerValue.styleGroup"
              :key="k"
              class="sm-component-legend__item"
            >
              <i :class="layerValue.featureType | selectLayerType" :style="{color:item.color}"></i>
              <span class="sm-component-legend__field-value">{{ item.value }}</span>
            </li>
          </ul>
        </div>

        <div v-if="layerValue.layerType === 'HEAT'">
          <!-- <div
            class="sm-component-legend__themefield add-ellipsis"
          >{{$t("legend.themeField")}}：{{layerValue.themeField}}</div>-->
          <div
            class="sm-component-legend__heat"
            :style="{background:`linear-gradient(to top,${layerValue.styleGroup.join(',')})`}"
          >
            <span class="sm-component-legend__top">
              <a-icon type="caret-left"/>
              {{ $t("legend.top") }}
            </span>
            <span class="sm-component-legend__bottom">
              <a-icon type="caret-left"/>
              {{ $t("legend.bottom") }}
            </span>
          </div>
        </div>

        <div v-if="layerValue.layerType === 'RANGE'">
          <!-- <div
            class="sm-component-legend__themefield add-ellipsis"
          >{{$t("legend.themeField")}}:{{layerValue.themeField}}</div>-->
          <div class="sm-component-legend__range">
            <div
              v-for="(item,l) in layerValue.styleGroup"
              :key="l"
              :style="{background:item.color}"
              class="sm-component-legend__range-item"
            >
              <span class="add-ellipsis">
                <a-icon type="caret-left"/>
                {{ item.start }}-{{ item.end }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </a-card>
  </sm-card>
</template>

<script>
import Theme from '../../../../common/_mixin/theme';
import Control from '../../../_mixin/control';
import MapGetter from '../../../_mixin/map-getter';
import Card from '../../../../common/_mixin/card';
import LegendViewModel from './LegendViewModel';

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
    }
  },
  data() {
    return {
      legendList: {},
      // 控制第一个图例默认展开
      activeLegend: ['1'],

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
      this.layerNames.forEach(layer => {
        let style = this.legendViewModel.getStyle(layer);
        console.log(layer, style);
        if (!style) {
          throw new Error(this.$t('legend.noMatchLayer'));
        }
        if (!this.legendList[layer]) {
          this.$set(this.legendList, layer, style);
        }
      });
    }
  },
  loaded() {
    // show用来控制图例列表的显示
    this.legendViewModel = new LegendViewModel(this.webmap);
    this.initLegendList();
    const cardContent = this.$el.querySelector('.sm-component-card__content');
    cardContent.style.width = '200px';
  }
};
</script>
