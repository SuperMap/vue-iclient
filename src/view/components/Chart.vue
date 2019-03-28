
<template>
  <sm-card
    :icon-class="iconClass"
    :icon-position="position"
    :header-name="headerName"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    class="sm-chart"
    v-show="isShow"
  >
    <div id='chart'></div>
  </sm-card>
</template>

<script>
/* eslint-disable */
import { ChartViewModel } from "../../viewmodel/ChartViewModel";
import Widget from "./Widget";
import Theme from "../mixin/Theme";
export default {
  name: "SmChart",
  viewModelProps: ["chartType", "datasets", "chartOptions"],
  extends: Widget,
  mixins: [Theme],
  props: {
    iconClass: {
      type: String,
      default: "smwidgets-icons-attribute"
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
      type: Object,
      validator(options) {
        if (!options.xAxis || !options.yAxis) {
          return false;
        }
        return true;
      }
    }
  },
  computed: {
    options() {
      if (!this.chartOptions.colorGradient) {
        this.chartOptions.colorGradient = this.colorGroupsData;
      }
      if (!this.chartOptions.backgroundColor) {
        this.chartOptions.backgroundColor = this.backgroundData;
      }
      if (!this.chartOptions.axisColor) {
        this.chartOptions.axisColor = this.textColorsData;
      }
      return {
        type: this.chartType,
        datasets: this.datasets,
        chartOptions: this.chartOptions
      };
    }
  },
  methods: {
    getStyle() {
      this.viewModel && this.viewModel.getStyle();
    },
    setStyle(style) {
      this.viewModel && this.viewModel.setStyle(style);
    },
    getFeatures() {
      this.viewModel && this.viewModel.getFeatures();
    }
  },
  loaded() {
    this.viewModel = new ChartViewModel(this.$el.querySelector('#chart'), this.options);
    this.$on("themeStyle", () => {
      this.chartOptions.colorGradient = this.colorGroupsData;
      this.chartOptions.backgroundColor = this.backgroundData;
      this.chartOptions.axisColor = this.textColorsData;
      this.viewModel.setChartOptions(this.chartOptions);
    });
    let icon = this.$el.children[0]
    icon && (icon.style.visibility = "hidden");
    icon &&
      this.viewModel.on("chartinitsucceeded", () => {
        icon.style.visibility = "visible";
      });
  }
};
</script>


