<template>
  <div class="sm-measure">
    <div class="sm-measure__panel">
      <div class="sm-measure__panelTitle">
        <i class="el-icon-edit sm-measure__logoIcon sm-measure__icon"></i>
        <span class="sm-measure__title">地图量算</span>
      </div>
      <div class="sm-measure__panelContent">
        <span
          :class="{'sm-measure__modeIcon': true, 'sm-measure__iconActive': activeMode === 'distance'}"
          title="测距离"
          @click="checkMeasureMode('distance')"
        >
          <i class="el-icon-edit-outline"></i>
        </span>
        <span
          :class="{'sm-measure__modeIcon': true, 'sm-measure__iconActive': activeMode === 'area'}"
          title="测面积"
          @click="checkMeasureMode('area')"
        >
          <i class="el-icon-news"></i>
        </span>
        <el-select
          v-model="activeUnit"
          placeholder="请选择"
          size="mini"
          class="sm-measure__unit"
          v-show="isShowUnitOptions && activeMode"
        >
          <el-option v-for="value in getUnitOptions" :key="value" :label="value" :value="value"></el-option>
        </el-select>
        <div v-show="!isShowUnitOptions && activeMode" class="sm-measure__unit sm-measure__default">{{getDefaultUnit}}</div>
      </div>
      <div class="sm-measure__calculateResult">
        <div class="sm-measure__calcuTitle">测量结果</div>
        <div class="sm-measure__result">xxxxx</div>
      </div>
    </div>
  </div>
</template>

<script>
import Widget from './Widget';

export default {
  name: 'SmMeasure',
  extends: Widget,
  props: {
    iconClass: {
      type: String,
      default: 'el-icon-edit'
    },
    isShowUnitOptions: {
      // 配置单位选择框是否显示，若不显示，则显示对应的默认单位
      type: Boolean,
      default: false
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
    return {
      unitOptions: {
        distance: ['kilometers', 'miles', 'degrees', 'radians'],
        area: ['meters']
      },
      activeMode: '',
      activeUnit: '',
      draw: null
    };
  },
  computed: {
    getUnitOptions() {
      return this.unitOptions[this.activeMode] || [];
    },
    getDefaultUnit() {
      return this.activeMode === 'distance'
        ? this.distanceDefaultUnit
        : this.areaDefaultUnit;
    }
  },
  loaded() {
    this.draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        line_string: true,
        trash: true
      }
    });
    this.map.on('draw.create', this.measureDistance);
  },
  methods: {
    checkMeasureMode(mode) {
      this.activeMode = mode;
      this.activeUnit = this.getUnitOptions[0];
      // todo 根据mode绘画线或者距离
    },
    measureDistance(e) {
      // todo 实时显示结果
      console.log(111);
    }
  }
};
</script>

<style scoped>
</style>
