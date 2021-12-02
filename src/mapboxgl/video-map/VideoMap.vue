<template>
  <div :id="target" class="sm-component-video-map" :style="style">
    <slot></slot>
    <sm-spin v-if="loaded" size="large" :tip="$t('videoMap.loadingTip')" :spinning="spinning" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Mixins, Emit } from 'vue-property-decorator';
import mapEvent from 'vue-iclient/src/mapboxgl/_types/video-map-event';
// import VmUpdater from 'vue-iclient/src/common/_mixin/VmUpdater';
import MapEvents from 'vue-iclient/src/mapboxgl/web-map/_mixin/map-events';
import VideoMapViewModel from './VideoMapViewModel';
import SmSpin from 'vue-iclient/src/common/spin/Spin.vue';
// api上的mapbox方法如何体现 ？
// 封装组件与api有什么不同 ？
const MAP_EVENTS = [
  'resize',
  'webglcontextlost',
  'webglcontextrestored',
  'remove',
  'movestart',
  'load',
  'contextmenu',
  'dblclick',
  'click',
  'touchcancel',
  'touchmove',
  'touchend',
  'touchstart',
  'dataloading',
  'mousemove',
  'mouseup',
  'mousedown',
  'sourcedataloading',
  'error',
  'data',
  'styledata',
  'sourcedata',
  'mouseout',
  'styledataloading',
  'moveend',
  'move',
  'render',
  'zoom',
  'zoomstart',
  'zoomend',
  'boxzoomstart',
  'boxzoomcancel',
  'boxzoomend',
  'rotate',
  'rotatestart',
  'rotateend',
  'dragend',
  'drag',
  'dragstart',
  'pitch',
  'idle'
];

@Component({
  name: 'SmVideoMap',
  components: {
    SmSpin
  }
})
class SmVideoMap extends Mixins(MapEvents) {
  viewModel: VideoMapViewModel = null;
  spinning = true;
  innerAutoplay = false;

  @Prop({ default: 'map' }) target: string;

  @Prop({
    default: () => {
      return {};
    }
  })
  videoParameters: Object;

  @Prop() src: string;
  @Prop({ default: false }) loop: boolean;
  @Prop({ default: false }) play: boolean;
  @Prop() videoWidth: number;
  @Prop() videoHeight: number;
  @Prop({ default: false }) autoplay: boolean;

  @Watch('play')
  playChanged(val) {
    if (val) {
      this.viewModel.play();
    } else {
      this.viewModel.pause();
      this.innerAutoplay = false;
    }
  }

  @Watch('videoParameters')
  videoParametersChanged(val) {
    this.setVideoParameters(val);
  }

  @Watch('src')
  addressChanged() {
    if (this.viewModel) {
      this.viewModel.destroy();
    }
    this.createVideoMap();
  }

  get style() {
    return {
      width: '100%',
      height: '100%'
    };
  }

  get loaded() {
    return this.spinning && this.src;
  }

  created() {
    this.innerAutoplay = this.autoplay;
  }

  mounted() {
    this.createVideoMap();
  }

  createVideoMap() {
    this.viewModel = new VideoMapViewModel({
      container: this.target,
      src: this.src,
      // @ts-ignore
      videoParameters: this.videoParameters,
      autoplay: this.innerAutoplay,
      loop: this.loop,
      videoWidth: this.videoWidth,
      videoHeight: this.videoHeight
    });
    this._bindEvents();
  }

  setVideoParameters(videoParameters) {
    this.viewModel && this.viewModel.setVideoParameters(videoParameters);
  }

  _bindEvents() {
    Object.keys(this.$listeners).forEach(eventName => {
      if (MAP_EVENTS.includes(eventName)) {
        this.viewModel.on(eventName, this._bindMapEvent);
      }
    });
    this.viewModel.on('load', e => {
      this.spinning = false;
      mapEvent.$options.setMap(this.target, e.videoMap);
      mapEvent.$emit('load-map', e.videoMap, this.target);
      /**
       * @event load
       * @desc videomap 加载完成之后触发。
       * @property {mapboxgl.Map} map - MapBoxGL Map 对象。
       */
      this.load({ map: e.map });
    });
    this.viewModel.on('timeupdate', ({ time }) => {
      /**
       * @event timeupdate
       * @desc 视频地图播放后每帧触发。
       * @property time - 视频开始播放后的秒数。
       */
      this.timeupdate({ time });
    });
  }

  _bindMapEvent(e) {
    this.$emit(e.type, e);
  }

  _clearEvents() {
    MAP_EVENTS.forEach(eventName => {
      this.viewModel.off(eventName, this._bindMapEvent);
    });
  }

  beforeDestroy() {
    this.viewModel && this.viewModel.destroy();
    this._clearEvents();
  }

  destroyed() {
    mapEvent.$options.deleteMap(this.target);
  }

  /* emit */
  @Emit()
  load(value) {
    return value;
  }

  @Emit()
  timeupdate(time) {
    return time;
  }
}
export default SmVideoMap;
</script>
