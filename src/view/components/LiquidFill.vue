<template>
  <div
    class="liquid-fill"
    :style="{width:`${this.size}px`,height:`${this.size}px`}"
  >
    <div
      class="chart"
      id="chart"
      ref="chart"
      :style="{width:`${this.size}px`,height:`${this.size}px`}"
    ></div>
  </div>
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
    //背景色
    backgroundColor: {
      type: String
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
    return {
      waveColorData: "",
      labelColorData: "",
      borderColorData: "",
      backgroundColorData: ""
    };
  },
  computed: {
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
    Object.keys(this.$props).forEach((watchItem) => {
      this.$watch(watchItem,() => {
        //需要筛选继承的那些props
        if(watchItem === 'size'){
          this.updateChart(false,true)
        }
        this.updateChart();
      })
    })
    this.chart = echarts.init(this.$refs.chart);
    this.updateChart();
    this.$on("themeStyle", () => {
      this.waveColorData = this.getColor(0);
      this.labelColorData = this.getTextColor;
      this.borderColorData = this.getColor(0);
      this.backgroundColorData = this.getBackground;
      this.updateChart(true);
    });
  },
  methods: {
    updateChart(propsUpdate = false,changeSize) {
      if (!propsUpdate) {
        this.waveColorData = this.waveColor || this.getColor(0);
        this.labelColorData = this.labelColor || this.getTextColor;
        this.borderColorData = this.borderColor || this.waveColorData;
        this.backgroundColorData = this.backgroundColor || this.getBackground;
      }

      if (changeSize) {
        this.chart.resize(this.size,this.size);
      }

      this.chart.setOption({
        series: [
          {
            color: [this.waveColorData],
            type: "liquidFill",
            waveAnimation: this.waveAnimation,
            animation: false,
            radius: "95%",
            data: this.calcData,
            label: {
              fontSize: this.fontSize || this.calcFontSize,
              color: this.labelColorData,
              insideColor: this.insideLabelColor
            },
            backgroundStyle: {
              color: this.backgroundColorData
            },
            itemStyle: {
              shadowColor: "#fff"
            },
            outline: {
              borderDistance: 3,
              itemStyle: {
                borderColor: this.borderColorData,
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

