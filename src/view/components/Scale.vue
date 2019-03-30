<template>
  <div  v-show="isShow" class="sm-scale" :style="scaleStyle">{{content}}</div>
</template>
<script>
import ScaleViewModel from "../../viewmodel/ScaleViewModel";
import Widget from "./Widget";

export default {
  name: "SmScale",
  extends: Widget,
  relativeMap:true,
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
      return { width: this.width };
    }
  },
  methods: {
    inlitializeScale(map) {
      let scaleViewModel = new ScaleViewModel(map);
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
    this.inlitializeScale(this.map);
  }
};
</script>


