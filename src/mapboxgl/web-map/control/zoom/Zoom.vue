<template>
  <div class="sm-widget-zoom">
    <div class="sm-widget-zoom__buttons" :style="[getBackgroundStyle, getTextColorStyle]">
      <a-button
        class="sm-widget-zoom__button"
        icon="plus"
        :style="activeZoomMode === 'zoomInBtn' ? [getColorStyle(0), activieBgColor] : ''"
        @click="zoomIn"
      ></a-button>
      <a-button
        class="sm-widget-zoom__button"
        icon="minus"
        :style="activeZoomMode === 'zoomOutBtn' ? [getColorStyle(0), activieBgColor] : ''"
        @click="zoomOut"
      ></a-button>
    </div>
    <div class="sm-widget-zoom__slider">
      <a-slider
        v-if="showZoomSlider"
        v-model="zoomPosition"
        :min="min"
        :max="max"
        vertical
        :style="getColorStyle(0)"
        @change="sliderChange"
      ></a-slider>
    </div>
  </div>
</template>
<script>
import Theme from '../../../../common/_mixin/theme';
import Control from '../../../_mixin/control';
import MapGetter from '../../../_mixin/map-getter';
import ZoomViewModel from './ZoomViewModel';
import { hexToRgba } from '../../../../common/_utils/CommonUtil';

export default {
  name: 'SmZoom',
  mixins: [MapGetter, Control, Theme],
  props: {
    showZoomSlider: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      zoomPosition: 0,
      min: 0,
      max: 22,
      activeZoomMode: ''
    };
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
  watch: {
    colorGroupsData: {
      handler() {
        this.changeSliderStyle();
      }
    }
  },
  mounted() {
    this.changeSliderStyle();
  },
  methods: {
    sliderChange() {
      this.setZoom(this.zoomPosition);
    },
    zoomIn(e) {
      this.activeZoomMode = 'zoomInBtn';
      if (Math.round(this.zoomPosition) < this.max) {
        // slider的默认步长为1
        this.zoomPosition += 1;
        // 地图放大一级
        this.ZoomViewModel.zoomIn();
      }
    },
    zoomOut(e) {
      this.activeZoomMode = 'zoomOutBtn';
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
      const sliderBar = document.querySelector('.ant-slider-track');
      const sliderBtn = document.querySelector('.ant-slider-handle');
      sliderBar && (sliderBar.style.backgroundColor = this.getColorStyle(0).color);
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
