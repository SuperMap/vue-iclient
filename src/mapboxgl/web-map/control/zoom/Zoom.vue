<template>
  <div class="sm-component-zoom">
    <div class="sm-component-zoom__buttons" :style="[collapseCardHeaderBgStyle, getTextColorStyle]">
      <sm-button
        class="sm-component-zoom__button sm-component-zoom__button--zoomin"
        :disabled="!canZoomIn"
        @click="zoomIn"
      >
        <i class="sm-components-icon-plus" />
      </sm-button>
      <div class="sm-component-zoom__button--split" />
      <sm-button
        :class="['sm-component-zoom__button sm-component-zoom__button--zoomout', showZoom && 'follow-zoom-value']"
        :disabled="!canZoomOut"
        @click="zoomOut"
      >
        <i class="sm-components-icon-minus" />
      </sm-button>
      <template v-if="showZoom">
        <div class="sm-component-zoom__button--split" />
        <sm-button class="sm-component-zoom__button sm-component-zoom__button--show-zoom">
          <span>{{ Math.round(zoomPosition) }}</span>
        </sm-button>
      </template>
    </div>
    <div v-show="showZoomSlider" class="sm-component-zoom__slider">
      <sm-slider
        v-model="zoomPosition"
        :min="min"
        :max="max"
        :step="0.01"
        vertical
        :style="getColorStyle(0)"
        @change="sliderChange"
      />
    </div>
  </div>
</template>
<script>
import Theme from '../../../../common/_mixin/Theme';
import Control from '../../../_mixin/control';
import MapGetter from '../../../_mixin/map-getter';
import ZoomViewModel from './ZoomViewModel';
import SmButton from '../../../../common/button/Button';
import SmSlider from '../../../../common/slider/Slider';

export default {
  name: 'SmZoom',
  components: {
    SmButton,
    SmSlider
  },
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
  created() {
    this.viewModel = new ZoomViewModel();
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
