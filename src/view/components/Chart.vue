
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
  viewModelProps: ["chartType", "datasets", "chartOption"],
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
    chartOption: {
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
      if (!this.chartOption.colorGradient) {
        this.chartOption.colorGradient = this.colorGroupsData;
      }
      if (!this.chartOption.backgroundColor) {
        this.chartOption.backgroundColor = this.backgroundData;
      }
      if (!this.chartOption.axisColor) {
        this.chartOption.axisColor = this.textColorsData;
      }
      return {
        type: this.chartType,
        datasets: this.datasets,
        chartOption: this.chartOption
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
        this.chartOption.colorGradient = this.colorGroupsData;
        this.chartOption.backgroundColor = this.backgroundData;
        this.chartOption.axisColor = this.textColorsData;
        this.viewModel.setChartOptions(this.chartOption);
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


