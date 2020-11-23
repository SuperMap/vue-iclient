<template>
  <div class="sm-component-video-player">
    <video-player
      ref="videoPlayer"
      class="sm-component-video-player__player sm-component-video-player__player--main"
      :options="playerOptions"
      :playsinline="true"
      :data-autoplay="autoplay"
      :data-isLive="isRtmp"
      @play="onPlayerPlay($event)"
      @ended="onPlayerEnded($event)"
      @loadeddata="onPlayerLoadeddata($event)"
      @hook:mounted="getPlayer"
    ></video-player>
    <a-modal
      v-if="url"
      v-model="modalVisible"
      wrapClassName="sm-component-video-player-modal"
      :footer="null"
      width="60%"
      :maskClosable="false"
    >
      <video-player
        ref="videoPlayer"
        class="sm-component-video-player__player"
        :options="modalPlayerOptions"
        :playsinline="true"
        @play="onModalPlayerPlay($event)"
        @loadeddata="onModalPlayerLoadeddata($event)"
        @hook:mounted="getPlayer"
      ></video-player>
    </a-modal>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Watch, Prop } from 'vue-property-decorator';
import 'video.js/dist/video-js.css';
import 'video.js';
import flvjs from 'flv.js/dist/flv';
import 'videojs-flvjs-es6';
import 'videojs-contrib-hls';
import 'videojs-flash';
import { videoPlayer } from 'vue-videojs7';
import cloneDeep from 'lodash.clonedeep';

interface playerOptions {
  height?: string;
  autoplay?: Boolean;
  muted?: Boolean;
  loop?: Boolean;
  fluid?: Boolean;
  language?: string;
  playbackRates?: Array<string>;
  sources?: Array<{ type?: string; src: string }>;
  preload?: string;
  poster?: string;
  controlBar?: any;
  notSupportedMessage?: string;
  techOrder?: Array<string>;
  flash?: any;
  flvjs?: any;
}
// @ts-ignore
window.flvjs = flvjs;

@Component({
  name: 'SmVideoPlayer',
  components: {
    videoPlayer
  }
})
class SmVideoPlayer extends Vue {
  isFirst: Boolean = true;

  modalVisible: Boolean = false;

  $message: any;

  $t: any;

  @Prop() url: string; // 视频地址

  @Prop({ default: 'https://vjs.zencdn.net/swf/5.4.2/video-js.swf' }) swf: string;

  @Prop({ default: 3000 }) replayTime: number; // 黑屏重新播放rtmp

  @Prop({
    default: () => {
      return { muted: true, loop: false, popupToPlay: false, autoplay: false, controlBar: true };
    }
  })
  options: {
    muted?: Boolean; // 是否静音
    loop?: Boolean; // 是否循环播放
    popupToPlay?: Boolean; // 是否打开弹窗播放
    autoplay?: Boolean; // 是否自动播放
    controlBar?: Boolean; // 是否显示控制条
  };

  get isRtmp() {
    return this.checkUrl(this.url) && this.url.includes('rtmp://');
  }

  get isFlv() {
    // @ts-ignore
    return flvjs.isSupported() && this.checkUrl(this.url) && this.url.includes('.flv');
  }

  get playerOptions() {
    const options = this.handlePlayerOptions(this.options) || {};
    const autoplay = this.isRtmp || this.options.autoplay;
    return Object.assign({}, options, { autoplay });
  }

  get modalPlayerOptions() {
    const options = this.handlePlayerOptions(this.options) || {};
    return Object.assign({}, options, { autoplay: true, preload: 'none', height: '600' });
  }

  get autoplay() {
    return this.options.autoplay && this.checkUrl(this.url);
  }
  @Watch('modalVisible')
  modalVisibleChanged() {
    // @ts-ignore
    this.smPlayer = this.$refs.videoPlayer && this.$refs.videoPlayer.player;
    // @ts-ignore
    if (this.modalVisible && this.smPlayer) {
      // @ts-ignore
      this.smPlayer.currentTime(0);
      // @ts-ignore
      this.smPlayer.play();
    }
  }

  @Watch('url')
  urlChanged() {
    this.initFlvPlayer();
    this.handlePlayerOptions(this.options);
  }

  @Watch('playerOptions')
  playerOptionsChanged() {
    // @ts-ignore
    if (this.flvPlayer && this.isFlv) {
      // @ts-ignore
      this.supportFlv(this.flvPlayer);
      return;
    }
    // @ts-ignore
    if (this.smPlayer && this.smPlayer.el_) {
      // @ts-ignore
      this.smPlayer.load();
    }
  }

  @Watch('options')
  optionsChanged() {
    this.handlePlayerOptions(this.options);
  }

  @Watch('options.popupToPlay')
  popupChanged() {
    if (this.options.popupToPlay) {
      // @ts-ignore
      this.smPlayer = this.$refs.videoPlayer && this.$refs.videoPlayer.player;
    }
  }

  mounted() {
    setTimeout(() => {
      this.initFlvPlayer();
      // @ts-ignore
      this.supportFlv(this.flvPlayer);
    }, 5000);
  }

  getPlayer() {
    setTimeout(() => {
      const ref = this.$refs.videoPlayer;
      // @ts-ignore
      this.smPlayer = ref && ref.player;
      setTimeout(() => {
        // @ts-ignore
        this.video = ref && ref.$refs && ref.$refs.video;
        this.replayRtmp();
      });
    });
  }

  replayRtmp() {
    // @ts-ignore
    if (this.isRtmp && this.smPlayer) {
      // @ts-ignore
      this.smPlayer.on('play', e => {
        // @ts-ignore
        this.timer = setTimeout(() => {
          // @ts-ignore
          clearTimeout(this.timer);
          // @ts-ignore
          this.smPlayer.reset();
          setTimeout(() => {
            // @ts-ignore
            this.smPlayer.src(this.playerOptions.sources);
          });
        }, this.replayTime);
      });
      // @ts-ignore
      this.smPlayer.on('canplay', e => {
        // @ts-ignore
        clearTimeout(this.timer);
      });
    }
  }

  initFlvPlayer() {
    if (this.isFlv) {
      // @ts-ignore
      this.flvPlayer = flvjs.createPlayer({
        type: 'flv',
        url: this.url
      });
    } else {
      // @ts-ignore
      this.flvPlayer = null;
    }
  }

  supportFlv(flvPlayer) {
    if (flvPlayer && this.isFlv) {
      // @ts-ignore;
      const videoElement = this.$refs.videoPlayer && this.$refs.videoPlayer.$refs && this.$refs.videoPlayer.$refs.video;
      flvPlayer.attachMediaElement(videoElement);
      // @ts-ignore;
      flvPlayer.load();
      // @ts-ignore;
      flvPlayer.play();
    }
  }

  handlePlayerOptions(options) {
    if (!this.url) {
      return {};
    }
    if (!this.checkUrl(this.url)) {
      this.$message.warning(this.$t('warning.unsupportedVideoAddress'), 1);
      return {};
    }
    let commonOptions: playerOptions = {
      height: '100%',
      autoplay: options.autoplay !== null ? options.autoplay : false,
      muted: options.muted !== null ? options.muted : true,
      loop: options.loop !== null ? options.loop : false,
      fluid: false,
      language: 'zh-CN',
      playbackRates: ['0.7', '1.0', '1.5', '2.0'],
      sources: [
        {
          src: this.url // t=xx && preload=metadata 可以保证加载某一帧作为封面，目前没有更好的方案；
        }
      ],
      techOrder: ['flvjs', 'flash', 'html5'],
      flash: {
        hls: {
          withCredentials: false
        },
        swf: this.swf
      },
      flvjs: {
        mediaDataSource: {
          isLive: true,
          cors: true,
          hasAudio: false
        }
      },
      preload: 'auto',
      poster: '',
      controlBar: {
        timeDivider: false,
        durationDisplay: false,
        remainingTimeDisplay: false,
        fullscreenToggle: true
      },
      notSupportedMessage: this.$t('warning.unavailableVideo')
    };
    if (!this.url.includes('rtmp') && this.url.includes('.flv')) {
      // @ts-ignore
      commonOptions.sources[0].type = 'video/x-flv';
    }
    if (this.url.includes('rtmp')) {
      // @ts-ignore
      commonOptions.sources[0].type = 'rtmp/flv';
    }
    if (this.url.includes('.m3u8')) {
      // @ts-ignore
      commonOptions.sources[0].type = 'application/x-mpegURL';
    }
    return commonOptions;
  }

  onPlayerPlay(player) {
    if (!player || !this.checkUrl(this.url)) {
      return;
    }
    if (this.isFirst && this.options.popupToPlay) {
      this.$message.info(this.$t('info.pressEscToExit'), 3);
    }
    if (this.isFirst && !this.options.popupToPlay && !this.options.autoplay) {
      // 重置默认振
      player.currentTime(0);
      this.isFirst = false;
    }
    if (this.options.popupToPlay) {
      player.pause();
      player.currentTime(1);
      player.controlBar.el_.style.visibility = 'hidden';
      this.modalVisible = true;
    } else {
      this.handleControlBar(player);
    }
  }

  onModalPlayerPlay(player) {
    this.handleControlBar(player);
  }
  onModalPlayerLoadeddata(player) {
    // @ts-ignore
    this.smPlayer = player;
    player.play(); // 强制进行 play， issues- https://github.com/surmon-china/vue-video-player/issues/224
    this.handleControlBar(player);
  }

  onPlayerEnded(player) {
    if (!this.options.autoplay && !this.options.popupToPlay) {
      player.currentTime(1);
      this.isFirst = true;
    }
  }

  onPlayerLoadeddata(player) {
    if (!player || !this.checkUrl(this.url)) {
      return;
    }
    this.options.popupToPlay && player.pause();
    !this.options.popupToPlay && this.options.autoplay && player.play();
  }

  handleControlBar(player) {
    let isControlBarShow = this.options.controlBar === null ? true : this.options.controlBar;
    if (isControlBarShow) {
      player.controlBar.el_.style.visibility = 'visible'; // player.controlBar.off() 不起作用
    } else {
      player.controlBar.el_.style.visibility = 'hidden';
    }
  }

  checkUrl(url) {
    let match;
    if (
      url === '' ||
      !this.isMatchUrl(url) ||
      (url.indexOf('ogg') < 0 &&
        url.indexOf('mp4') < 0 &&
        url.indexOf('webm') < 0 &&
        url.indexOf('m3u8') < 0 &&
        url.indexOf('flv') < 0 &&
        url.indexOf('rtmp') < 0)
    ) {
      match = false;
    } else {
      match = true;
    }
    return match;
  }

  isMatchUrl(str) {
    const reg = new RegExp('(https?|http|file|ftp|rtmp)://[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]');
    return reg.test(str);
  }
}
export default SmVideoPlayer;
</script>
