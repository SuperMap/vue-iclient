<template>
  <div id="chart" ref="chart" class="sm-component-liquidFill" :style="[background && getBackgroundStyle]"></div>
</template>
<script>
import echarts from 'echarts';
import Theme from '../_mixin/Theme';
import 'echarts-liquidfill';
import { ResizeSensor } from 'css-element-queries';
import Timer from '../_mixin/Timer';
import ThirdService from '../_mixin/ThirdService';

export default {
  name: 'SmLiquidFill',
  mixins: [Theme, Timer, ThirdService],
  props: {
    // 百分比的值
    value: {
      type: [Number, String],
      default: 0
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
      const formatValue = isNaN(+this.finalValue) ? 0 : parseFloat(+this.finalValue);
      for (let i = 0; i < this.waveCount; i++) {
        data.push(formatValue - i * 0.05);
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
    setTimeout(() => {
      this.initializeChart();
      this.resize();
    }, 0);
  },
  beforeDestroy() {
    this.restService && this.restService.remove('getdatasucceeded');
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
        this.updateChart(true);
      });
      this.resizeObsever = new ResizeSensor(this.$el, () => {
        this.resize();
      });
    },
    updateChart(propsUpdate = false) {
      this.chart && this.chart.setOption({
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
              color: this.backgroundColorData
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
      });
    },
    timing() {
      this.getData();
    }
  }
};
</script>
