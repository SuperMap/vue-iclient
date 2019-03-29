<template>
  <div class="chart" id="chart" :style="{width:`${this.size}px`,height:`${this.size}px`}"></div>
</template>
<script>
import echarts from "echarts";
import Theme from "../mixin/Theme";
import "echarts-liquidfill";
import Widget from "./Widget";

export default {
  name: "SmLiquidFill",
  extends: Widget,
  mixins: [Theme],
  props: {
    //百分比的值
    value: {
      type: Number,
      default: 0
    },
    //波浪数
    waveCount: {
      type: Number,
      default: 1
    },
    //水球大小
    size: {
      type: Number,
      default: 100
    },
    //字体
    fontSize: {
      type: Number
    },
    //波浪颜色
    waveColor: {
      type: String
    },
    //边框颜色
    borderColor: {
      type: String
    },
    //数字在波浪外的颜色
    labelColor: {
      type: String,
      default: "#626c91"
    },
    //数字在波浪内的颜色
    insideLabelColor: {
      type: String,
      default: "#fff"
    },
    //是否开启波浪动画
    waveAnimation: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {};
  },
  watch: {
    value: function() {
      this.updateChart();
    }
  },
  computed: {
    //根据主题得到波浪背景色
    calcWaveColor() {
      return this.getColor(0);
    },
    //根据主题得到标注背景色
    calclabelColor() {
      return this.getColor(1);
    },
    //根据传入的size计算得到标注的字体大小
    calcFontSize() {
      return (this.size / 4).toFixed(2);
    },
    //根据波浪数渲染数据
    calcData() {
      let data = [];
      for (let i = 0; i < this.waveCount; i++) {
        data.push(this.value - i * 0.05);
      }
      return data;
    }
  },
  loaded() {
    this.liquidChart = echarts.init(this.$el);
    this.updateChart();
    this.$on("themeStyle", () => {
      this.updateChart();
    });
  },
  methods: {
    updateChart() {
      let waveColor = this.waveColor ? this.waveColor : this.calcWaveColor;

      this.liquidChart.setOption({
        series: [
          {
            color: [waveColor],
            type: "liquidFill",
            waveAnimation: this.waveAnimation,
            animation: false,
            radius: "95%",
            data: this.calcData,
            label: {
              fontSize: this.fontSize || this.calcFontSize,
              color: this.labelColor || this.getTextColor,
              insideColor: this.insideLabelColor
            },
            backgroundStyle: {
              color: "#fff"
            },
            itemStyle: {
              shadowColor: "#fff"
            },
            outline: {
              borderDistance: 3,
              itemStyle: {
                borderColor: this.borderColor || waveColor,
                borderWidth: 3,
                shadowBlur: 0,
                shadowColor: "#fff"
              }
            }
          }
        ]
      });
    }
  }
};
</script>

