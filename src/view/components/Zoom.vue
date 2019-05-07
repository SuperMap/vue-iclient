<template>
  <div class="sm-widget-zoom">
    <div class="sm-widget-zoom__buttons" :style="[getBackgroundStyle, getTextColorStyle]">
      <el-button
        class="sm-widget-zoom__button"
        icon="el-icon-plus"
        @click="zoomIn"
        :style="activeZoomMode === 'zoomInBtn' ? [getColorStyle(0), activieBgColor] : ''"
      ></el-button>
      <el-button
        class="sm-widget-zoom__button"
        icon="el-icon-minus"
        @click="zoomOut"
        :style="activeZoomMode === 'zoomOutBtn' ? [getColorStyle(0), activieBgColor] : ''"
      ></el-button>
    </div>
    <el-slider
      class="sm-widget-zoom__slider"
      v-if="showZoomSlider"
      v-model="zoomPosition"
      @change="sliderChange"
      :min="min"
      :max="max"
      vertical
      height="200px"
      :style="getColorStyle(0)"
    ></el-slider>
  </div>
</template>
<script>
import Theme from "../mixin/theme";
import MapGetter from "../mixin/map-getter";
import Control from "../mixin/control";

import ZoomViewModel from "../../viewmodel/ZoomViewModel";
import { hexToRgba } from "../util/CommonUtil";

export default {
  name: "SmZoom",
  relativeMap: true,
  mixins: [MapGetter, Control, Theme],
  data() {
    return {
      zoomPosition: 0,
      min: 0,
      max: 22,
      activeZoomMode: ""
    };
  },
  props: {
    showZoomSlider: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    activieBgColor() {
      const color = this.getColorStyle(0).color;
      return {
        backgroundColor: hexToRgba(this.getColorStyle(0).color, 0.3),
        borderColor: color
      };
    }
  },
  mounted() {
    this.changeSliderStyle();
  },
  updated() {
    this.changeSliderStyle();
  },
  methods: {
    sliderChange() {
      this.setZoom(this.zoomPosition);
    },
    zoomIn(e) {
      this.activeZoomMode = "zoomInBtn";
      if (Math.round(this.zoomPosition) < this.max) {
        // slider的默认步长为1
        this.zoomPosition += 1;
        // 地图放大一级
        this.ZoomViewModel.zoomIn();
      }
    },
    zoomOut(e) {
      this.activeZoomMode = "zoomOutBtn";
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
    },
    changeSliderStyle() {
      const sliderBar = document.querySelector(".el-slider__bar");
      const sliderBtn = document.querySelector(".el-slider__button");
      sliderBar &&
        (sliderBar.style.backgroundColor = this.getColorStyle(0).color);
      sliderBtn && (sliderBtn.style.borderColor = this.getColorStyle(0).color);
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
