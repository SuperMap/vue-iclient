
<template>
  <div id="chart" :style="chartStyle"></div>
</template>

<script>
/* eslint-disable */
import { ChartViewModel } from "../../viewmodel/ChartViewModel";
import Widget from "./Widget";
export default {
  name: "SmChart",
  extends: Widget,
  props: {
    chartType: {
      type: String,
      default: "bar"
    },
    datasets: {
      type: Object,
      required: true
    },
    chartOptions: {
      type: Array,
      validator(options) {
        if (!options.length) {
          return false;
        } else if (!options[0].xAxis || !options[0].yAxis) {
          return false;
        }
        return true;
      }
    }
  },
  computed: {
    chartStyle() {
      if (this.widgetStyle) {
        let style = Object.assign(this.widgetStyle.position);
        style.width = this.widgetStyle.width || '450px';
        style.height = this.widgetStyle.height || '350px';
        return style;
      }
    },
    options() {
      return {
        type: this.chartType,
        datasets: this.datasets,
        chartOptions: this.chartOptions
      };
    }
  },
  methods: {
    changeType(type) {
      this.chartViewModel && this.chartViewModel.changeType(type);
    },
    getStyle() {
      this.chartViewModel && this.chartViewModel.getStyle();
    },
    setStyle(style) {
      this.chartViewModel && this.chartViewModel.setStyle(style);
    },
    getFeatures() {
      this.chartViewModel && this.chartViewModel.getFeatures();
    },
    updateData(datasets, chartOption) {
      this.chartViewModel &&
        this.chartViewModel.updateData(datasets, chartOption);
    }
  },
  loaded() {
    this.chartViewModel = new ChartViewModel(this.$el, this.options);
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped  lang="scss">
#chart {
  width: 450px;
  height: 350px;
}
</style>
