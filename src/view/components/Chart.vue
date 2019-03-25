
<template>
  <div
    class="sm-chart"
    ref="chart"
  ></div>
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
    autoRotate: {
      type: Boolean,
      default: false
    },
    iconClass: {
      type: String,
      default: "smwidgets-icons-attribute"
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
      type: Object,
      validator(options) {
        if (!options.xAxis || !options.yAxis) {
          return false;
        }
        return true;
      }
    }
  },
  data() {
    return {
      a: this.getBackground
    };
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
    this.a;
    this.viewModel = new ChartViewModel(this.$refs["chart"], this.options);
    this.$on(
      "themeStyle",
      () => {
        this.chartOptions.colorGradient = this.colorGroupsData;
        this.chartOptions.backgroundColor = this.backgroundData;
        this.chartOptions.axisColor = this.textColorsData;
        this.viewModel.setChartOptions(this.chartOptions);
      }
    );
    if (this.parentIsWebMapOrMap) {
      let icon = this.$el.parentElement.children[1];
      icon && (icon.style.visibility = "hidden");
      icon &&
        this.viewModel.on("chartinitsucceeded", () => {
          icon.style.visibility = "visible";
        });
    }
  }
};
</script>


