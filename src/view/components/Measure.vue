<template>
  <sm-card
    :icon-class="iconClass"
    :icon-position="position"
    :header-name="headerName"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    class="sm-measure"
    v-show="isShow"
  >
    <div class="sm-measure__panel" :style="[getBackgroundStyle, getTextColorStyle]">
      <!-- <div class="sm-measure__panelTitle">
          <span class="sm-measure__title">{{$t("measure.mapMeasure")}}</span>
      </div>-->
      <div class="sm-measure__panelContent">
        <span
          v-for="group in modeGroups"
          :key="group.mode"
          :style="activeMode === group.mode ? getColorStyle(0) : ''"
          :class="{'sm-measure__modeIcon': true, 'sm-measure__iconActive': activeMode === group.mode}"
          :title="group.title"
          @click="changeMeasureMode(group.mode)"
        >
          <i :class="group.iconClass"></i>
        </span>
        <el-select
          v-model="activeUnit"
          placeholder="请选择"
          size="mini"
          class="sm-measure__unit"
          v-show="showUnitSelect && activeMode"
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
          class="sm-measure__unit sm-measure__default"
        >{{getUnitLabel}}</div>
      </div>
      <div class="sm-measure__calculateResult" v-show="getResult" :style="getTextColorStyle">
        <div class="sm-measure__calcuTitle">{{$t("measure.measureResult")}}</div>
        <div class="sm-measure__result">{{getResult}}</div>
      </div>
    </div>
  </sm-card>
</template>

<script>
import Theme from '../mixin/Theme';
import Widget from './Widget';
import MeasureViewModel from '../../viewmodel/MeasureViewModel';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

export default {
  name: 'SmMeasure',
  relativeMap: true,
  extends: Widget,
  mixins: [Theme],
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
      default: 'meters'
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
      activeUnit: '',
      activeLengthUnit: '',
      activePolygonUnit: '',
      result: ''
    };
  },
  watch: {
    activeLengthUnit: function(newVal) {
      this.activeDistanceUnit = newVal;
      this.activeUnit = newVal;
    },
    areaDefaultUnit: function(newVal) {
      this.activeAreaUnit = newVal;
      this.activeUnit = newVal;
    }
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
      let label = this.activeMode
        ? this.unitOptions[this.activeMode][this.activeUnit]
        : '';
      return label;
    }
  },
  loaded() {
    this.viewModel = new MeasureViewModel({
      map: this.map
    });

    //控制显示结果的显示
    this.viewModel.on('measure-finished', ({ result }) => {
      this.result = result;
    });
    this.viewModel.on('measure-start', ({ result }) => {
      this.result = '';
    });
  },
  updated() {
    this.changeSelectInputStyle();
  },
  methods: {
    changeSelectInputStyle() {
        const selectDom = this.$el.querySelector('.el-input__inner');
        if(selectDom) {
          selectDom.style.borderColor = this.getTextColor;
          selectDom.style.color = this.getTextColor;
          selectDom.style.backgroundColor = this.getBackgroundNoOpacity;  
        }
    },
    changeChosenStyle(visible) {
      const chosenOption = this.$el.querySelector('.el-select-dropdown__item.selected');
      if(chosenOption) {
        chosenOption.style.color =  visible ? this.getColorStyle(0).color : '#606266';
      }
    },
    // 切换量算模式
    changeMeasureMode(mode) {
      if (mode === 'draw_line_string') {
        this.activeUnit = this.activeDistanceUnit;
      } else if (mode === 'draw_polygon') {
        this.activeUnit = this.activeAreaUnit;
      }

      if (this.activeMode !== mode) {
        this.viewModel.openDraw(mode, this.activeUnit);
        this.activeMode = mode;
      } else {
        this.viewModel.closeDraw();
        this.activeMode = null;
      }
    },

    updateUnit(unit) {
      this.viewModel.updateUnit(unit);
      this.activeUnit = unit;
      if (this.activeMode === 'draw_line_string') {
        this.activeDistanceUnit = unit;
      } else if (this.activeMode === 'draw_polygon') {
        this.activeAreaUnit = unit;
      }
    }
  },

  mounted() {
    this.activeDistanceUnit = this.distanceDefaultUnit;
    this.activeAreaUnit = this.areaDefaultUnit;
    this.changeSelectInputStyle();
  }
};
</script>
