<template>
  <div class="liquid-fill" :style="{width:`${this.size}px`,height:`${this.size}px`}">
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
import "echarts-liquidfill";
import Widget from "./Widget";

export default {
  name: "SmLiquidFill",
  extends: Widget,
  props: {
    //百分比的值
    value: {
      type: Number,
      default: 0
    },
    //波浪数
    waveCount:{
      type:Number,
      default:1
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
      type: String,
      default:'#6be6c1'
    },
    //边框颜色
    borderColor: {
      type: String,
      default:'#6be6c1'
    },
    //数字在波浪外的颜色
    labelColor: {
      type: String,
      default:'#626c91'
    },
    //数字在波浪内的颜色
    insideLabelColor: {
      type: String,
      default:'#fff'
    },
    //是否开启波浪动画
    waveAnimation: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      //主题列表
      themeList: {
        dark: {
          waveColor: "#dd6b66",
          labelColor: "#e69d87"
        },
        light: {
          waveColor: "#6be6c1",
          labelColor: "#626c91"
        }
      }
    };
  },
  computed: {
    //根据主题得到波浪背景色
    calcWaveColor() {
      return this.themeList[this.theme]["waveColor"];
    },
    //根据主题得到标注背景色
    calclabelColor() {
      return this.themeList[this.theme]["labelColor"];
    },
    //根据传入的size计算得到标注的字体大小
    calcFontSize() {
      return (this.size / 4).toFixed(2);
    },
    calcData(){
      let data = []
      for(let i = 0;i < this.waveCount;i++){
        data.push(this.value - (i * 0.05))
      }
      return data;
    }
  },
  loaded() {
    let chart = echarts.init(this.$refs.chart);
    let waveColor = this.waveColor ? [this.waveColor] : [this.calcWaveColor];
    chart.setOption({
      series: [
        {
          color: waveColor,
          type: "liquidFill",
          waveAnimation: this.waveAnimation,
          animation: false,
          radius: "95%",
          data: this.calcData,
          label: {
            fontSize: this.fontSize || this.calcFontSize,
            color: this.labelColor || this.calclabelColor,
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
              borderColor: this.borderColor || this.calcWaveColor,
              borderWidth: 3,
              shadowBlur: 0,
              shadowColor: "#fff"
            }
          }
        }
      ]
    });
  }
};
</script>

