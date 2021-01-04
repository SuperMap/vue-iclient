<template>
  <sm-collapse-card
    v-show="isShow"
    :icon-class="iconClass"
    :icon-position="position"
    :header-name="headerName"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :split-line="splitLine"
    class="sm-component-chart"
  >
    <v-chart
      :id="chartId"
      :ref="chartId"
      :options="_chartOptions"
      :initOptions="initOptions"
      :group="group"
      :manual-update="manualUpdate"
      :theme="theme || chartTheme"
      :style="_chartStyle"
      @datazoom="dataZoomHandler"
    />
    <TablePopup
      v-show="false"
      ref="chartTablePopup"
      v-bind="tablePopupProps"
      :split-line="splitLine"
      :text-color="textColor"
      :background="background"
    />
  </sm-collapse-card>
</template>
<script>
import 'echarts';
import ECharts from 'vue-echarts';
import UniqueId from 'lodash.uniqueid';
import merge from 'lodash.merge';
import isEqual from 'lodash.isequal';
import debounce from 'lodash/debounce';
import cloneDeep from 'lodash.clonedeep';
import Card from '../_mixin/Card';
import Theme from '../_mixin/Theme';
import Timer from '../_mixin/Timer';
import { chartThemeUtil, handleMultiGradient, getMultiColorGroup } from '../_utils/style/theme/chart';
import EchartsDataService from '../_utils/EchartsDataService';
import TablePopup from '../table-popup/TablePopup';
import { getFeatureCenter, getColorWithOpacity, setPopupArrowStyle } from '../_utils/util';
import { addListener, removeListener } from 'resize-detector';

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
  components: {
    'v-chart': ECharts,
    TablePopup
  },
  mixins: [Theme, Card, Timer],
  props: {
    iconClass: {
      type: String,
      default: 'sm-components-icon-chart'
    },
    collapsed: {
      type: Boolean,
      default: true
    },
    splitLine: {
      type: Boolean,
      default: false
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
    },
    autoPlay: {
      type: Boolean,
      default: false
    },
    associatedMap: {
      type: Boolean,
      default: false
    },
    highlightOptions: {
      type: Array,
      default() {
        return [];
      }
    },
    highlightColor: {
      type: String,
      default: '#01ffff'
    }
  },
  data() {
    return {
      chartId: UniqueId(`${this.$options.name.toLowerCase()}-`),
      chartTheme: {}, // 图表的主题
      echartOptions: {}, // 最后生成的echart数据
      datasetChange: false, // dataset是否改变
      dataSeriesCache: {},
      tablePopupProps: {},
      startSpin: null,
      customSeries: [],
      dataZoomHandler: function() {}
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
    parseOptions() {
      if (!this.options.series) {
        return this.options;
      }
      if (this.options.series.find(item => item.type === '2.5Bar')) {
        return {
          ...this.options,
          series: []
        };
      }
      if (this.options.series[0] && this.options.series[0].customType === 'customRingsSeries') {
        return {
          ...this.options,
          series: [...this.options.series, ...this.customSeries]
        };
      }
      let series = this.options.series.map((serie, index) => {
        if (serie.label) {
          let cloneSerie = cloneDeep(serie);
          cloneSerie.label.normal = this._controlLabel(cloneSerie.label.normal, cloneSerie.maxLabels);
          return cloneSerie;
        }
        return serie;
      });
      return {
        ...this.options,
        series
      };
    },
    _chartOptions() {
      return (this._isRequestData && this.echartOptions) || this.parseOptions;
    },
    // 是否传入dataset和datasetOptions
    _isRequestData() {
      return (
        this.dataset &&
        Object.keys(this.dataset).length > 0 &&
        (this.dataset.url || this.dataset.geoJSON) &&
        this.datasetOptions &&
        this.datasetOptions.length > 0
      );
    },
    xBar() {
      return this.options && this.options.yAxis && this.options.yAxis.type === 'category';
    },
    colorNumber() {
      let length =
        (this.datasetOptions && this.datasetOptions.length) ||
        (this.echartOptions.series && this.echartOptions.series.length);
      let colorNumber = this.colorGroupsData.length;
      if (length && length > colorNumber) {
        colorNumber = length;
      }
      return colorNumber;
    }
  },
  watch: {
    theme() {
      this.chartTheme = null;
    },
    colorGroupsData(newVal, oldVal) {
      if (!isEqual(newVal, oldVal)) {
        this._setChartTheme();
      }
    },
    textColorsData(newVal, oldVal) {
      if (!isEqual(newVal, oldVal)) {
        this._setChartTheme();
      }
    },
    getBackground(newVal, oldVal) {
      if (!isEqual(newVal, oldVal)) {
        this._setChartTheme();
      }
    },
    dataset: {
      handler: function(newVal, oldVal) {
        this._isRequestData && this._setEchartOptions(this.dataset, this.datasetOptions, this.options);
        this.datasetChange = true;
      },
      deep: true
    },
    datasetOptions: {
      handler: function(newVal, oldVal) {
        if (!isEqual(newVal, oldVal)) {
          this._setChartTheme();
          this.registerShape();
        }
        !this.echartsDataService &&
          this._isRequestData &&
          this._setEchartOptions(this.dataset, this.datasetOptions, this.options);
        this.echartsDataService && this.echartsDataService.setDatasetOptions(this.datasetOptions);
        this.echartsDataService &&
          this.dataSeriesCache &&
          this._changeChartData(this.echartsDataService, this.datasetOptions, this.options);
      }
    },
    options: {
      handler: function(newVal, oldVal) {
        if (this.datasetChange && !this.dataSeriesCache) {
          return;
        }
        if (this.dataSeriesCache && JSON.stringify(this.dataSeriesCache) !== '{}') {
          this.echartOptions = this._optionsHandler(this.options, this.dataSeriesCache);
        } else {
          this.echartOptions = Object.assign({}, this.parseOptions);
        }
      },
      deep: true
    },
    autoresize() {
      if (this.autoresize) {
        addListener(this.$el, this.__resizeHandler);
      } else {
        removeListener(this.$el, this.__resizeHandler);
      }
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
    },
    autoPlay() {
      this._handlePieAutoPlay();
    },
    associatedMap() {
      if (!this.associatedMap) {
        this.clearPopup && this.clearPopup();
      }
    },
    highlightOptions: {
      handler(newVal, oldVal) {
        this.setItemStyleColor();
      },
      deep: true
    }
  },
  created() {
    this._setChartTheme();
    // // 切换主题
    // this.$on('theme-style-changed', () => {
    //   this._setChartTheme();
    // });
    this.registerShape();
  },
  mounted() {
    // 设置echarts实例
    this.smChart = this.$refs[this.chartId];
    // 派发echart所有事件
    let smChart = this._getEchart();
    const self = this;
    EVENTS.forEach(event => {
      smChart.$on(event, params => {
        if (event === 'click') {
          self.handleChartClick(params);
        }
        self.$emit(event, params);
      });
    });
    this._initAutoResize();
    this._initDataZoom();
    if (this.options.series && this.options.series[0] && this.options.series[0].customType === 'customRingsSeries') {
      this.startEffect();
    }
    !this._isRequestData && this.autoPlay && this._handlePieAutoPlay();
    // 请求数据, 合并echartopiton, 设置echartOptions
    this._isRequestData && this._setEchartOptions(this.dataset, this.datasetOptions, this.options);
  },
  updated() {
    this._handlePieAutoPlay(); // 更新自动播放
  },
  beforeDestroy() {
    clearInterval(this.pieAutoPlay); // clear 自动播放
    clearInterval(this.startAngle);
    if (this.autoresize) {
      removeListener(this.$el, this.__resizeHandler);
    }
  },
  methods: {
    _initAutoResize() {
      this.__resizeHandler = debounce(
        () => {
          this.resize();
        },
        100,
        { leading: true }
      );
      if (this.autoresize) {
        // @ts-ignore
        addListener(this.$el, this.__resizeHandler);
      }
    },
    _initDataZoom() {
      this.dataZoomHandler = debounce(
        () => {
          this._dataZoomChanged();
        },
        500,
        { leading: true }
      );
    },
    getStringColor(color) {
      if (color instanceof Object) {
        return ((color.colorStops || [])[0] || {}).color;
      }
      return color;
    },
    setGradientColor(color, nextColor) {
      if (typeof color === 'string') {
        return new this.$options.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color },
          { offset: 1, color: nextColor || color }
        ]);
      }
      return color;
    },
    _initAxisLabel(axisLabel, data, visualMap, series) {
      if (!this.xBar) {
        return;
      }
      const sortSeriesIndex = this.datasetOptions.findIndex(item => item.sort !== 'unsort' && item.rankLabel);
      if (sortSeriesIndex > -1 && axisLabel && data) {
        for (let index = 0, len = data.length, rankIndex = len - 1; index < len; index++, rankIndex--) {
          data[index] = rankIndex < 10 ? `0${rankIndex}${data[index]}` : `${rankIndex}${data[index]}`;
        }
        const firstVisualMap = visualMap && visualMap.find(item => item.seriesIndex === sortSeriesIndex);
        axisLabel.rich = axisLabel.rich || {};
        axisLabel.rich.default = {
          backgroundColor: this.getStringColor(this.colorGroup[sortSeriesIndex]),
          width: 20,
          height: 20,
          align: 'center',
          borderRadius: 2
        };
        firstVisualMap &&
          firstVisualMap.pieces.map(item => {
            axisLabel.rich[`${parseInt(item.min)}_${parseInt(item.max)}`] = {
              backgroundColor: item.color,
              width: 20,
              height: 20,
              align: 'center',
              borderRadius: 2
            };
          });
        const serieData = series && series[sortSeriesIndex].data;
        axisLabel.formatter = function(label, index) {
          const orderNum = parseInt(label.slice(0, 2)) + 1;
          const leftLabel = label.slice(2);
          const labelValue = serieData && +serieData[index];
          if (firstVisualMap) {
            const matchItem = firstVisualMap.pieces.find(item => labelValue >= item.min && labelValue <= item.max);
            if (matchItem) {
              return [`{${parseInt(matchItem.min)}_${parseInt(matchItem.max)}|${orderNum}}  ${leftLabel}`].join('\n');
            }
          }
          return [`{default|${orderNum}}  ${leftLabel}`].join('\n');
        };
      }
    },
    setItemStyleColor(isSet = true, series, highlightOptions = this.highlightOptions, color = this.highlightColor) {
      series = series || cloneDeep(this.echartOptions && this.echartOptions.series) || [];
      series.forEach((serie, seriesIndex) => {
        const dataIndexs = highlightOptions.map(item => {
          if (item.seriesIndex && item.seriesIndex.includes(seriesIndex)) {
            return item.dataIndex;
          }
        });
        const colors = highlightOptions.map(item => {
          if (item.seriesIndex && item.seriesIndex.includes(seriesIndex)) {
            return item.color || color;
          }
        });
        const serieColor =
          this.options.series &&
          this.options.series[seriesIndex] &&
          this.options.series[seriesIndex].itemStyle &&
          this.options.series[seriesIndex].itemStyle.color;
        serie.itemStyle = serie.itemStyle || { color: '' };
        serie.itemStyle.color = ({ dataIndex }) => {
          const index = dataIndexs.indexOf(dataIndex);
          if (index > -1) {
            return colors[index];
          } else if (serie.type === 'pie') {
            let colorGroup = this._handlerColorGroup(serie.data.length);
            return colorGroup[dataIndex];
          } else {
            return serieColor;
          }
        };
      });
      isSet && this.$set(this.echartOptions, 'series', series);
    },
    _handlePieAutoPlay() {
      let seriesType = this._chartOptions.series && this._chartOptions.series[0] && this._chartOptions.series[0].type;
      let echartsNode = this.smChart.chart;
      if (
        this._chartOptions.legend &&
        this._chartOptions.legend.data &&
        this._chartOptions.legend.data.length &&
        echartsNode &&
        seriesType === 'pie'
      ) {
        this.clearPieAutoPlay(echartsNode);
        if (this.autoPlay) {
          this.setPieAutoPlay(echartsNode);
        }
      }
    },
    setPieAutoPlay(echartsNode) {
      let i = -1;
      this.pieAutoPlay = setInterval(() => {
        echartsNode.dispatchAction({
          type: 'downplay',
          seriesIndex: 0,
          dataIndex: i
        });
        i++;
        if (i >= this._chartOptions.legend.data.length) {
          i = 0;
        }
        echartsNode.dispatchAction({
          type: 'highlight',
          seriesIndex: 0,
          dataIndex: i
        });
      }, 2000);
    },
    clearPieAutoPlay(echartsNode) {
      clearInterval(this.pieAutoPlay);
      for (let i = 0; i < this._chartOptions.legend.data.length; i++) {
        echartsNode.dispatchAction({
          type: 'downplay',
          seriesIndex: 0,
          dataIndex: i
        });
      }
    },
    timing() {
      this.echartsDataService &&
        this.echartsDataService.getDataOption(this.dataset, this.xBar).then(options => {
          this.hideLoading();
          // 缓存dataSeriesCache，请求后格式化成echart的数据
          this.dataSeriesCache = Object.assign({}, options);
          this.datasetChange = false;
          // 设置echartOptions
          this.echartOptions = this._optionsHandler(this.options, options);
        });
    },
    // 请求数据,设置echartOptions
    _setEchartOptions(dataset, datasetOptions, echartOptions) {
      this.echartsDataService = null;
      this.dataSeriesCache = null;
      if (this.dataset.type !== 'geoJSON') {
        this.showLoading('default', {
          text: this.$t('info.loading'),
          color: this.colorGroupsData[0],
          textColor: this.textColorsData,
          maskColor: 'rgba(0,0,0,0.8)',
          zlevel: 0
        });
      }
      this.echartsDataService = new EchartsDataService(dataset, datasetOptions);
      this.echartsDataService.getDataOption(dataset, this.xBar).then(options => {
        this.hideLoading();
        // 缓存dataSeriesCache，请求后格式化成echart的数据
        this.dataSeriesCache = Object.assign({}, options);
        this.datasetChange = false;
        // 设置echartOptions
        this.echartOptions = this._optionsHandler(echartOptions, options);
      });
    },
    _optionsHandler(options, dataOptions, dataZoomChanged) {
      dataOptions = dataOptions && cloneDeep(dataOptions); // clone 避免引起重复刷新
      options = options && cloneDeep(options); // clone 避免引起重复刷新
      let extraSeries = [];
      if (options && options.legend && !options.legend.type) {
        options.legend.type = 'scroll';
      }
      let yAxis = options.yAxis;
      let xAxis = options.xAxis;
      if (xAxis && dataOptions.xAxis) {
        let axis = xAxis;
        let axisData = dataOptions.xAxis[0];
        let type = 'xAxis';
        if (yAxis && yAxis.type === 'category') {
          // 处理条形图
          type = 'yAxis';
          axis = yAxis;
          dataOptions.yAxis = dataOptions.xAxis;
          delete dataOptions.xAxis;
          this._initAxisLabel(yAxis.axisLabel, dataOptions.yAxis[0].data, options.visualMap, dataOptions.series);
        }
        if (dataOptions.series.length === 0) {
          axis = [{}];
        } else if (!Array.isArray(axis)) {
          if (axisData.data && axisData.data.length) {
            axis.data = [];
          }
          axis = [Object.assign({}, axisData, axis)];
        }
        options[type] = axis;
      }
      if (options && options.series && dataOptions.series) {
        if (dataOptions.series.length === 0) {
          options.series = [];
        } else {
          options.series = options.series.map((element, index) => {
            return Object.assign({}, element, dataOptions.series[index] || {});
          });
          const dataZoom = options.dataZoom && options.dataZoom[0];
          options.series = options.series.map((serie, index) => {
            let label = serie.label && serie.label.normal;
            if (label && !label.smart) {
              serie.label.normal = this._controlLabel(label, serie.maxLabels);
            }
            if (label && label.show && label.smart) {
              label.position = label.position || 'top';
              let data = serie.data || [];
              let startDataIndex = 0;
              let endDataIndex = data.length > 0 ? data.length - 1 : 0;
              if (dataZoom && dataZoom.show !== false) {
                if (dataZoom.start > dataZoom.end) {
                  let oldStart = dataZoom.start;
                  dataZoom.start = dataZoom.end;
                  dataZoom.end = oldStart;
                }
                if (dataZoomChanged) {
                  let { startValue, endValue } = this.smChart.chart.getOption().dataZoom[0] || {};
                  startDataIndex = startValue;
                  endDataIndex = endValue;
                  options.dataZoom = options.dataZoom.map(val => {
                    if (startValue >= 0 && endValue >= 0) {
                      val.startValue = startValue;
                      val.endValue = endValue;
                      delete val.start;
                      delete val.end;
                      return val;
                    }
                    return val;
                  });
                } else {
                  startDataIndex = Math.floor((dataZoom.start / 100) * data.length);
                  endDataIndex = Math.ceil((dataZoom.end / 100) * data.length);
                }
                data = serie.data.slice(startDataIndex, endDataIndex + 1);
              }

              label.formatter = function({ dataIndex, value }) {
                let result = '';
                if (
                  dataIndex === startDataIndex ||
                  dataIndex === endDataIndex ||
                  Math.max.apply(null, data) + '' === value + ''
                ) {
                  result = value;
                }
                return result;
              };
            } else if (serie && serie.type !== 'pie' && serie.type !== 'radar') {
              const colorGroup = getMultiColorGroup(this.colorGroupsData, this.colorNumber);
              if (serie.type === '2.5Bar') {
                const shape = serie.shape;
                const defaultColor = serie.itemStyle && serie.itemStyle.color;
                if (['square', 'rectangle'].includes(shape)) {
                  const cubeType = shape;
                  serie.type = 'custom';
                  dataOptions.series[index] && (dataOptions.series[index].type = 'custom');
                  const _this = this;
                  serie.renderItem = (params, api) => {
                    const location = api.coord([api.value(0), api.value(1)]);
                    let fillColor = defaultColor || colorGroup[params.seriesIndex];
                    if (_this.highlightOptions && _this.highlightOptions.length > 0) {
                      const matchData = _this.highlightOptions.find(
                        item => item.seriesIndex.includes(params.seriesIndex) && item.dataIndex === params.dataIndex
                      );
                      if (matchData && (matchData.color || _this.highlightColor)) {
                        fillColor = matchData.color || _this.highlightColor;
                      }
                    }
                    let leftColor, rightColor, topColor;
                    if (typeof fillColor === 'object') {
                      const copyLeftColor = cloneDeep(fillColor);
                      const copyRightColor = cloneDeep(fillColor);
                      const copyTopColor = cloneDeep(fillColor);
                      copyLeftColor.colorStops[0].color = getColorWithOpacity(copyLeftColor.colorStops[0].color, 0.4);
                      copyLeftColor.colorStops[1].color = getColorWithOpacity(copyLeftColor.colorStops[1].color, 0.4);
                      copyRightColor.colorStops[0].color = getColorWithOpacity(copyRightColor.colorStops[0].color, 0.7);
                      copyRightColor.colorStops[1].color = getColorWithOpacity(copyRightColor.colorStops[1].color, 0.7);
                      copyTopColor.colorStops[0].color = getColorWithOpacity(copyTopColor.colorStops[0].color, 0.85);
                      copyTopColor.colorStops[1].color = getColorWithOpacity(copyTopColor.colorStops[1].color, 0.85);
                      leftColor = copyLeftColor;
                      rightColor = copyRightColor;
                      topColor = copyTopColor;
                    } else {
                      leftColor = getColorWithOpacity(fillColor, 0.4);
                      rightColor = getColorWithOpacity(fillColor, 0.7);
                      topColor = getColorWithOpacity(fillColor, 0.85);
                    }
                    return {
                      type: 'group',
                      children: [
                        {
                          type: `Cube${cubeType}Left`,
                          shape: {
                            api,
                            xValue: api.value(0),
                            yValue: api.value(1),
                            x: location[0],
                            y: location[1],
                            xAxisPoint: api.coord([api.value(0), 0])
                          },
                          style: {
                            fill: leftColor
                          }
                        },
                        {
                          type: `Cube${cubeType}Right`,
                          shape: {
                            api,
                            xValue: api.value(0),
                            yValue: api.value(1),
                            x: location[0],
                            y: location[1],
                            xAxisPoint: api.coord([api.value(0), 0])
                          },
                          style: {
                            fill: rightColor
                          }
                        },
                        {
                          type: `Cube${cubeType}Top`,
                          shape: {
                            api,
                            xValue: api.value(0),
                            yValue: api.value(1),
                            x: location[0],
                            y: location[1],
                            xAxisPoint: api.coord([api.value(0), 0])
                          },
                          style: {
                            fill: topColor
                          }
                        }
                      ]
                    };
                  };
                } else if (shape === 'cylinder') {
                  const baseWidth = '100%';
                  const nextSerieDatas = dataOptions.series[index + 1] && dataOptions.series[index + 1].data;
                  serie.type = 'bar';
                  serie.barGap = '-100%';
                  options.tooltip && options.tooltip.trigger === 'axis' && (options.tooltip.trigger = 'item');
                  dataOptions.series[index] && (dataOptions.series[index].type = 'bar');
                  let cirCleColor = defaultColor || colorGroup[index];
                  let cirCleColorFnList = [];
                  if (typeof cirCleColor === 'string') {
                    cirCleColor = this.setGradientColor(cirCleColor, '#fff');
                  }
                  if (this.highlightOptions && this.highlightOptions.length > 0) {
                    const matchDataList = [];
                    this.highlightOptions.forEach(item => {
                      if (item.seriesIndex.includes(index)) {
                        let color = item.color || this.highlightColor;
                        if (typeof color === 'string') {
                          color = this.setGradientColor(color, '#fff');
                        }
                        matchDataList.push({ dataIndex: item.dataIndex, color });
                      }
                    });
                    if (matchDataList.length > 0) {
                      cirCleColorFnList = ['topCirCleColorFn', 'bottomCirCleColorFn'].map(item => {
                        return ({ dataIndex }) => {
                          const matchData = matchDataList.find(item => item.dataIndex === dataIndex);
                          return matchData ? matchData.color : cirCleColor;
                        };
                      });
                    }
                  }
                  extraSeries.push(
                    // 头部的圆片
                    {
                      name: '',
                      type: 'pictorialBar',
                      symbolOffset: [0, -8],
                      symbolPosition: 'end',
                      z: 12,
                      itemStyle: {
                        normal: {
                          color: cirCleColorFnList[0] || cirCleColor
                        }
                      },
                      data: dataOptions.series[index].data.map((item, dataIndex) => {
                        return {
                          value: item,
                          symbolSize:
                            !nextSerieDatas || (nextSerieDatas[dataIndex] && +item >= +nextSerieDatas[dataIndex])
                              ? [baseWidth, 15]
                              : [0, 15]
                        };
                      })
                    },
                    {
                      // 底部的圆片
                      name: '',
                      type: 'pictorialBar',
                      symbolSize: [baseWidth, 10],
                      symbolOffset: [0, 5],
                      z: 12,
                      itemStyle: {
                        normal: {
                          color: cirCleColorFnList[1] || cirCleColor
                        }
                      },
                      data: dataOptions.series[index].data
                    }
                  );
                }
                delete serie.shape;
              }
            }
            return serie;
          });
          // 玫瑰图多个选中
          if (options.series[0].type === 'pie' && options.series[0].roseType) {
            options.series = options.series.map(serie => {
              if (!serie.roseType) {
                serie.roseType = options.series[0].roseType;
              }
              return serie;
            });
          }
          // pie的图例需要一个扇形是一个图例
          if (options.legend && options.series.length > 0 && options.series[0].type === 'pie') {
            options.legend.data = [];
            options.series.forEach(element => {
              if (element.data) {
                options.legend.data.push(
                  ...element.data.map(item => {
                    return item.name;
                  })
                );
              }
            });
          }
        }
      }
      if (options && options.radar && dataOptions.radar) {
        options.radar.indicator = Object.assign({}, dataOptions.radar.indicator || {});
      }

      let series = dataOptions.series;
      let isRingShine = options.series && options.series[0] && options.series[0].outerGap >= 0;
      if (series && series.length && series[0].type === 'pie') {
        this.setItemStyleColor(false, series);
      }
      if (isRingShine) {
        dataOptions.series = this._createRingShineSeries(series, options.series);
      }
      if (this.highlightOptions && this.highlightOptions.length > 0) {
        if (isRingShine) {
          dataOptions.series = this._createRingShineHighlight(series, this.highlightOptions);
        } else {
          this.setItemStyleColor(true, series);
        }
      }
      const mergeOptions = merge(options, dataOptions);
      if (extraSeries.length > 0) {
        mergeOptions.series.push(...extraSeries);
      }
      return mergeOptions;
    },
    _createRingShineSeries(series, optionsSeries) {
      if (optionsSeries) {
        this.datasetOptions.forEach((datasetOption, index) => {
          let { type, outerGap, isShine } = optionsSeries[index] || {};
          if (type === 'pie' && outerGap >= 0) {
            const data = series[index].data.map(val => val.value);
            outerGap = outerGap || Math.min.apply(null, data) / 5;
            series[index].data = this._createRingShineDataOption(series[index].data, outerGap, isShine);
            delete optionsSeries[index].outerGap;
            delete optionsSeries[index].isShine;
          }
        });
      }
      return series;
    },
    _createRingShineDataOption(data, outerGap, isShine) {
      if (!data) {
        return;
      }
      const colors = this._handlerColorGroup(data.length);
      const gapItem = {
        value: outerGap,
        name: '',
        itemStyle: {
          normal: {
            label: {
              show: false
            },
            labelLine: {
              show: false
            },
            color: 'rgba(0, 0, 0, 0)',
            borderColor: 'rgba(0, 0, 0, 0)',
            borderWidth: 0
          }
        }
      };
      let result = [];
      for (var i = 0; i < data.length; i++) {
        let dataItem = {
          value: data[i].value,
          name: data[i].name
        };
        if (isShine) {
          dataItem.itemStyle = {
            borderWidth: 5,
            shadowBlur: 10,
            color: colors[i],
            borderColor: colors[i],
            shadowColor: colors[i]
          };
        }
        result.push(dataItem);
        if (data.length > 1) {
          result.push(gapItem);
        }
      }
      return result;
    },
    _createRingShineHighlight(series, highlightOptions, color = this.highlightColor) {
      series = series || [];
      series = series.map((serie, seriesIndex) => {
        const dataIndexs = highlightOptions.map(item => {
          if (item.seriesIndex && item.seriesIndex.includes(seriesIndex)) {
            return item.dataIndex;
          }
        });
        const colors = highlightOptions.map(item => {
          if (item.seriesIndex && item.seriesIndex.includes(seriesIndex)) {
            return item.color || color;
          }
        });
        const serieDatas = (serie && serie.data) || [];
        dataIndexs.forEach((dataIndex, index) => {
          serieDatas[dataIndex].itemStyle.color = colors[index];
          serieDatas[dataIndex].itemStyle.borderColor = colors[index];
          serieDatas[dataIndex].itemStyle.shadowColor = colors[index];
        });
        return serie;
      });
      return series;
    },
    _handlerColorGroup(serielDataLength) {
      if (typeof this.colorGroupsData[0] === 'object') {
        return handleMultiGradient(this.colorGroupsData, serielDataLength);
      } else {
        return SuperMap.ColorsPickerUtil.getGradientColors(this.colorGroupsData, serielDataLength, 'RANGE');
      }
    },
    // 控制label显示条数
    _controlLabel(normalLabel, maxLabels) {
      if (normalLabel && normalLabel.show && maxLabels) {
        let endNormalLabel = cloneDeep(normalLabel);
        let formatMode;
        if (endNormalLabel.formatter && typeof endNormalLabel.formatter === 'string') {
          formatMode = endNormalLabel.formatter;
        }
        endNormalLabel.formatter = function({ dataIndex, value, name, percent }) {
          const FORMATTER_MAP = {
            '{b}: {c}': `${name}: ${value}`,
            '{b}': `${name}`,
            '{c}': `${value}`,
            '{d}%': `${percent}%`
          };
          let result = '';
          if (dataIndex < maxLabels) {
            result = FORMATTER_MAP[formatMode || '{c}'];
          }
          return result;
        };
        return endNormalLabel;
      }
      return normalLabel;
    },
    // 当datasetUrl不变，datasetOptions改变时
    _changeChartData(echartsDataService, datasetOptions, echartOptions) {
      let options;

      options = echartsDataService.formatChartData(datasetOptions, this.xBar);

      // 缓存dataSeriesCache，格式化成echart的数据
      this.dataSeriesCache = Object.assign({}, options);
      // 设置echartOptions
      this.echartOptions = this._optionsHandler(echartOptions, options);
    },
    _setChartTheme() {
      if (!this.theme) {
        let colorNumber = this.colorNumber;
        this.chartTheme = chartThemeUtil(this.getBackground, this.textColorsData, this.colorGroupsData, colorNumber);
      }
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
    },
    unSupportedFeatureTip() {
      this.$message.destroy();
      this.$message.warning(this.$t('chart.unSupportedData'));
    },
    handleChartClick(params) {
      if (this.associatedMap) {
        const { dataIndex } = params;
        let features = [];
        if (this.echartsDataService && this.echartsDataService.sortDataCache) {
          features = this.echartsDataService.sortDataCache.features || features;
        }
        const selectedFeature = features[dataIndex];
        this.showDetailInfo(selectedFeature);
      }
    },
    showDetailInfo(feature) {
      const coordinates = ((feature || {}).geometry || {}).coordinates;
      const hasCoordinates = coordinates && !!coordinates.length;
      if (hasCoordinates && this.viewModel) {
        const properties = feature.properties || {};
        const coordinates = getFeatureCenter(feature);
        const propsData = this.generateTableData(properties);
        this.tablePopupProps = { ...propsData };
        this.$nextTick(() => {
          this.viewModel.setPopupContent(coordinates, this.$refs.chartTablePopup.$el, () => setPopupArrowStyle(this.tablePopupBgData));
        });
      } else {
        const mapNotLoaded = this.mapNotLoadedTip();
        if (mapNotLoaded) {
          return;
        }
        if (!hasCoordinates) {
          this.unSupportedFeatureTip();
        }
      }
    },
    generateTableData(properties) {
      let propsData = {
        columns: [
          { title: this.$t('search.attribute'), dataIndex: 'attribute', width: 120 },
          { title: this.$t('search.attributeValue'), dataIndex: 'attributeValue', width: 150 }
        ],
        data: []
      };
      for (let key in properties) {
        if (key && properties[key]) {
          let dataItem = {};
          dataItem.attribute = key;
          dataItem.attributeValue = properties[key];
          propsData.data.push(dataItem);
        }
      }
      return propsData;
    },
    mapNotLoadedTip() {},
    _dataZoomChanged() {
      let flag = false;
      this.options.series &&
        this.options.series.forEach((serie, index) => {
          const labelConfig = serie.label && serie.label.normal;
          flag = labelConfig.show && labelConfig.smart;
        });
      if (flag) {
        this.echartOptions = this._optionsHandler(this.options, this.dataSeriesCache, true);
      }
    },
    registerShape() {
      this.datasetOptions &&
        this.options.series &&
        this.datasetOptions.forEach((item, index) => {
          const graphicIntance = this.$options.graphic;
          if (item.seriesType === '2.5Bar') {
            const cubeType = this.options.series[index].shape;
            if (graphicIntance.getShapeClass(`Cube${cubeType}Left`)) {
              return;
            }
            let CubeLeft, CubeRight, CubeTop;
            switch (cubeType) {
              case 'square':
                // 绘制左侧面
                CubeLeft = graphicIntance.extendShape({
                  shape: {
                    x: 0,
                    y: 0
                  },
                  buildPath: function(ctx, shape) {
                    // 会canvas的应该都能看得懂，shape是从custom传入的
                    const xAxisPoint = shape.xAxisPoint;
                    const c0 = [shape.x, shape.y];
                    const c1 = [shape.x - 13, shape.y - 13];
                    const c2 = [xAxisPoint[0] - 13, xAxisPoint[1] - 13];
                    const c3 = [xAxisPoint[0], xAxisPoint[1]];
                    ctx
                      .moveTo(c0[0], c0[1])
                      .lineTo(c1[0], c1[1])
                      .lineTo(c2[0], c2[1])
                      .lineTo(c3[0], c3[1])
                      .closePath();
                  }
                });
                // 绘制右侧面
                CubeRight = graphicIntance.extendShape({
                  shape: {
                    x: 0,
                    y: 0
                  },
                  buildPath: function(ctx, shape) {
                    const xAxisPoint = shape.xAxisPoint;
                    const c1 = [shape.x, shape.y];
                    const c2 = [xAxisPoint[0], xAxisPoint[1]];
                    const c3 = [xAxisPoint[0] + 18, xAxisPoint[1] - 9];
                    const c4 = [shape.x + 18, shape.y - 9];
                    ctx
                      .moveTo(c1[0], c1[1])
                      .lineTo(c2[0], c2[1])
                      .lineTo(c3[0], c3[1])
                      .lineTo(c4[0], c4[1])
                      .closePath();
                  }
                });
                // 绘制顶面
                CubeTop = graphicIntance.extendShape({
                  shape: {
                    x: 0,
                    y: 0
                  },
                  buildPath: function(ctx, shape) {
                    const c1 = [shape.x, shape.y];
                    const c2 = [shape.x + 18, shape.y - 9];
                    const c3 = [shape.x + 5, shape.y - 22];
                    const c4 = [shape.x - 13, shape.y - 13];
                    ctx
                      .moveTo(c1[0], c1[1])
                      .lineTo(c2[0], c2[1])
                      .lineTo(c3[0], c3[1])
                      .lineTo(c4[0], c4[1])
                      .closePath();
                  }
                });
                break;
              case 'rectangle':
                // 绘制左侧面
                CubeLeft = graphicIntance.extendShape({
                  shape: {
                    x: 0,
                    y: 0
                  },
                  buildPath: function(ctx, shape) {
                    const xAxisPoint = shape.xAxisPoint;
                    const c0 = [shape.x, shape.y];
                    const c1 = [shape.x - 9, shape.y - 9];
                    const c2 = [xAxisPoint[0] - 9, xAxisPoint[1] - 9];
                    const c3 = [xAxisPoint[0], xAxisPoint[1]];
                    ctx
                      .moveTo(c0[0], c0[1])
                      .lineTo(c1[0], c1[1])
                      .lineTo(c2[0], c2[1])
                      .lineTo(c3[0], c3[1])
                      .closePath();
                  }
                });
                CubeRight = graphicIntance.extendShape({
                  shape: {
                    x: 0,
                    y: 0
                  },
                  buildPath: function(ctx, shape) {
                    const xAxisPoint = shape.xAxisPoint;
                    const c1 = [shape.x, shape.y];
                    const c2 = [xAxisPoint[0], xAxisPoint[1]];
                    const c3 = [xAxisPoint[0] + 18, xAxisPoint[1] - 9];
                    const c4 = [shape.x + 18, shape.y - 9];
                    ctx
                      .moveTo(c1[0], c1[1])
                      .lineTo(c2[0], c2[1])
                      .lineTo(c3[0], c3[1])
                      .lineTo(c4[0], c4[1])
                      .closePath();
                  }
                });
                CubeTop = graphicIntance.extendShape({
                  shape: {
                    x: 0,
                    y: 0
                  },
                  buildPath: function(ctx, shape) {
                    const c1 = [shape.x, shape.y];
                    const c2 = [shape.x + 18, shape.y - 9];
                    const c3 = [shape.x + 9, shape.y - 18];
                    const c4 = [shape.x - 9, shape.y - 9];
                    ctx
                      .moveTo(c1[0], c1[1])
                      .lineTo(c2[0], c2[1])
                      .lineTo(c3[0], c3[1])
                      .lineTo(c4[0], c4[1])
                      .closePath();
                  }
                });
                break;
            }
            CubeLeft && graphicIntance.registerShape(`Cube${cubeType}Left`, CubeLeft);
            CubeRight && graphicIntance.registerShape(`Cube${cubeType}Right`, CubeRight);
            CubeTop && graphicIntance.registerShape(`Cube${cubeType}Top`, CubeTop);
          }
        });
    },
    getCirlPoint(x0, y0, r, angle) {
      let x1 = x0 + r * Math.cos((angle * Math.PI) / 180);
      let y1 = y0 + r * Math.sin((angle * Math.PI) / 180);
      return {
        x: x1,
        y: y1
      };
    },
    spinLine(startAngle, endAngle, angle, effectColor, radius) {
      return (params, api) => {
        return {
          type: 'arc',
          shape: {
            cx: api.getWidth() / 2,
            cy: api.getHeight() / 2,
            r: (Math.min(api.getWidth(), api.getHeight()) / 2) * radius,
            startAngle: ((startAngle + angle) * Math.PI) / 180,
            endAngle: ((endAngle + angle) * Math.PI) / 180
          },
          style: {
            stroke: effectColor,
            fill: 'transparent',
            lineWidth: 1.5
          },
          silent: true
        };
      };
    },
    spinPoint(angle, spinAngle, effectColor, radius) {
      return (params, api) => {
        let x0 = api.getWidth() / 2;
        let y0 = api.getHeight() / 2;
        let r = (Math.min(api.getWidth(), api.getHeight()) / 2) * radius;
        let point = this.getCirlPoint(x0, y0, r, angle + spinAngle);
        return {
          type: 'circle',
          shape: {
            cx: point.x,
            cy: point.y,
            r: 4
          },
          style: {
            stroke: effectColor,
            fill: effectColor
          },
          silent: true
        };
      };
    },
    customRingsLine(startAngle, endAngle, angle, effectColor, effectRadius) {
      let series = {
        name: 'ring0',
        type: 'custom',
        coordinateSystem: 'none',
        renderItem: null,
        data: [0]
      };
      series.renderItem = this.spinLine(startAngle, endAngle, angle, effectColor, effectRadius);
      return series;
    },
    customRingsPoint(startAngle, angle, effectColor, outEffectRadius) {
      let series = {
        name: 'ring4',
        type: 'custom',
        coordinateSystem: 'none',
        renderItem: null,
        data: [0]
      };
      series.renderItem = this.spinPoint(startAngle, angle, effectColor, outEffectRadius);
      return series;
    },
    addEffect(angle) {
      angle = angle || 0;
      const effectColor = this.options.series[0].customOptions.color;
      const effectRadius = this.options.series[0].customOptions.radius;
      const outEffectRadius = effectRadius + 0.1;
      // customRightBottomLine
      this.customSeries.push(this.customRingsLine(0, 90, angle, effectColor, effectRadius));
      // customRightTopLine
      this.customSeries.push(this.customRingsLine(270, 40, -angle, effectColor, outEffectRadius));
      // customLeftTopLine
      this.customSeries.push(this.customRingsLine(180, 270, angle, effectColor, effectRadius));
      // customLeftBottomLine
      this.customSeries.push(this.customRingsLine(90, 220, -angle, effectColor, outEffectRadius));
      if (this.options.series[0].customOptions.pointState === 'startPoint') {
        this.customSeries.push(this.customRingsPoint(270, -angle, effectColor, outEffectRadius));
        this.customSeries.push(this.customRingsPoint(90, -angle, effectColor, outEffectRadius));
      }
    },
    startEffect() {
      let angle = 0;
      this.startSpin = setInterval(() => {
        if (!this.options.series) {
          return;
        }
        if (this.options.series[0].customType === 'customRingsSeries') {
          this.customSeries = [];
          angle += 3;
          this.addEffect(angle);
        }
      }, 100);
    },
    customRenderItem() {}
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
