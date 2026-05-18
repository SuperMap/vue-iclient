<template>
  <sm-collapse-card
    v-show="isShow"
    :icon-class="iconClass"
    :icon-position="position"
    :header-name="headerName"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :background="background"
    :textColor="textColor"
    :split-line="splitLine"
    class="sm-component-measure"
  >
    <div class="sm-component-measure__panel" :style="headingTextColorStyle">
      <div class="sm-component-measure__panelContent">
        <span
          v-for="group in modeGroups"
          v-show="group.mode !== 'delete' || (!continueDraw && group.mode === 'delete')"
          :key="group.mode"
          :title="group.title"
          :style="subComponentSpanBgStyle"
          :class="{ 'sm-component-measure__modeIcon': true, 'is-active': activeMode === group.mode }"
          @click="changeMeasureMode(group.mode)"
        >
          <i :class="group.iconClass"></i>
        </span>
        <sm-select
          v-show="getDistanceSelect"
          v-model="activeDistanceUnit"
          :placeholder="$t('measure.selectPlaceholder')"
          class="sm-component-measure__unit"
          :style="getTextColorStyle"
          :get-popup-container="getPopupContainer"
          @change="unit => updateUnit(unit, 'draw_line_string')"
        >
          <sm-select-option v-for="(value, key, index) in getUnitOptions" :key="index" :title="value" :value="key">
            {{ value }}
          </sm-select-option>
        </sm-select>
        <sm-select
          v-show="getAreaSelect"
          v-model="activeAreaUnit"
          :placeholder="$t('measure.selectPlaceholder')"
          class="sm-component-measure__unit"
          :style="getTextColorStyle"
          :get-popup-container="getPopupContainer"
          @change="unit => updateUnit(unit, 'draw_polygon')"
        >
          <sm-select-option v-for="(value, key, index) in getUnitOptions" :key="index" :title="value" :value="key">
            {{ value }}
          </sm-select-option>
        </sm-select>
        <div v-show="!showUnitSelect && activeMode" class="sm-component-measure__unit sm-component-measure__default">
          {{ getUnitLabel }}
        </div>
      </div>
      <div v-show="getResult" class="sm-component-measure__calculateResult">
        <div class="sm-component-measure__calcuTitle" :style="headingTextColorStyle">{{ $t('measure.measureResult') }}</div>
        <div class="sm-component-measure__result" :style="getTextColorStyle">{{ getResult }}</div>
      </div>
    </div>
  </sm-collapse-card>
</template>

<script>
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import Control from 'vue-iclient/src/mapboxgl/_mixin/control';
import MapGetter from 'vue-iclient/src/mapboxgl/_mixin/map-getter';
import Card from 'vue-iclient/src/common/_mixin/Card';
import SmSelect from 'vue-iclient/src/common/select/Select.vue';
import SmSelectOption from 'vue-iclient/src/common/select/Option.vue';
import drawEvent from 'vue-iclient/src/mapboxgl/_types/draw-event';
import uniqueId from 'lodash.uniqueid';
import { setPopupArrowStyle } from 'vue-iclient/src/common/_utils/util';
import Message from 'vue-iclient/src/common/message/Message.js';
import 'vue-iclient/static/libs/mapbox-gl-draw/mapbox-gl-draw.css';
import MeasureViewModel from './MeasureViewModel';
import {
  ensureMeasureDefaultUnit,
  getAvailableMeasureUnitKeys,
  getMeasureUnitOptionMap
} from './measure-unit';

export default {
  name: 'SmMeasure',
  components: {
    SmSelect,
    SmSelectOption
  },
  mixins: [MapGetter, Control, Theme, Card],
  props: {
    iconClass: {
      type: String,
      default: 'sm-components-icon-measure'
    },
    headerName: {
      type: String,
      default() {
        return this.$t('measure.mapMeasure');
      }
    },
    showUnitSelect: {
      type: Boolean,
      default: true
    },
    distanceDefaultUnit: {
      type: String,
      default: 'kilometers'
    },
    areaDefaultUnit: {
      type: String,
      default: 'kilometers'
    },
    continueDraw: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      modeGroups: [
        {
          mode: 'draw_line_string',
          title: this.$t('measure.distance'),
          iconClass: 'sm-components-icon-line'
        },
        {
          mode: 'draw_polygon',
          title: this.$t('measure.area'),
          iconClass: 'sm-components-icon-ploygon'
        },
        {
          mode: 'delete',
          title: this.$t('measure.delete'),
          iconClass: 'sm-components-icon-delete'
        }
      ],
      activeMode: '',
      activeModeCache: null,
      result: '',
      resultMode: null,
      measureFinished: false,
      activeDistanceUnit: this.distanceDefaultUnit,
      activeAreaUnit: this.areaDefaultUnit,
      modeUnitMap: {
        draw_line_string: 'activeDistanceUnit',
        draw_polygon: 'activeAreaUnit'
      }
    };
  },
  computed: {
    dashboardMeasureConfig() {
      return this.$store?.getters.customRequestConfig || {};
    },
    distanceVisibleUnits() {
      return getAvailableMeasureUnitKeys(this.dashboardMeasureConfig, 'distance');
    },
    areaVisibleUnits() {
      return getAvailableMeasureUnitKeys(this.dashboardMeasureConfig, 'area');
    },
    distanceDefaultUnitValue() {
      return ensureMeasureDefaultUnit(this.distanceDefaultUnit, this.distanceVisibleUnits);
    },
    areaDefaultUnitValue() {
      return ensureMeasureDefaultUnit(this.areaDefaultUnit, this.areaVisibleUnits);
    },
    distanceUnitOptions() {
      return getMeasureUnitOptionMap(this.dashboardMeasureConfig, 'distance', key => this.$t(key), 'result');
    },
    areaUnitOptions() {
      return getMeasureUnitOptionMap(this.dashboardMeasureConfig, 'area', key => this.$t(key), 'result');
    },
    getUnitOptions() {
      const displayMode = this.activeMode || this.resultMode;
      return displayMode === 'draw_polygon' ? this.areaUnitOptions : this.distanceUnitOptions;
    },
    getResult() {
      if (this.result && this.measureFinished) {
        const result = `${this.result} ${this.getUnitLabel}`;
        this.resetActiveMode();
        return result;
      }
      return '';
    },
    getUnitLabel() {
      const units = this.getUnitOptions;
      const displayMode = this.activeMode || this.resultMode;
      const modeUnitKey = this.modeUnitMap[displayMode];
      return modeUnitKey ? units[this[modeUnitKey]] || '' : '';
    },
    getAreaSelect() {
      return this.activeMode === 'draw_polygon' && this.showUnitSelect;
    },
    getDistanceSelect() {
      return this.activeMode === 'draw_line_string' && this.showUnitSelect;
    },
    popupStyle() {
      return {
        background: this.tablePopupBgStyle.background,
        color: this.getTextColorStyle.color
      };
    }
  },
  watch: {
    dashboardMeasureConfig: {
      deep: true,
      handler(next) {
        this.viewModel && this.viewModel.setDashboardConfig(next);
      }
    },
    distanceDefaultUnit(newVal) {
      this.activeDistanceUnit = ensureMeasureDefaultUnit(newVal, this.distanceVisibleUnits, this.activeDistanceUnit);
      this.shouldUpdateResultUnit('draw_line_string') && this.updateUnit(this.activeDistanceUnit, 'draw_line_string');
    },
    areaDefaultUnit(newVal) {
      this.activeAreaUnit = ensureMeasureDefaultUnit(newVal, this.areaVisibleUnits, this.activeAreaUnit);
      this.shouldUpdateResultUnit('draw_polygon') && this.updateUnit(this.activeAreaUnit, 'draw_polygon');
    },
    distanceVisibleUnits: {
      immediate: true,
      handler(next) {
        const nextUnit = ensureMeasureDefaultUnit(this.activeDistanceUnit, next, this.distanceDefaultUnitValue);
        if (nextUnit !== this.activeDistanceUnit) {
          this.activeDistanceUnit = nextUnit;
          this.shouldUpdateResultUnit('draw_line_string') && this.updateUnit(nextUnit, 'draw_line_string');
        }
      }
    },
    areaVisibleUnits: {
      immediate: true,
      handler(next) {
        const nextUnit = ensureMeasureDefaultUnit(this.activeAreaUnit, next, this.areaDefaultUnitValue);
        if (nextUnit !== this.activeAreaUnit) {
          this.activeAreaUnit = nextUnit;
          this.shouldUpdateResultUnit('draw_polygon') && this.updateUnit(nextUnit, 'draw_polygon');
        }
      }
    },
    popupStyle(next) {
      this.setPopupStyle(next);
    }
  },
  created() {
    this.componentName = uniqueId(this.$options.name);
    this.viewModel = new MeasureViewModel({
      continueDraw: this.continueDraw,
      componentName: this.componentName,
      dashboardConfig: this.dashboardMeasureConfig
    });
    this.viewModel.setDashboardConfig(this.dashboardMeasureConfig);
    this.viewModel.on('measure-finished', this.measureFinishedFn);
    this.viewModel.on('measure-start', this.measureStartFn);
    this.viewModel.on('update-unit', this.updateUnitFn);
  },
  mounted() {
    drawEvent.$on('draw-reset', this.drawResetFn);
  },
  beforeDestroy() {
    this.viewModel.off('measure-finished', this.measureFinishedFn);
    this.viewModel.off('measure-start', this.measureStartFn);
    this.viewModel.off('update-unit', this.updateUnitFn);
    drawEvent.$off('draw-reset', this.drawResetFn);
  },
  removed(map, target) {
    drawEvent.$options.deleteDrawingState(target, this.componentName);
    this.resetData(target);
  },
  methods: {
    measureFinishedFn(e) {
      this.result = e.result;
      this.measureFinished = true;
      this.resultMode = e.mode || this.activeMode || this.resultMode;
    },
    measureStartFn() {
      this.result = '';
      this.measureFinished = false;
      this.resultMode = this.activeMode || this.resultMode;
    },
    updateUnitFn(e) {
      this.result = e.result;
      this.resultMode = e.mode || this.resultMode;
    },
    drawResetFn({ componentName }) {
      if (componentName !== this.componentName) {
        this.activeMode = null;
        this.result = '';
        this.resultMode = null;
      }
    },
    shouldUpdateResultUnit(mode) {
      return this.activeMode === mode || this.resultMode === mode;
    },
    changeMeasureMode(mode) {
      setTimeout(() => {
        const mapNotLoaded = this.mapNotLoadedTip();
        if (mapNotLoaded) {
          return;
        }
        if (!this.map.loaded()) {
          Message.destroy();
          Message.warning(this.$t('warning.mapNotLoaded'));
        } else {
          const modeUnitKey = this.modeUnitMap[mode];
          const visibleUnits = mode === 'draw_polygon' ? this.areaVisibleUnits : this.distanceVisibleUnits;
          const fallbackUnit = mode === 'draw_polygon' ? this.areaDefaultUnitValue : this.distanceDefaultUnitValue;
          this[modeUnitKey] = ensureMeasureDefaultUnit(this[modeUnitKey], visibleUnits, fallbackUnit);
          const activeUnit = this[modeUnitKey];
          if (mode === 'delete') {
            this.viewModel.trash();
            this.activeMode = null;
            this.result = '';
            this.resultMode = null;
            return;
          }
          if (this.activeMode !== mode || !this.continueDraw) {
            this.resultMode = mode;
            this.viewModel.openDraw(mode, activeUnit, this.setPopupStyle);
            this.activeMode = mode;
            this.continueDraw && drawEvent.$emit('draw-reset', { componentName: this.componentName });
          } else {
            this.viewModel.removeDraw(this.continueDraw);
            this.activeMode = null;
            this.resultMode = null;
          }
        }
      }, 0);
    },
    updateUnit(unit, mode) {
      const modeUnitKey = this.modeUnitMap[mode];
      modeUnitKey && (this[modeUnitKey] = unit);
      this.viewModel && this.viewModel.updateUnit(unit, mode);
      this.setPopupStyle();
    },
    getPopupContainer() {
      return this.$el.querySelector('.sm-component-measure__panelContent');
    },
    resetActiveMode() {
      !this.activeModeCache && (this.activeModeCache = this.activeMode);
      this.measureFinished && !this.continueDraw && (this.activeMode = null);
      if (!this.measureFinished && this.continueDraw) {
        this.activeMode = this.activeModeCache;
      }
    },
    resetData() {
      this.activeMode = null;
      this.result = '';
      this.resultMode = null;
      this.continueDraw && drawEvent.$emit('draw-reset', { componentName: this.componentName });
    },
    clear() {
      this.activeMode = null;
      this.result = '';
      this.resultMode = null;
      this.viewModel && this.viewModel.clearAllFeatures();
    },
    setPopupStyle(styleData = this.popupStyle) {
      this.$nextTick(() => {
        const popupContentList = document.querySelectorAll('.sm-component-measure__popup .mapboxgl-popup-content');
        if (popupContentList) {
          popupContentList.forEach(item => {
            item.style.color = styleData.color;
            item.style.background = styleData.background;
          });
        }
        setPopupArrowStyle(styleData.background);
      });
    }
  }
};
</script>
