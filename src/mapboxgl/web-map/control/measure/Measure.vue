<template>
  <sm-collapse-card
    v-show="isShow"
    :icon-class="iconClass"
    :icon-position="position"
    :header-name="headerName || $t('measure.mapMeasure')"
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
          :style="collapseCardHeaderBgStyle"
          :class="{'sm-component-measure__modeIcon': true, 'is-active':activeMode === group.mode}"
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
          @change="updateUnit"
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
          @change="updateUnit"
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
import Theme from '../../../../common/_mixin/Theme';
import Control from '../../../_mixin/control';
import MapGetter from '../../../_mixin/map-getter';
import Card from '../../../../common/_mixin/Card';
import SmSelect from '../../../../common/select/Select';
import SmSelectOption from '../../../../common/select/Option';
import MeasureViewModel from './MeasureViewModel';
import drawEvent from '../../../_types/draw-event';
import uniqueId from 'lodash.uniqueid';
import { setPopupArrowStyle } from '../../../../common/_utils/util';
import '../../../../../static/libs/mapbox-gl-draw/mapbox-gl-draw.css';

export default {
  name: 'SmMeasure',
  components: {
    SmSelect,
    SmSelectOption
  },
  mixins: [MapGetter, Control, Theme, Card],
  props: {
    collapsed: {
      type: Boolean, // 是否折叠
      default: true
    },
    splitLine: {
      type: Boolean,
      default: false
    },
    iconClass: {
      type: String,
      default: 'sm-components-icon-measure'
    },
    headerName: {
      type: String
      // default: geti18n().t('commontypes.iportalData') // '量算'
    },
    showUnitSelect: {
      // 配置单位选择框是否显示，若不显示，则显示对应的默认单位
      type: Boolean,
      default: true
    },
    distanceDefaultUnit: {
      // 距离默认单位
      type: String,
      default: 'kilometers'
    },
    areaDefaultUnit: {
      // 面积默认单位
      type: String,
      default: 'kilometers'
    },
    continueDraw: {
      // 是否开启多绘制
      type: Boolean,
      default: true
    }
  },
  data() {
    const unitOptions = {
      draw_line_string: {
        kilometers: this.$t('unit.kilometers'),
        miles: this.$t('unit.miles'),
        meters: this.$t('unit.meters'),
        feet: this.$t('unit.feet'),
        yards: this.$t('unit.yards')
      },
      draw_polygon: {
        kilometers: this.$t('unit.squarekilometers'),
        miles: this.$t('unit.squaremiles'),
        meters: this.$t('unit.squaremeters'),
        feet: this.$t('unit.squarefeet'),
        yards: this.$t('unit.squareyards')
      }
    };
    return {
      unitOptions,
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
      result: '',
      activeDistanceUnit: this.distanceDefaultUnit,
      activeAreaUnit: this.areaDefaultUnit,
      modeUnitMap: {
        draw_line_string: 'activeDistanceUnit',
        draw_polygon: 'activeAreaUnit'
      },
      layerId: ''
    };
  },
  computed: {
    getUnitOptions() {
      return this.unitOptions[this.activeMode] || [];
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
      const modeUnitKey = this.modeUnitMap[this.activeMode];
      let label = units[this[modeUnitKey]];
      return label;
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
    distanceDefaultUnit: function(newVal) {
      this.activeDistanceUnit = newVal;
      this.updateUnit(newVal);
    },
    areaDefaultUnit: function(newVal) {
      this.activeAreaUnit = newVal;
      this.updateUnit(newVal);
    },
    popupStyle(next) {
      this.setPopupStyle(next);
    }
  },
  created() {
    this.componentName = uniqueId(this.$options.name);
    this.viewModel = new MeasureViewModel({
      continueDraw: this.continueDraw,
      componentName: this.componentName
    });
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
    },
    measureStartFn(e) {
      this.result = '';
      this.measureFinished = false;
    },
    updateUnitFn(e) {
      this.result = e.result;
    },
    drawResetFn({ componentName }) {
      if (componentName !== this.componentName) {
        this.activeMode = null;
        this.result = '';
      }
    },
    // 切换量算模式
    changeMeasureMode(mode) {
      setTimeout(() => {
        const mapNotLoaded = this.mapNotLoadedTip();
        if (mapNotLoaded) {
          return;
        }
        if (!this.map.loaded()) {
          this.$message.destroy();
          this.$message.warning(this.$t('warning.mapNotLoaded'));
        } else {
          let modeUnitKey = this.modeUnitMap[mode];
          let activeUnit = this[modeUnitKey];
          if (mode === 'delete') {
            this.viewModel.trash();
            this.activeMode = null;
            this.result = '';
            return;
          }
          if (this.activeMode !== mode || !this.continueDraw) {
            this.viewModel.openDraw(mode, activeUnit, this.setPopupStyle);
            this.activeMode = mode;
            this.continueDraw && drawEvent.$emit('draw-reset', { componentName: this.componentName });
          } else {
            this.viewModel.removeDraw(this.continueDraw);
            this.activeMode = null;
          }
        }
      }, 0);
    },
    updateUnit(unit) {
      this.viewModel && this.viewModel.updateUnit(unit);
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
    resetData(mapTarget) {
      this.activeMode = null;
      this.result = '';
      this.continueDraw && drawEvent.$emit('draw-reset', { componentName: this.componentName });
    },
    // 提供对外方法：清空features
    clear() {
      this.activeMode = null;
      this.result = '';
      this.viewModel && this.viewModel.clearAllFeatures();
    },
    setPopupStyle(styleData = this.popupStyle) {
      const popupContentList = document.querySelectorAll('.sm-component-measure__popup .mapboxgl-popup-content');
      if (popupContentList) {
        popupContentList.forEach(item => {
          item.style.color = styleData.color;
          item.style.background = styleData.background;
        });
      }
      setPopupArrowStyle(styleData.background);
    }
  }
};
</script>
