
<template>
  <div class="sm-chart"  ref="chart" ></div>
</template>

<script>
/* eslint-disable */
import { ChartViewModel } from "../../viewmodel/ChartViewModel";
import Widget from "./Widget";
export default {
  name: "SmChart",
  viewModelProps: ["chartType", "datasets", "chartOptions"],
  extends: Widget,
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
    this.viewModel = new ChartViewModel(this.$refs['chart'], this.options);
    if (this.parentIsWebMapOrMap) {
      let icon = this.$el.parentElement.children[1];
      icon && (icon.style.visibility = "hidden");
      icon && this.viewModel.on("chartinitsucceeded", () => {
          icon.style.visibility = "visible";
        });
    }
  }
};
</script>


