
<template>
  <div id="chart">
  </div>
</template>

<script>
/* eslint-disable */
import { ChartViewModel } from "../../viewmodel/ChartViewModel";
import Widget from "./Widget";
export default {
  name: "SmChart",
  extends: Widget,
  props: {
    iconClass: {
      type: String,
      default: "el-icon-back"
    },
    collapsed: {
      type: Boolean,
      default: false
    },
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
    !this.parentIsWebMapOrMap && this.$el.classList.add("chart-container");
    this.chartViewModel = new ChartViewModel(this.$el, this.options);
  }
};
</script>

<style scoped  lang="scss">
#chart {
  width: 450px;
  height: 350px;
  &.chart-container {
    position: absolute;
    top: 10px;
    left: 10px;
  }
}
</style>
