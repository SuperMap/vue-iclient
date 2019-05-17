<template>
  <sm-card
    v-show="isShow"
    :icon-class="iconClass"
    :icon-position="position"
    :header-name="headerName"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    class="sm-widget-chart"
  >
    <v-chart
      :id="chartId"
      :ref="chartId"
      :options="options"
      :autoresize="autoresize"
      :initOptions="initOptions"
      :group="group"
      :manual-update="manualUpdate"
      :theme="theme || chartTheme"
      :style="_chartStyle"
    />
  </sm-card>
</template>
<script>
import ECharts from 'vue-echarts';
// import 'echarts/lib/chart/bar';
// import 'echarts/lib/component/tooltip';
// import 'echarts/lib/component/legend';

import Control from '../mixin/control';
import Card from '../mixin/card';
import Theme from '../mixin/theme';
import { chartThemeUtil } from '../../style/theme/chart';
import UniqueId from 'lodash.uniqueid';

/**
 * @module SmChart
 * @category Components
 * @desc Chart微件。对接 iPortal/Online 地图类。目前支持地图坐标系包括：'EPSG:3857'，'EPSG:4326'，'EPSG:4490'，'EPSG:4214'，'EPSG:4610'。
 * @vue-prop {Object} initOptions - 用来初始化 ECharts 实例。
 * @vue-prop {Object} theme - 当前 ECharts 实例使用的主题。
 * @vue-prop {Object} options - ECharts 实例的数据。修改这个 prop 会触发 ECharts 实例的 setOption 方法。如果直接修改 options 绑定的数据而对象引用保持不变，setOption 方法调用时将带有参数 notMerge: false。否则，如果为 options 绑定一个新的对象，setOption 方法调用时则将带有参数 notMerge: true。
 * @vue-prop {Boolean} [autoresize = true] - 这个 prop 用来指定 ECharts 实例在组件根元素尺寸变化时是否需要自动进行重绘。
 * @vue-prop {String} group - 实例的分组，会自动绑定到 ECharts 组件的同名属性上。
 * @vue-prop {Boolean} [manualUpdate = false] - 在性能敏感（数据量很大）的场景下，我们最好对于 options prop 绕过 Vue 的响应式系统。当将 manual-update prop 指定为 true 且不传入 options prop 时，数据将不会被监听。然后，你需要用 ref 获取组件实例以后手动调用 mergeOptions 方法来更新图表。
 * @vue-computed {String} width[只读] - 用来获取 ECharts 实例的当前宽度。
 * @vue-computed {String} height[只读] - 用来获取 ECharts 实例的当前高度。
 * @vue-computed {String} computedOptions[只读] - 用来读取 ECharts 更新内部 options 后的实际数据。
 * @vue-event {Object} legendselectchanged - Emit 。
 */
// enumerating ECharts events for now
const EVENTS = [
  'legendselectchanged',
  'legendselected',
  'legendunselected',
  'legendscroll',
  'datazoom',
  'datarangeselected',
  'timelinechanged',
  'timelineplaychanged',
  'restore',
  'dataviewchanged',
  'magictypechanged',
  'geoselectchanged',
  'geoselected',
  'geounselected',
  'pieselectchanged',
  'pieselected',
  'pieunselected',
  'mapselectchanged',
  'mapselected',
  'mapunselected',
  'axisareaselected',
  'focusnodeadjacency',
  'unfocusnodeadjacency',
  'brush',
  'brushselected',
  'rendered',
  'finished',
  'click',
  'dblclick',
  'mouseover',
  'mouseout',
  'mousemove',
  'mousedown',
  'mouseup',
  'globalout',
  'contextmenu'
];
export default {
  name: 'SmChart',
  components: {
    'v-chart': ECharts
  },
  mixins: [Control, Theme, Card],
  props: {
    iconClass: {
      type: String,
      default: 'smwidgets-icons-attribute'
    },
    options: {
      type: Object,
      default() {
        return {};
      }
    },
    autoresize: {
      type: Boolean,
      default: true
    },
    theme: {
      type: [Object, String]
    },
    initOptions: {
      type: Object
    },
    group: {
      type: String
    },
    manualUpdate: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      chartId: UniqueId(`${this.$options.name.toLowerCase()}-`),
      smChart: null, // echarts实例
      chartTheme: chartThemeUtil()
    };
  },
  computed: {
    width() {
      return this.smChart && this.smChart.width;
    },
    height() {
      return this.smChart && this.smChart.height;
    },
    computedOptions() {
      return this.smChart && this.smChart.computedOptions;
    },
    // 内部调用的方法
    _chartStyle() {
      return {
        width: '100%',
        height: this.headerName ? '90%' : '100%'
      };
    }
  },
  watch: {
    theme() {
      this.chartTheme = null;
    },
    // 以下为echart的配置参数
    width() {
      return this.smChart && this.smChart.width;
    },
    height() {
      return this.smChart && this.smChart.height;
    },
    computedOptions() {
      return this.smChart && this.smChart.computedOptions;
    }
  },
  mounted() {
    // 设置echarts实例
    let chartId = this.chartId;
    this.smChart = this.$refs[chartId];

    // 派发echart所有事件
    let smChart = this.getEchart();
    EVENTS.forEach(event => {
      smChart.$on(event, params => {
        this.$emit(event, params);
      });
    });

    // 切换主题
    this.$on('themeStyle', () => {
      this.chartTheme = chartThemeUtil(this.backgroundData, this.textColorsData, this.colorGroupsData);
    });
  },
  methods: {
    getEchart() {
      return this.smChart;
    },
    // 以下全是同名调用echart的方法
    mergeOptions(options, notMerge, lazyUpdate) {
      this._delegateMethod('mergeOptions', options, notMerge, lazyUpdate);
    },
    appendData(params) {
      this._delegateMethod('appendData', params);
    },
    resize(options) {
      this._delegateMethod('resize', options);
    },
    dispatchAction(payload) {
      this._delegateMethod('dispatchAction', payload);
    },
    convertToPixel(finder, value) {
      return this._delegateMethod('convertToPixel', finder, value);
    },
    convertFromPixel(finder, value) {
      return this._delegateMethod('convertFromPixel', finder, value);
    },
    containPixel(finder, value) {
      return this._delegateMethod('containPixel', finder, value);
    },
    showLoading(type, options) {
      this._delegateMethod('showLoading', type, options);
    },
    hideLoading() {
      this._delegateMethod('hideLoading');
    },
    getDataURL(options) {
      return this._delegateMethod('getDataURL', options);
    },
    getConnectedDataURL(options) {
      return this._delegateMethod('getConnectedDataURL', options);
    },
    clear() {
      this._delegateMethod('clear');
    },
    dispose() {
      this._delegateMethod('dispose');
    },
    // 内部调用的方法
    _delegateMethod(name, ...args) {
      return this.smChart[name](...args);
    }
  },
  // echarts所有静态方法
  connect(group) {
    ECharts.connect(group);
  },
  disconnect(group) {
    ECharts.disConnect(group);
  },
  registerMap(mapName, geoJSON, specialAreas) {
    ECharts.registerMap(mapName, geoJSON, specialAreas);
  },
  registerTheme(name, theme) {
    ECharts.registerTheme(name, theme);
  },
  graphic: ECharts.graphic
};
</script>
