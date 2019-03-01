<template>
  <div class="ctrl-container">
    <!-- 加减缩放button -->
    <div class="ctrl-zoombtns">
      <!-- <button class="ctrl-icon ctrl-zoom-in" @click="zoomIn"></button>
      <button class="ctrl-icon ctrl-zoom-out" @click="zoomOut"></button>-->
      <el-button icon="el-icon-plus" plain @click="zoomIn"></el-button>
      <el-button icon="el-icon-minus" plain @click="zoomOut"></el-button>
    </div>

    <!-- zoomSlider滑块 -->
    <!-- <div class="ctrl-zoombar" >
      <button type="button" class="ctrl-zoombar-btn" :style="{bottom: zoomPosition+'px'}">
      </button>
    </div>-->
    <el-slider
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
<style scoped>
.ctrl-container {
  width: 38px;/*因为slider的总宽度为38px,无法重置居中，所以父元素设为38px*/
}
.ctrl-zoombtns {
  width: 30px;
  height: 60px;
  margin: 0 auto;
  border-radius: 4px;
  -moz-box-shadow: 0 0 2px rgba(0, 0, 0, 0.1);
  -webkit-box-shadow: 0 0 2px rgba(0, 0, 0, 0.1);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background: #fff;
}

/* 重写btn样式 */
.el-button {
  width: 100%;
  height: 50%;
  padding: 0;
  border-radius: 0;
}
.el-button + .el-button {
  margin-left: 0;
}

/* 重写slider的样式 */
.el-slider.is-vertical {
  position: relative;
  margin-top: 20px; /*添加的样式*/
}

/* 
.ctrl-icon {
  width: 30px;
  height: 30px;
  display: block;
  padding: 0;
  outline: none;
  border: 0;
  box-sizing: border-box;
  background-color: transparent;
  cursor: pointer;
  background-repeat: no-repeat;
  background-position: center;
}
.ctrl-zoom-in {
  background-image: url("../assets/zoomIn.svg");
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
.ctrl-zoom-out {
  background-image: url("../assets/zoomOut.svg");
}
.ctrl-zoombar {
  position: relative;
  margin-top: 10px;
  height: 200px;
  width: 30px;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 10px;
  padding: 2px;
}
.ctrl-zoombar-btn {
  display: block;
  width: 30px;
  height: 10px;
  margin: 1px;
  padding: 0;
  background-color: rgba(0, 60, 136, 0.5);
  border: none;
  border-radius: 4px;
  position: absolute;
} */
</style>
