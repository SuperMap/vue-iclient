<template>
  <div :class="['sm-component-pan', panImgClass, mapboxglClass]">
    <div class="sm-component-pan__center" @click="panToCenter"></div>
    <div
      class="sm-component-pan__icon is-left"
      @click="panToLeft"
      @mouseleave="setPanImg"
      @mouseenter="setPanWestImg"
    ></div>
    <div
      class="sm-component-pan__icon is-right"
      @click="panToRight"
      @mouseleave="setPanImg"
      @mouseenter="setPanEastImg"
    ></div>
    <div
      class="sm-component-pan__icon is-top"
      @click="panToTop"
      @mouseleave="setPanImg"
      @mouseenter="setPanNorthImg"
    ></div>
    <div
      class="sm-component-pan__icon is-bottom"
      @click="panToBottom"
      @mouseleave="setPanImg"
      @mouseenter="setPanSouthImg"
    ></div>
  </div>
</template>
<script>
import PanViewModel from './PanViewModel.js';
import MapGetter from '../../../_mixin/map-getter';
import Control from '../../../_mixin/control';

export default {
  name: 'SmPan',
  mixins: [MapGetter, Control],
  props: {
    panLength: {
      type: Number,
      default: 200
    }
  },
  data() {
    return {
      center: null,
      panImgClass: 'sm-component-pan--default',
      mapboxglClass: ''
    };
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
      this.panViewModel.panTo(lnglat);
    },
    panBy(point) {
      this.panViewModel.panBy(point);
    },

    setPanImg() {
      this.panImgClass = 'sm-component-pan--default';
    },
    setPanWestImg() {
      this.panImgClass = 'sm-component-pan--west';
    },
    setPanEastImg() {
      this.panImgClass = 'sm-component-pan--east';
    },
    setPanNorthImg() {
      this.panImgClass = 'sm-component-pan--north';
    },
    setPanSouthImg() {
      this.panImgClass = 'sm-component-pan--south';
    }
  },
  loaded() {
    this.parentIsWebMapOrMap && (this.mapboxglClass = 'mapboxgl-ctrl');
    this.panViewModel = new PanViewModel(this.map);
    this.center = this.map.getCenter();
    this.lnglat = this.center;
  }
};
</script>
