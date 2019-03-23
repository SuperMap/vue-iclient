<template>
  <div class="sm-zoom">
    <div class="sm-zoom__buttons">
      <el-button class="sm-zoom__button" icon="el-icon-plus" plain @click="zoomIn"></el-button>
      <el-button class="sm-zoom__button" icon="el-icon-minus" plain @click="zoomOut"></el-button>
    </div>
    <el-slider class="sm-zoom__slider"
      v-if="showZoomSlider"
      v-model="zoomPosition"
      @change="sliderChange"
      :min="min"
      :max="max"
      vertical
      height="200px"
    ></el-slider>
  </div>
</template>
<script>
import Widget from "./Widget";
import ZoomViewModel from "../../viewmodel/ZoomViewModel";

export default {
  name: "SmZoom",
  relativeMap:true,
  extends: Widget,
  data() {
    return {
      zoomPosition: 0,
      min: 0,
      max: 22
    };
  },
  props: {
    showZoomSlider: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    sliderChange() {
      this.setZoom(this.zoomPosition);
    },
    zoomIn() {
      if (Math.round(this.zoomPosition) < this.max) {
        // slider的默认步长为1
        this.zoomPosition += 1;
        // 地图放大一级
        this.ZoomViewModel.zoomIn();
      }
    },
    zoomOut() {
      if (Math.round(this.zoomPosition) > this.min) {
        this.zoomPosition -= 1;
        // 地图缩小一级
        this.ZoomViewModel.zoomOut();
      }
    },
    getMaxZoom() {
      return this.ZoomViewModel.getMaxZoom();
    },
    getMinZoom() {
      return this.ZoomViewModel.getMinZoom();
    },
    getZoom() {
      return this.ZoomViewModel.getZoom();
    },
    setZoom(zoom) {
      return this.ZoomViewModel.setZoom(zoom);
    }
  },
  loaded() {
    this.ZoomViewModel = new ZoomViewModel(this.map);
    // 设置slider的最大最小值
    this.min = this.getMinZoom();
    this.max = this.getMaxZoom();

    // 设置slider初始值
    this.zoomPosition = Math.ceil(this.getZoom());

    // ZoomViewModel中监听滚轮事件(滚轮缩放地图)，改变slider的值
    this.ZoomViewModel.wheelEventOn(() => {
      this.zoomPosition = Math.ceil(this.getZoom());
    });
    // this.ZoomViewModel.on('mouseWheel', () => {
    //   this.zoomPosition = Math.ceil(this.getZoom());
    // });
  }
};
</script>
