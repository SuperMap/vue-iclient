<template>
  <div id="chart" ref="chart" class="sm-component-liquidfill" :style="[background && getBackgroundStyle]"></div>
</template>
<script>
import echarts from 'echarts';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import 'echarts-liquidfill';
import Timer from 'vue-iclient/src/common/_mixin/Timer';
import ThirdService from 'vue-iclient/src/common/_mixin/ThirdService';
import { addListener, removeListener } from 'resize-detector';
import debounce from 'lodash.debounce';
import { strip } from '../_utils/util';

export default {
  name: 'SmLiquidFill',
  mixins: [Theme, Timer, ThirdService],
  props: {
    // 百分比的值
    value: {
      type: [Number, String],
      default: 0
    },
    formatter: {
      type: [Function, String]
    },
    // 波浪数
    waveCount: {
      type: Number,
      default: 1
    },
    // 字体
    fontSize: {
      type: [Number, String]
    },
    // 波浪颜色
    waveColor: {
      type: String
    },
    // 边框颜色
    borderColor: {
      type: String
    },
    // 数字在波浪外的颜色
    labelColor: {
      type: String,
      default: '#626c91'
    },
    // 背景色
    backgroundColor: {
      type: String
    },
    // 数字在波浪内的颜色
    insideLabelColor: {
      type: String,
      default: '#fff'
    },
    // 是否开启波浪动画
    waveAnimation: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      waveColorData: '',
      labelColorData: '',
      insideLabelColorData: '',
      borderColorData: '',
      backgroundColorData: '',
      finalValue: this.value
    };
  },
  computed: {
    // 根据波浪数渲染数据
    calcData() {
      let data = [];
      const formatValue = isNaN(+this.finalValue) ? 0 : +this.finalValue;
      for (let i = 0; i < this.waveCount; i++) {
        data.push(strip(formatValue - i * 0.05));
      }
      return data;
    }
  },
  watch: {
    waveColor(val) {
      this.waveColorData = val;
      this.updateChart();
    },
    labelColor(val) {
      this.labelColorData = val;
      this.updateChart();
    },
    insideLabelColor(val) {
      this.insideLabelColorData = val;
      this.updateChart();
    },
    borderColor(val) {
      this.borderColorData = val;
      this.updateChart();
    },
    backgroundColor(val) {
      this.backgroundColorData = val;
      this.updateChart();
    },
    formatter() {
      this.updateChart();
    },
    finalValue() {
      this.updateChart();
    },
    fontSize() {
      this.updateChart();
    },
    waveCount() {
      this.updateChart();
    },
    waveAnimation() {
      this.updateChart();
    },
    value(val) {
      this.finalValue = val;
    }
  },
  mounted() {
    this.waveColorData = this.waveColor || this.getColor(0);
    this.labelColorData = this.labelColor || this.getTextColor;
    this.insideLabelColorData = this.insideLabelColor || this.getTextColor;
    this.borderColorData = this.borderColor || this.waveColorData;
    this.backgroundColorData = this.backgroundColor || this.getBackground;
    this._initAutoResize();
    this.$nextTick(() => {
      this.initializeChart();
    });
  },
  beforeDestroy() {
    this.restService && this.restService.remove('getdatasucceeded');
    removeListener(this.$el, this.__resizeHandler);
  },
  methods: {
    resize() {
      this.chart && this.chart.resize();
    },
    initializeChart() {
      this.chart = echarts.init(this.$refs.chart);
      this.updateChart();
      this.$on('theme-style-changed', () => {
        this.waveColorData = this.getColor(0);
        this.labelColorData = this.getTextColor;
        this.insideLabelColorData = this.getTextColor;
        this.borderColorData = this.getColor(0);
        this.backgroundColorData = this.getBackground;
        this.updateChart();
      });
    },
    _initAutoResize() {
      this.__resizeHandler = debounce(
        () => {
          this.resize();
        },
        100,
        { leading: true }
      );
      // @ts-ignore
      addListener(this.$el, this.__resizeHandler);
    },
    updateChart() {
      const options = {
        series: [
          {
            color: [this.waveColorData],
            type: 'liquidFill',
            waveAnimation: this.waveAnimation,
            animation: false,
            radius: '95%',
            data: this.calcData,
            label: {
              fontSize: parseFloat(this.fontSize),
              color: this.labelColorData,
              insideColor: this.insideLabelColorData
            },
            backgroundStyle: {
              color: this.backgroundColorData || 'rgba(0, 0, 0, 0)'
            },
            itemStyle: {
              shadowColor: '#fff'
            },
            outline: {
              borderDistance: 3,
              itemStyle: {
                borderColor: this.borderColorData,
                borderWidth: 3,
                shadowBlur: 0,
                shadowColor: '#fff'
              }
            }
          }
        ]
      };
      if (this.formatter) {
        options.series[0].label.formatter = this.formatter;
      }
      this.chart && this.chart.setOption(options);
    },
    timing() {
      this.getData();
    }
  }
};
</script>
