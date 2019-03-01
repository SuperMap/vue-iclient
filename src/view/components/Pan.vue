<template>
  <div
    :class="['ctrl-container', 'ctrl-container-position', panImgClass, mapboxglClass]"
  >
    <div class="ctrl-center" @click="panToCenter"></div>
    <div
      class="ctrl-icon ctrl-pan-left"
      @click="panToLeft"
      @mouseleave="setPanImg"
      @mouseenter="setPanWestImg"
    ></div>
    <div
      class="ctrl-icon ctrl-pan-right"
      @click="panToRight"
      @mouseleave="setPanImg"
      @mouseenter="setPanEastImg"
    ></div>
    <div
      class="ctrl-icon ctrl-pan-top"
      @click="panToTop"
      @mouseleave="setPanImg"
      @mouseenter="setPanNorthImg"
    ></div>
    <div
      class="ctrl-icon ctrl-pan-bottom"
      @click="panToBottom"
      @mouseleave="setPanImg"
      @mouseenter="setPanSouthImg"
    ></div>
  </div>
</template>
<script>
import Widget from "./Widget";
import PanViewModel from "../../viewmodel/PanViewModel.js";

export default {
  name: "SmPan",
  extends: Widget,
  data() {
    return {
      center: null,
      panImgClass: "ctrl-container-pan",
      mapboxglClass: ""
    };
  },
  props: {
    panLength: {
      type: Number,
      default: 200
    }
  },
  methods: {
    panToCenter() {
      this.lnglat = this.center;
      this.panTo(this.lnglat);
    },
    panToLeft() {
      // this.lnglat.lng -= this.panLength;
      // this.panTo(this.lnglat);
      this.panBy([-this.panLength, 0]);
    },
    panToRight() {
      // this.lnglat.lng += this.panLength;
      // this.panTo(this.lnglat);
      this.panBy([this.panLength, 0]);
    },
    panToTop() {
      // this.lnglat.lat -= this.panLength;
      // this.panTo(this.lnglat);
      this.panBy([0, -this.panLength]);
    },
    panToBottom() {
      // this.lnglat.lat += this.panLength;
      // this.panTo(this.lnglat);
      this.panBy([0, this.panLength]);
    },
    panTo(lnglat) {
      this.PanViewModel.panTo(lnglat);
    },
    panBy(point) {
      this.PanViewModel.panBy(point);
    },

    setPanImg() {
      this.panImgClass = "ctrl-container-pan";
    },
    setPanWestImg() {
      this.panImgClass = "ctrl-container-pan-west";
    },
    setPanEastImg() {
      this.panImgClass = "ctrl-container-pan-east";
    },
    setPanNorthImg() {
      this.panImgClass = "ctrl-container-pan-north";
    },
    setPanSouthImg() {
      this.panImgClass = "ctrl-container-pan-south";
    }
  },
  loaded() {
    // todo 对map操作
    this.parentIsWebMapOrMap && (this.mapboxglClass = "mapboxgl-ctrl");
    this.PanViewModel = new PanViewModel(this.map);
    this.center = this.map.getCenter();
    this.lnglat = this.center;
  }
};
</script>
<style scoped>
.ctrl-container-position {
  position: relative;
  top: 0;
  left: 0;
}
.ctrl-container {
  width: 62px;
  height: 63px;
}
.ctrl-container-pan {
  background-image: url("../../assets/pan.png");
}
.ctrl-container-pan-east {
  background-image: url("../../assets/pan-east.png");
}
.ctrl-container-pan-west {
  background-image: url("../../assets/pan-west.png");
}
.ctrl-container-pan-north {
  background-image: url("../../assets/pan-north.png");
}
.ctrl-container-pan-south {
  background-image: url("../../assets/pan-south.png");
}
.ctrl-center {
  width: 17px;
  height: 17px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background-image: url("../../assets/pan.png");
  background-size: contain;
  cursor: pointer;
}
.ctrl-icon {
  width: 21px;
  height: 21px;
  padding: 0;
  /* background-color: transparent; */
  cursor: pointer;
}
.ctrl-pan-left {
  position: absolute;
  top: 21px;
}
.ctrl-pan-right {
  position: absolute;
  top: 21px;
  right: 0px;
}
.ctrl-pan-top {
  position: absolute;
  top: 0px;
  left: 21px;
}
.ctrl-pan-bottom {
  position: absolute;
  bottom: 0px;
  left: 21px;
}
</style>
