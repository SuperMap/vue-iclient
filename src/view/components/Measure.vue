<template>
  <sm-card
    v-show="isShow"
    :icon-class="iconClass"
    :icon-position="position"
    :header-name="headerName"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    class="sm-widget-measure"
  >
    <div class="sm-widget-measure__panel" :style="[getBackgroundStyle, getTextColorStyle]">
      <!-- <div class="sm-widget-measure__panelTitle">
          <span class="sm-widget-measure__title">{{$t("measure.mapMeasure")}}</span>
      </div>-->
      <div class="sm-widget-measure__panelContent">
        <span
          v-for="group in modeGroups"
          :key="group.mode"
          :style="activeMode === group.mode ? getColorStyle(0) : ''"
          :class="{'sm-widget-measure__modeIcon': true, 'sm-widget-measure__iconActive': activeMode === group.mode}"
          :title="group.title"
          @click="changeMeasureMode(group.mode)"
        >
          <i :class="group.iconClass"></i>
        </span>
        <el-select
          v-show="getDistanceSelect"
          v-model="activeDistanceUnit"
          placeholder="请选择"
          size="mini"
          class="sm-widget-measure__unit"
          :popper-append-to-body="false"
          @change="updateUnit"
          @visible-change="changeChosenStyle"
        >
          <el-option
            v-for="(value, key, index) in getUnitOptions"
            :key="index"
            :label="value"
            :value="key"
          ></el-option>
        </el-select>
        <el-select
          v-show="getAreaSelect"
          v-model="activeAreaUnit"
          placeholder="请选择"
          size="mini"
          class="sm-widget-measure__unit"
          :popper-append-to-body="false"
          @change="updateUnit"
          @visible-change="changeChosenStyle"
        >
          <el-option
            v-for="(value, key, index) in getUnitOptions"
            :key="index"
            :label="value"
            :value="key"
          ></el-option>
        </el-select>
        <div
          v-show="!showUnitSelect && activeMode"
          class="sm-widget-measure__unit sm-widget-measure__default"
        >{{ getUnitLabel }}</div>
      </div>
      <div v-show="getResult" class="sm-widget-measure__calculateResult" :style="getTextColorStyle">
        <div class="sm-widget-measure__calcuTitle">{{ $t("measure.measureResult") }}</div>
        <div class="sm-widget-measure__result">{{ getResult }}</div>
      </div>
    </div>
  </sm-card>
</template>

<script>
import Theme from '../mixin/theme';
import Control from '../mixin/control';
import Card from '../mixin/card';
import MapGetter from '../mixin/map-getter';
import MeasureViewModel from '../../viewmodel/MeasureViewModel';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

export default {
  name: 'SmMeasure',
  mixins: [MapGetter, Control, Theme, Card],
  props: {
    iconClass: {
      type: String,
      default: 'smwidgets-icons-measure'
    },
    headerName: {
      type: String,
      default: '量算'
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
    }
  },
  data() {
    const unitOptions = {
      draw_line_string: {
        kilometers: this.$t('measure.kilometers'),
        miles: this.$t('measure.miles'),
        meters: this.$t('measure.meters'),
        feet: this.$t('measure.feet'),
        yards: this.$t('measure.yards')
      },
      draw_polygon: {
        kilometers: this.$t('measure.squarekilometers'),
        miles: this.$t('measure.squaremiles'),
        meters: this.$t('measure.squaremeters'),
        feet: this.$t('measure.squarefeet'),
        yards: this.$t('measure.squareyards')
      }
    };
    return {
      unitOptions,
      modeGroups: [
        {
          mode: 'draw_line_string',
          title: this.$t('measure.distance'),
          iconClass: 'smwidgets-icons-line-layer'
        },
        {
          mode: 'draw_polygon',
          title: this.$t('measure.area'),
          iconClass: 'smwidgets-icons-polygon-layer'
        }
      ],
      activeMode: '',
      result: '',
      activeDistanceUnit: this.distanceDefaultUnit,
      activeAreaUnit: this.areaDefaultUnit,
      modeUnitMap: {
        draw_line_string: 'activeDistanceUnit',
        draw_polygon: 'activeAreaUnit'
      }
    };
  },
  computed: {
    getUnitOptions() {
      return this.unitOptions[this.activeMode] || [];
    },
    getResult() {
      if (this.result) {
        return `${this.result} ${this.getUnitLabel}`;
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
    },
    areaDefaultUnit: function(newVal) {
      this.activeAreaUnit = newVal;
    }
  },
  mounted() {
    this.changeSelectInputStyle();
  },
  loaded() {
    this.viewModel = new MeasureViewModel({
      map: this.map
    });

    // 控制显示结果的显示
    this.viewModel.on('measure-finished', ({ result }) => {
      this.result = result;
    });
    this.viewModel.on('measure-start', ({ result }) => {
      this.result = '';
    });
    this.viewModel.on('update-unit', ({ result }) => {
      this.result = result;
    });
  },
  updated() {
    this.changeSelectInputStyle();
  },
  methods: {
    changeSelectInputStyle() {
      const selectDom = this.$el.querySelector('.el-input__inner');
      if (selectDom) {
        selectDom.style.borderColor = this.getTextColor;
        selectDom.style.color = this.getTextColor;
        selectDom.style.backgroundColor = this.getBackground;
      }
    },
    changeChosenStyle(visible) {
      const chosenOption = this.$el.querySelector(
        '.el-select-dropdown__item.selected'
      );
      if (chosenOption) {
        chosenOption.style.color = visible
          ? this.getColorStyle(0).color
          : '#606266';
      }
    },
    // 切换量算模式
    changeMeasureMode(mode) {
      let modeUnitKey = this.modeUnitMap[mode];
      let activeUnit = this[modeUnitKey];

      if (this.map.loaded()) {
        if (this.activeMode !== mode) {
          this.viewModel.openDraw(mode, activeUnit);
          this.activeMode = mode;
        } else {
          this.viewModel.closeDraw();
          this.activeMode = null;
        }
      }
    },
    updateUnit(unit) {
      this.viewModel.updateUnit(unit);
    }
  }
};
</script>
