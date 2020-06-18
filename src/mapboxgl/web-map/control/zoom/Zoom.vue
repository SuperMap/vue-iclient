<template>
  <div class="sm-component-zoom">
    <div class="sm-component-zoom__buttons" :style="[getBackgroundStyle, getTextColorStyle]">
      <a-button
        autofocus="false"
        class="sm-component-zoom__button sm-component-zoom__button--zoomin"
        icon="plus"
        :disabled="!canZoomIn"
        :style="
          activeZoomMode === 'zoomInBtn' ? [getColorStyle(0), activieBgColor] : [getTextColorStyle, getBackgroundStyle]
        "
        @click="zoomIn"
      ></a-button>
      <a-button
        autofocus="false"
        class="sm-component-zoom__button sm-component-zoom__button--zoomout"
        icon="minus"
        :disabled="!canZoomOut"
        :style="
          activeZoomMode === 'zoomOutBtn' ? [getColorStyle(0), activieBgColor] : [getTextColorStyle, getBackgroundStyle]
        "
        @click="zoomOut"
      ></a-button>
      <div
        v-if="showZoom"
        class="sm-component-zoom__show-zoom"
        :style="showZoomStyle"
      >{{ Math.round(zoomPosition) }}</div>
    </div>
    <div v-show="showZoomSlider" class="sm-component-zoom__slider">
      <a-slider
        v-model="zoomPosition"
        :min="min"
        :max="max"
        :step="0.01"
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
import { getColorWithOpacity } from '../../../../common/_utils/util';

export default {
  name: 'SmZoom',
  mixins: [MapGetter, Control, Theme],
  props: {
    showZoom: {
      type: Boolean,
      default: false
    },
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
      activeZoomMode: '',
      canZoomIn: true,
      canZoomOut: true
    };
  },
  computed: {
    activieBgColor() {
      const color = this.getColorStyle(0).color;
      return {
        backgroundColor: this.getBackground,
        borderColor: color
      };
    },
    showZoomStyle() {
      return {
        color: getColorWithOpacity(this.getBackground, 1),
        background: this.getTextColor
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
  created() {
    this.viewModel = new ZoomViewModel();
  },
  mounted() {
    this.changeSliderStyle();
  },
  methods: {
    sliderChange() {
      const mapNotLoaded = this.mapNotLoadedTip();
      if (mapNotLoaded) {
        this.zoomPosition = 0;
        return;
      }
      this.setZoom(this.zoomPosition);
    },
    zoomIn(e) {
      const mapNotLoaded = this.mapNotLoadedTip();
      if (mapNotLoaded) {
        return;
      }
      this.activeZoomMode = 'zoomInBtn';
      if (this.zoomPosition + 1 <= this.max) {
        // slider的默认步长为1
        this.zoomPosition += 1;
        // 地图放大一级
      } else {
        this.zoomPosition = this.max;
      }
      this.viewModel.zoomIn();
    },
    zoomOut(e) {
      const mapNotLoaded = this.mapNotLoadedTip();
      if (mapNotLoaded) {
        return;
      }
      this.activeZoomMode = 'zoomOutBtn';
      if (this.zoomPosition - 1 >= this.min) {
        this.zoomPosition -= 1;
      } else {
        this.zoomPosition = this.min;
      }
      // 地图缩小一级
      this.viewModel.zoomOut();
    },
    getMaxZoom() {
      return this.viewModel && this.viewModel.getMaxZoom();
    },
    getMinZoom() {
      return this.viewModel && this.viewModel.getMinZoom();
    },
    getZoom() {
      return this.viewModel && this.viewModel.getZoom();
    },
    setZoom(zoom) {
      return this.viewModel && this.viewModel.setZoom(zoom);
    },
    getZoomPosition() {
      if (this.canZoomOut || this.canZoomIn) {
        return this.getZoom();
      }
      if (!this.canZoomIn) {
        return this.getMinZoom();
      }
      if (!this.canZoomOut) {
        return this.getMaxZoom();
      }
    },
    changeSliderStyle() {
      const sliderBar = document.querySelector('.ant-slider-track');
      const sliderBtn = document.querySelector('.ant-slider-handle');
      sliderBar && (sliderBar.style.backgroundColor = this.getColorStyle(0).color);
      sliderBtn && (sliderBtn.style.borderColor = this.getColorStyle(0).color);
    }
  },
  loaded() {
    this.canZoomIn = this.getMaxZoom() > this.getZoom();
    this.canZoomOut = this.getMinZoom() < this.getZoom();
    this.map.on('zoomend', () => {
      this.activeZoomMode = '';
      if (this.getMaxZoom() <= this.getZoom()) {
        this.canZoomIn = false;
      } else {
        this.canZoomIn = true;
      }
      if (this.getMinZoom() >= this.getZoom()) {
        this.canZoomOut = false;
      } else {
        this.canZoomOut = true;
      }
      // 设置slider初始值
      this.zoomPosition = this.getZoomPosition();
    });
    // 设置slider的最大最小值
    this.min = this.getMinZoom();
    this.max = this.getMaxZoom();

    // 设置slider初始值
    this.zoomPosition = this.getZoomPosition();

    // ZoomViewModel中监听滚轮事件(滚轮缩放地图)，改变slider的值
    this.viewModel.wheelEventOn(() => {
      this.zoomPosition = this.getZoomPosition();
    });
    // this.viewModel.on('mouseWheel', () => {
    //   this.zoomPosition = this.getZoomPosition();
    // });
  }
};
</script>
