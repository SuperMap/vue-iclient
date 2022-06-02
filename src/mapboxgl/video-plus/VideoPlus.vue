<template>
  <div :id="target" class="sm-component-video-plus" :style="style">
    <slot></slot>
    <sm-spin v-if="loaded" size="large" :tip="$t('videoPlus.loadingTip')" :spinning="spinning" />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch, Emit } from 'vue-property-decorator';
import videoPlusEvent from 'vue-iclient/src/mapboxgl/_types/video-plus-event';
import VideoPlusViewModel from './VideoPlusViewModel';
import SmSpin from 'vue-iclient/src/common/spin/Spin.vue';

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
  name: 'SmVideoPlus',
  components: {
    SmSpin
  }
})

class SmVideoPlus extends Vue {
  viewModel: VideoPlusViewModel = null;
  spinning = true;
  innerAutoplay = false;
  @Prop({ default: 'video' }) target: string;
  @Prop() src: string;
  @Prop({ default: false }) loop: boolean;
  @Prop({ default: true }) play: boolean;
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

  @Watch('src')
  srcChanged() {
    if (this.viewModel) {
      this.viewModel.removed();
    }
    this.createVideoPlus();
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
    this.createVideoPlus();
  }

  createVideoPlus() {
    const { target, src, loop } = this;
    this.viewModel = new VideoPlusViewModel({
      target,
      src,
      // @ts-ignore
      autoplay: this.innerAutoplay,
      loop
    });
    this._bindEvents();
  }

  _bindEvents() {
    Object.keys(this.$listeners).forEach(eventName => {
      if (MAP_EVENTS.includes(eventName)) {
        this.viewModel.on(eventName, this._bindMapEvent);
      }
    });
    this.viewModel.on('load', e => {
      this.spinning = false;
      // @ts-ignore
      videoPlusEvent.$options.setVideo(this.target, e.videoPlus);
      videoPlusEvent.$emit('load-video', e.videoPlus, this.target);
      /**
       * @event load
       * @desc videoPlus 加载完成之后触发。
       * @property {mapboxgl.Map} map - MapBoxGL Map 对象。
       */
      this.load({ map: e.map, videoPlus: e.videoPlus });
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
    this.viewModel && this.viewModel.removed();
    this._clearEvents();
  }

  destroyed() {
    // @ts-ignore
    videoPlusEvent.$options.deleteVideo(this.target);
  }

  /* emit */
  @Emit()
  load(value) {
    return value;
  }
}
export default SmVideoPlus;
</script>
