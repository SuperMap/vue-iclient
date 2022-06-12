<template>
  <div :id="target" class="sm-component-video-plus" :style="style">
    <slot></slot>
    <sm-spin v-if="loaded" size="large" :tip="$t('videoPlus.loadingTip')" :spinning="spinning" />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch, Emit } from 'vue-property-decorator';
import videoPlusEvent from 'vue-iclient/src/mapboxgl/_types/video-plus-event';
import VideoPlusViewModel, { EVENTS } from './VideoPlusViewModel';
import SmSpin from 'vue-iclient/src/common/spin/Spin.vue';

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
  @Prop() url: string;
  @Prop() videoWidth: number;
  @Prop() videoHeight: number;
  @Prop({ default: false }) loop: boolean;
  @Prop({ default: false }) play: boolean;
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

  @Watch('url')
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
    return this.spinning && this.url;
  }

  created() {
    this.innerAutoplay = this.autoplay;
  }

  mounted() {
    this.createVideoPlus();
  }

  createVideoPlus() {
    const { target, url, loop, videoWidth, videoHeight } = this;
    this.viewModel = new VideoPlusViewModel({
      target,
      url,
      videoWidth,
      videoHeight,
      autoplay: this.innerAutoplay,
      loop
    });
    this._bindEvents();
  }

  resize() {
    // @ts-ignore
    if (this.viewModel && this.viewModel.resize) {
      // @ts-ignore
      this.viewModel.resize();
    }
  }

  _bindEvents() {
    Object.keys(this.$listeners).forEach(eventName => {
      if (EVENTS.includes(eventName)) {
        // @ts-ignore
        this.viewModel.on(eventName, this._bindMapEvent);
      }
    });
    // @ts-ignore
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
      this.load({ videoPlus: e.videoPlus });
    });
  }

  _bindMapEvent(e) {
    if (e.isLayer) {
      return;
    }
    this.$emit(e.type, e);
  }

  _clearEvents() {
    EVENTS.forEach(eventName => {
      // @ts-ignore
      this.viewModel.off(eventName, this._bindMapEvent);
    });
  }

  beforeDestroy() {
    this._clearEvents();
  }

  destroyed() {
    this.viewModel.removed();
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
