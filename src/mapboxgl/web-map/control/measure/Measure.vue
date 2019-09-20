<template>
  <sm-card
    v-show="isShow"
    :icon-class="iconClass"
    :icon-position="position"
    :header-name="headerName || $t('measure.mapMeasure')"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :background="background"
    :textColor="textColor"
    class="sm-component-measure"
  >
    <div class="sm-component-measure__panel" :style="[getBackgroundStyle, getTextColorStyle]">
      <!-- <div class="sm-component-measure__panelTitle">
          <span class="sm-component-measure__title">{{$t("measure.mapMeasure")}}</span>
      </div>-->
      <div class="sm-component-measure__panelContent">
        <span
          v-for="group in modeGroups"
          v-show="group.mode !== 'delete' || (!continueDraw && group.mode === 'delete')"
          :key="group.mode"
          :style="activeMode === group.mode ? getColorStyle(0) : ''"
          :title="group.title"
          class="sm-component-measure__modeIcon"
          @click="changeMeasureMode(group.mode)"
        >
          <i :class="group.iconClass"></i>
        </span>
        <a-select
          v-show="getDistanceSelect"
          v-model="activeDistanceUnit"
          :placeholder="$t('measure.selectPlaceholder')"
          class="sm-component-measure__unit"
          :get-popup-container="getPopupContainer"
          @change="updateUnit"
          @dropdownVisibleChange="changeChosenStyle"
        >
          <a-select-option
            v-for="(value, key, index) in getUnitOptions"
            :key="index"
            :title="value"
            :value="key"
          >{{ value }}</a-select-option>
        </a-select>
        <a-select
          v-show="getAreaSelect"
          v-model="activeAreaUnit"
          :placeholder="$t('measure.selectPlaceholder')"
          class="sm-component-measure__unit"
          :get-popup-container="getPopupContainer"
          @change="updateUnit"
          @dropdownVisibleChange="changeChosenStyle"
        >
          <a-select-option
            v-for="(value, key, index) in getUnitOptions"
            :key="index"
            :title="value"
            :value="key"
          >{{ value }}</a-select-option>
        </a-select>
        <div
          v-show="!showUnitSelect && activeMode"
          class="sm-component-measure__unit sm-component-measure__default"
        >{{ getUnitLabel }}</div>
      </div>
      <div
        v-show="getResult"
        class="sm-component-measure__calculateResult"
        :style="getTextColorStyle"
      >
        <div class="sm-component-measure__calcuTitle">{{ $t("measure.measureResult") }}</div>
        <div class="sm-component-measure__result">{{ getResult }}</div>
      </div>
    </div>
  </sm-card>
</template>

<script>
import Theme from '../../../../common/_mixin/theme';
import Control from '../../../_mixin/control';
import MapGetter from '../../../_mixin/map-getter';
import Card from '../../../../common/_mixin/card';
import MeasureViewModel from './MeasureViewModel';
import drawEvent from '../../../_types/draw-event';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

export default {
  name: 'SmMeasure',
  mixins: [MapGetter, Control, Theme, Card],
  props: {
    iconClass: {
      type: String,
      default: 'sm-components-icons-measure'
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
          iconClass: 'sm-components-icons-line-layer'
        },
        {
          mode: 'draw_polygon',
          title: this.$t('measure.area'),
          iconClass: 'sm-components-icons-polygon-layer'
        },
        {
          mode: 'delete',
          title: this.$t('measure.delete'),
          iconClass: 'sm-components-icons-delete'
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
    textColorsData: {
      handler() {
        this.changeSelectInputStyle();
      }
    },
    backgroundData: {
      handler() {
        this.changeSelectInputStyle();
      }
    }
  },
  mounted() {
    this.changeSelectInputStyle();
  },
  beforeDestroy() {
    this.$options.removed.call(this);
  },
  loaded() {
    const mapTarget = this.getTargetName();
    this.viewModel = new MeasureViewModel({
      map: this.map,
      mapTarget,
      continueDraw: this.continueDraw
    });

    // 控制显示结果的显示
    this.viewModel.on('measure-finished', ({ result }) => {
      this.result = result;
      this.measureFinished = true;
    });
    this.viewModel.on('measure-start', ({ result }) => {
      this.result = '';
      this.measureFinished = false;
    });
    this.viewModel.on('update-unit', ({ result }) => {
      this.result = result;
    });
    drawEvent.$on('draw-reset', ({ componentName }) => {
      if (componentName !== this.$options.name) {
        this.activeMode = null;
        this.result = '';
        this.viewModel && this.viewModel.pauseDraw();
      }
    });
  },
  removed(deleteState) {
    this.activeMode = null;
    this.result = '';
    this.viewModel && this.viewModel.clear(deleteState);
  },
  methods: {
    changeSelectInputStyle() {
      const selectDoms = this.$el.querySelectorAll('.ant-select-selection');
      for (let selectDom of selectDoms) {
        if (selectDom) {
          selectDom.style.borderColor = this.getTextColor;
          selectDom.style.color = this.getTextColor;
          selectDom.style.backgroundColor = this.getBackground;
        }
      }
    },
    changeChosenStyle(visible) {
      setTimeout(() => {
        const optionList = this.$el.querySelectorAll('.ant-select-dropdown-menu-item');
        const dropdownDoms = this.$el.querySelectorAll('.ant-select-dropdown');
        for (let item of optionList) {
          if (item.classList.contains('ant-select-dropdown-menu-item-selected')) {
            item.style.color = this.getColorStyle(0).color;
            item.style.backgroundColor = this.getBackground;
          } else {
            item.style.color = this.getTextColor;
            item.style.backgroundColor = 'transparent';
          }
        }
        for (let dropdownDom of dropdownDoms) {
          if (dropdownDom) {
            dropdownDom.style.backgroundColor = this.getBackground;
          }
        }
      }, 0);
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
            this.viewModel.openDraw(mode, activeUnit);
            this.activeMode = mode;
          } else {
            this.viewModel.removeDraw();
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
    // 提供对外方法：清空features
    clear() {
      this.$options.removed.call(this, false);
    }
  }
};
</script>
