<template>
  <div
    :class="['sm-component-pan', mapboxglClass]"
    :style="[collapseCardHeaderBgStyle, secondaryTextColorStyle]"
  >
    <div class="sm-component-pan__item" @click="panToCenter">
      <div class="sm-component-pan__center" :style="collapseCardHeaderBgStyle" />
      <i class="sm-components-icon-fullscreen" />
    </div>
    <div class="sm-component-pan__item" @click="panToLeft">
      <div class="sm-component-pan__icon is-left" />
      <i class="sm-components-icon-solid-triangle-left" />
    </div>
    <div class="sm-component-pan__item" @click="panToRight">
      <div class="sm-component-pan__icon is-right" />
      <i class="sm-components-icon-solid-triangle-right" />
    </div>
    <div class="sm-component-pan__item" @click="panToTop">
      <div class="sm-component-pan__icon is-top" />
      <i class="sm-components-icon-solid-triangle-up" />
    </div>
    <div class="sm-component-pan__item" @click="panToBottom">
      <div class="sm-component-pan__icon is-bottom" />
      <i class="sm-components-icon-solid-triangle-down" />
    </div>
  </div>
</template>
<script>
import PanViewModel from 'vue-iclient-core/controllers/mapboxgl/PanViewModel';
import MapGetter from 'vue-iclient/src/common/_mixin/map-getter';
import Control from 'vue-iclient/src/mapboxgl/_mixin/control';
import Theme from 'vue-iclient/src/common/_mixin/Theme';

export default {
  name: 'SmPan',
  mixins: [MapGetter, Control, Theme],
  props: {
    panLength: {
      type: Number,
      default: 200
    }
  },
  data() {
    return {
      center: null,
      mapboxglClass: ''
    };
  },
  created() {
    this.viewModel = new PanViewModel();
  },
  methods: {
    panToCenter() {
      this.lnglat = this.center;
      this.panTo(this.lnglat);
    },
    panToLeft() {
      this.panBy([-this.panLength, 0]);
    },
    panToRight() {
      this.panBy([this.panLength, 0]);
    },
    panToTop() {
      this.panBy([0, -this.panLength]);
    },
    panToBottom() {
      this.panBy([0, this.panLength]);
    },
    panTo(lnglat) {
      const mapNotLoaded = this.mapNotLoadedTip();
      if (mapNotLoaded) {
        return;
      }
      this.viewModel.panTo(lnglat);
    },
    panBy(point) {
      const mapNotLoaded = this.mapNotLoadedTip();
      if (mapNotLoaded) {
        return;
      }
      this.viewModel.panBy(point);
    }
  },
  loaded() {
    this.parentIsWebMapOrMap && (this.mapboxglClass = 'mapboxgl-ctrl');
    this.center = this.map.getCenter();
    this.lnglat = this.center;
  }
};
</script>
