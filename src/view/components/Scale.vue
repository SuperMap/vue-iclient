<template>
  <div class="mapboxgl-custom-ctrl-scale" :style="scaleStyle">{{content}}</div>
</template>
<script>
import ScaleViewModel from "../../viewmodel/ScaleViewModel";
import Widget from "./Widget";

export default {
  name: "SmScale",
  extends: Widget,
  props: {
    unit: {
      type: String,
      default: "metric",
      validator(value) {
        return ["imperial", "metric", "nautical"].includes(value);
      }
    },
    maxWidth: {
      type: Number,
      default: 100
    }
  },
  data() {
    return {
      width: null,
      content: null
    };
  },
  computed: {
    scaleStyle() {
      if (this.widgetStyle) {
        let style = this.widgetStyle.position;
        style.width = this.width;
        return style;
      } else {
        return { width: this.width };
      }
    }
  },
  methods: {
    inlitializeScale() {
      let scaleViewModel = new ScaleViewModel(this.map);
      this.scaleViewModel = scaleViewModel;
      this.updateContainer();
      scaleViewModel.onMoveEvt();
    },
    updateContainer() {
      const self = this;
      this.scaleViewModel.on("scaleupdated", e => {
        this.width = e.containerWidth;
        this.content = e.containerContent;
      });
    }
  },
  loaded() {
    this.inlitializeScale();
  }
};
</script>
<style scoped lang='scss'>
.mapboxgl-custom-ctrl-scale {
  background-color: rgba(255, 255, 255, 0.75);
  font-size: 10px;
  border-width: medium 2px 2px;
  border-style: none solid solid;
  border-color: #333;
  padding: 0 5px;
  color: #333;
  box-sizing: border-box;
}
</style>

