<template>
  <sm-card
    v-show="isShow"
    :icon-class="iconClass"
    :icon-position="position"
    :header-name="headerName"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    class="sm-component-chart"
  >
    <v-chart
      :id="chartId"
      :ref="chartId"
      :options="_chartOptions"
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
import 'echarts';
import ECharts from 'vue-echarts';
import Control from '../../mapboxgl/_mixin/control';
import Card from '../../common/_mixin/card';
import Theme from '../../common/_mixin/theme';
import { chartThemeUtil } from '../../common/_utils/style/theme/chart';
import UniqueId from 'lodash.uniqueid';
import EchartsDataService from '../_utils/EchartsDataService';
import merge from 'lodash.merge';
import isEqual from 'lodash.isequal';

/**
 * @module Chart
 * @category Components
 * @desc Chart 组件。除了prop: dataset和datasetOptions，其他的所有prop,event,computed, methods都是ECharts的配置，参考https://echarts.baidu.com/api.html#echartsInstance.dispose
 * @vue-prop {String} [iconClass='sm-components-icons-attribute']  - 设置组件图标的类名。
 * @vue-prop {Object} [dataset=null] - 数据来源,支持的参数类型为iPortalDataParameter/RestDataParameter/RestMapParameter。
 * @vue-prop {Array} datasetOptions - 数据来源的配置。
 * @vue-prop {Array} [colorGroup] - 图表颜色数组。
 * @vue-prop {Object} theme - 当前 ECharts 实例使用的主题。
 * @vue-prop {Object} initOptions - 用来初始化 ECharts 实例。
 * @vue-prop {Object} options - ECharts 实例的数据。修改这个 prop 会触发 ECharts 实例的 setOption 方法。如果直接修改 options 绑定的数据而对象引用保持不变，setOption 方法调用时将带有参数 notMerge: false。否则，如果为 options 绑定一个新的对象，setOption 方法调用时则将带有参数 notMerge: true。
 * @vue-prop {Boolean} [autoresize = true] - 用来指定 ECharts 实例在组件根元素尺寸变化时是否需要自动进行重绘。
 * @vue-prop {String} group - 实例的分组，会自动绑定到 ECharts 组件的同名属性上。
 * @vue-prop {Boolean} [manualUpdate = false] - 在性能敏感（数据量很大）的场景下，我们最好对于 options prop 绕过 Vue 的响应式系统。当将 manual-update prop 指定为 true 且不传入 options prop 时，数据将不会被监听。然后，你需要用 ref 获取组件实例以后手动调用 mergeOptions 方法来更新图表。
 * @vue-computed {String} computedOptions - 用来读取 ECharts 更新内部 options 后的实际数据。
 * @vue-event {Object} legendselectchanged - 切换图例选中状态后的事件。
 * @vue-event {Object} legendselected - 图例选中后的事件。
 * @vue-event {Object} legendunselected - 图例取消选中后的事件。
 * @vue-event {Object} legendscroll - 图例滚动事件。
 * @vue-event {Object} datazoom - 数据区域缩放后的事件。
 * @vue-event {Object} datarangeselected - 视觉映射组件中，range 值改变后触发的事件。
 * @vue-event {Object} timelinechanged - 时间轴中的时间点改变后的事件。
 * @vue-event {Object} timelineplaychanged - 时间轴中播放状态的切换事件。
 * @vue-event {Object} restore - 重置 option 事件。
 * @vue-event {Object} dataviewchanged - 工具栏中数据视图的修改事件。
 * @vue-event {Object} magictypechanged - 工具栏中动态类型切换的切换事件。
 * @vue-event {Object} geoselectchanged - geo 中地图区域切换选中状态的事件。
 * @vue-event {Object} geoselected - geo 中地图区域选中后的事件。
 * @vue-event {Object} geounselected - geo 中地图区域取消选中后的事件。
 * @vue-event {Object} pieselectchanged - series-pie 中饼图扇形切换选中状态的事件。
 * @vue-event {Object} pieselected - series-pie 中饼图扇形选中后的事件。
 * @vue-event {Object} pieunselected - series-pie 中饼图扇形取消选中后的事件。
 * @vue-event {Object} mapselectchanged - series-map 中地图区域切换选中状态的事件。
 * @vue-event {Object} mapselected - series-map 中地图区域选中后的事件。
 * @vue-event {Object} mapunselected - series-map 中地图区域取消选中后的事件。
 * @vue-event {Object} axisareaselected - 平行坐标轴 (Parallel)范围选取事件。
 * @vue-event {Object} focusnodeadjacency - graph的邻接节点高亮事件。
 * @vue-event {Object} unfocusnodeadjacency - graph的邻接节点取消高亮事件。
 * @vue-event {Object} brush - 选框添加事件。即发出 brush action 得到的事件。
 * @vue-event {Object} brushselected - 对外通知当前选中了什么。
 * @vue-event {Object} rendered - 渲染结束事件
 * @vue-event {Object} finished - 渲染完成事件。当渲染动画
 * @vue-event {Object} click - 鼠标事件.click
 * @vue-event {Object} dblclick - 鼠标事件.dblclick
 * @vue-event {Object} mouseover - 鼠标事件.mouseover
 * @vue-event {Object} mouseout - 鼠标事件.mouseout
 * @vue-event {Object} mousemove - 鼠标事件.mousemove
 * @vue-event {Object} mousedown - 鼠标事件.mousedown
 * @vue-event {Object} mouseup - 鼠标事件.mouseup
 * @vue-event {Object} globalout - 鼠标事件.globalout
 * @vue-event {Object} contextmenu - 鼠标事件.contextmenu
 */
// 枚举事件类型
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
      default: 'sm-components-icons-attribute'
    },
    dataset: {
      type: Object,
      default() {
        return null;
      }
    },
    datasetOptions: {
      type: Array,
      default() {
        return null;
      }
    },
    colorGroup: {
      type: Array
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
      chartTheme: {}, // 图表的主题
      echartOptions: {}, // 最后生成的echart数据
      echartsDataService: null, // 请求数据的实例，保存请求回来的数据
      datasetChange: false, // dataset是否改变
      dataSeriesCache: {}
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
 
    _chartStyle() {
      return {
        width: '100%',
        height: this.headerName ? 'calc(100% - 30px)' : '100%'
      };
    },
    _chartOptions() {
      return (this._isRequestData && this.echartOptions) || this.options;
    },
    // 是否传入dataset和datasetOptions
    _isRequestData() {
      return (
        this.dataset && Object.keys(this.dataset).length > 0 && this.datasetOptions && this.datasetOptions.length > 0
      );
    }
  },
  watch: {
    theme() {
      this.chartTheme = null;
    },
    colorGroup(newVal, oldVal) {
      if (!isEqual(newVal, oldVal)) {
        if (!this.theme) {
          this.chartTheme = chartThemeUtil(this.backgroundData, this.textColorsData, this.colorGroup);
        }
      }
    },
    dataset: {
      handler: function(newVal, oldVal) {
        if (!isEqual(newVal, oldVal)) {
          this._isRequestData && this._setEchartOptions(this.dataset, this.datasetOptions, this.options);
          this.datasetChange = true;
        }
      },
      deep: true
    },
    datasetOptions: {
      handler: function(newVal, oldVal) {
        if (!isEqual(newVal, oldVal)) {
          !this.echartsDataService &&
            this._isRequestData &&
            this._setEchartOptions(this.dataset, this.datasetOptions, this.options);
          this.echartsDataService &&
            this.dataSeriesCache &&
            this._changeChartData(this.echartsDataService, this.datasetOptions, this.options);
        }
      }
    },
    options: {
      handler: function(newVal, oldVal) {
        if (!isEqual(newVal, oldVal)) {
          if (this.datasetChange && !this.dataSeriesCache) {
            return;
          }
          if (this.dataSeriesCache) {
            this.echartOptions = this._optionsHandler(this.options, this.dataSeriesCache);
          } else {
            this.echartOptions = Object.assign({}, this.options);
          }
        }
      },
      deep: true
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
  created() {
    this.chartTheme = chartThemeUtil(this.backgroundData, this.textColorsData, this.colorGroupsData);
    // 切换主题
    this.$on('themeStyleChanged', () => {
      this.chartTheme = chartThemeUtil(this.backgroundData, this.textColorsData, this.colorGroupsData);
    });
  },
  mounted() {
    // 设置echarts实例
    let chartId = this.chartId;
    this.smChart = this.$refs[chartId];

    // 派发echart所有事件
    let smChart = this._getEchart();
    EVENTS.forEach(event => {
      smChart.$on(event, params => {
        this.$emit(event, params);
      });
    });

    // 请求数据, 合并echartopiton, 设置echartOptions
    this._isRequestData && this._setEchartOptions(this.dataset, this.datasetOptions, this.options);
  },
  methods: {
    // 请求数据,设置echartOptions
    _setEchartOptions(dataset, datasetOptions, echartOptions) {
      this.echartsDataService = null;
      this.dataSeriesCache = null;
      this.showLoading('default', {
        text: '加载中',
        color: this.colorGroupsData[0],
        textColor: this.textColorsData,
        maskColor: 'rgba(0,0,0,0.8)',
        zlevel: 0
      });
      this.echartsDataService = new EchartsDataService(dataset, datasetOptions);
      this.echartsDataService.getDataOption().then(options => {
        this.hideLoading();
        // 缓存dataSeriesCache，请求后格式化成echart的数据
        this.dataSeriesCache = Object.assign({}, options);
        this.datasetChange = false;
        // 设置echartOptions
        this.echartOptions = this._optionsHandler(echartOptions, options);
      });
    },
    _optionsHandler(options, dataOptions) {
      if (options && options.xAxis && dataOptions.xAxis) {
        if (dataOptions.series.length === 0) {
          options.xAxis = [{}];
        } else if (!Array.isArray(options.xAxis)) {
          options.xAxis = [Object.assign({}, options.xAxis, dataOptions.xAxis[0])];
        }
      }
      if (options && options.series && dataOptions.series) {
        if (dataOptions.series.length === 0) {
          options.series = [];
        } else {
          options.series = dataOptions.series.map((element, index) => {
            return Object.assign({}, options.series[index] || {}, element);
          });
        }
      }
      if (options && options.radar && dataOptions.radar) {
        options.radar.indicator = Object.assign({}, dataOptions.radar.indicator || {});
      }
      return merge(JSON.parse(JSON.stringify(options)), dataOptions);
    },
    // 当datasetUrl不变，datasetOptions改变时
    _changeChartData(echartsDataService, datasetOptions, echartOptions) {
      let options = echartsDataService.formatChartData(datasetOptions);
      // 缓存dataSeriesCache，格式化成echart的数据
      this.dataSeriesCache = Object.assign({}, options);
      // 设置echartOptions
      this.echartOptions = Object.assign({}, echartOptions, options);
    },
    // 获取echart实例
    _getEchart() {
      return this.smChart;
    },
    // 以下全是同名调用echart的方法
    /**
     * 提供了一个更贴切的名称来描述 setOption 方法的实际行为。
     * @param {Object} options - 图表的配置项和数据
     * @param {Boolean} [notMerge = false] - 可选，是否不跟之前设置的 option 进行合并，默认为 false，即合并
     * @param {Boolean} [lazyUpdate = false] - 可选，阻止调用 setOption 时抛出事件，默认为 false，即抛出事件
     */
    mergeOptions(options, notMerge, lazyUpdate) {
      this._delegateMethod('mergeOptions', options, notMerge, lazyUpdate);
    },
    /**
     * 此接口用于，在大数据量（百万以上）的渲染场景，分片加载数据和增量渲染。
     * @param {Object} params - 数据配置
     */
    appendData(params) {
      this._delegateMethod('appendData', params);
    },
    /**
     * 此接口用于，改变图表尺寸，在容器大小发生改变时需要手动调用。
     * @param {Object} [options] - options可缺省。有下面几个可选项：width, height, silent
     */
    resize(options) {
      this._delegateMethod('resize', options);
    },
    /**
     * 此接口用于，触发图表行为。
     * @param {Object} payload - 参数可以通过batch属性同时触发多个行为。
     */
    dispatchAction(payload) {
      this._delegateMethod('dispatchAction', payload);
    },
    /**
     * 此接口用于，转换坐标系上的点到像素坐标值。
     * @param {Object} finder - 用于指示『在哪个坐标系或者系列上判断』。
     * @param {Array|string} value - 要被转换的值。
     */
    convertToPixel(finder, value) {
      return this._delegateMethod('convertToPixel', finder, value);
    },
    /**
     * 此接口用于，转换像素坐标值到逻辑坐标系上的点。是 convertToPixel 的逆运算。
     * @param {Object} finder - 用于指示『在哪个坐标系或者系列上判断』。
     * @param {Array|string} value - 要被转换的值。
     */
    convertFromPixel(finder, value) {
      return this._delegateMethod('convertFromPixel', finder, value);
    },
    /**
     * 此接口用于，判断给定的点是否在指定的坐标系或者系列上。
     * @param {Object} finder - 用于指示『在哪个坐标系或者系列上判断』。
     * @param {Array} value - 要被判断的点。
     */
    containPixel(finder, value) {
      return this._delegateMethod('containPixel', finder, value);
    },
    /**
     * 此接口用于，显示加载动画效果。可以在加载数据前手动调用该接口显示加载动画，在数据加载完成后调用 hideLoading 隐藏加载动画。
     * @param {Object} [type] - 可选，加载动画类型，目前只有一种'default'。
     * @param {Object} [options] - 可选，加载动画配置项，跟type有关。
     */
    showLoading(type, options) {
      this._delegateMethod('showLoading', type, options);
    },
    /**
     * 此接口用于，隐藏动画加载效果。
     */
    hideLoading() {
      this._delegateMethod('hideLoading');
    },
    /**
     * 此接口用于，导出图表图片，返回一个 base64 的 URL，可以设置为Image的src。
     * @param {Object} options - 导出配置
     */
    getDataURL(options) {
      return this._delegateMethod('getDataURL', options);
    },
    /**
     * 此接口用于，导出联动的图表图片，返回一个 base64 的 url，可以设置为Image的src。导出图片中每个图表的相对位置跟容器的相对位置有关。
     * @param {Object} options - 导出配置
     */
    getConnectedDataURL(options) {
      return this._delegateMethod('getConnectedDataURL', options);
    },
    /**
     * 此接口用于，清空当前实例，会移除实例中所有的组件和图表。清空后调用 getOption 方法返回一个{}空对象。
     */
    clear() {
      this._delegateMethod('clear');
    },
    /**
     * 此接口用于，销毁实例，销毁后实例无法再被使用。
     */
    dispose() {
      this._delegateMethod('dispose');
    },

    // 内部调用的方法
    _delegateMethod(name, ...args) {
      return this.smChart[name](...args);
    }
  },
  // echarts所有静态方法
  /**
   * @function connect
   * 多个图表实例实现联动。
   * @param {string|Array} group - group的id，或者图表实例的数组。
   */
  connect(group) {
    ECharts && ECharts.connect(group);
  },
  /**
   * 解除图表实例的联动，如果只需要移除单个实例，可以将通过将该图表实例 group 设为空。
   * @param {string} group - group的id。
   */
  disconnect(group) {
    ECharts && ECharts.disConnect(group);
  },
  /**
   * 注册可用的地图，必须在包括 geo 组件或者 map 图表类型的时候才能使用。
   * @param {string} mapName - 地图名称，在 geo 组件或者 map 图表类型中设置的 map 对应的就是该值。
   * @param {Object} geoJSON - GeoJson 格式的数据，具体格式见 http://geojson.org/。
   * @param {Object} [specialAreas] - 可选。将地图中的部分区域缩放到合适的位置，可以使得整个地图的显示更加好看。
   */
  registerMap(mapName, geoJSON, specialAreas) {
    ECharts && ECharts.registerMap(mapName, geoJSON, specialAreas);
  },
  /**
   * 注册主题，用于初始化实例的时候指定。
   * @param {string} name - 主题命名。
   * @param {Object} theme - 主题配置。
   */
  registerTheme(name, theme) {
    ECharts && ECharts.registerTheme(name, theme);
  },
  /**
   * @desc 图形相关帮助方法。
   */
  graphic: ECharts && ECharts.graphic
};
</script>
