<template>
  <div id="chart" ref="chart" class="sm-widget-liquidFill"></div>
</template>
<script>
import echarts from 'echarts';
import Theme from '../_mixin/theme';
import 'echarts-liquidfill';

export default {
  name: 'SmLiquidFill',
  mixins: [Theme],
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
      type: Number
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
      borderColorData: '',
      backgroundColorData: ''
    };
  },
  computed: {
    // 根据波浪数渲染数据
    calcData() {
      let data = [];
      const formatValue = isNaN(this.value) ? 0 : parseFloat(this.value);
      for (let i = 0; i < this.waveCount; i++) {
        data.push(formatValue - i * 0.05);
      }
      return data;
    }
  },
  mounted() {
    setTimeout(() => {
      this.initializeChart();
      this.resize();
    }, 0);
  },
  methods: {
    resize() {
      setTimeout(() => {
        this.chart && this.chart.resize();
      }, 0);
    },
    initializeChart() {
      Object.keys(this.$props).forEach(watchItem => {
        this.$watch(watchItem, () => {
          this.updateChart();
        });
      });
      this.chart = echarts.init(this.$refs.chart);
      this.updateChart();
      this.$on('themeStyleChanged', () => {
        this.waveColorData = this.getColor(0);
        this.labelColorData = this.getTextColor;
        this.borderColorData = this.getColor(0);
        this.backgroundColorData = this.getBackground;
        this.updateChart(true);
      });
      window.addEventListener('resize', () => {
        this.resize();
      });
    },
    updateChart(propsUpdate = false) {
      if (!propsUpdate) {
        this.waveColorData = this.waveColor || this.getColor(0);
        this.labelColorData = this.labelColor || this.getTextColor;
        this.borderColorData = this.borderColor || this.waveColorData;
        this.backgroundColorData = this.backgroundColor || this.getBackground;
      }

      this.chart.setOption({
        series: [
          {
            color: [this.waveColorData],
            type: 'liquidFill',
            waveAnimation: this.waveAnimation,
            animation: false,
            radius: '95%',
            data: this.calcData,
            label: {
              fontSize: this.fontSize,
              color: this.labelColorData,
              insideColor: this.insideLabelColor
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
    }
  }
};
</script>
