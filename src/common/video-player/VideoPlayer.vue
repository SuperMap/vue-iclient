<template>
  <div :class="['sm-component-video-player', {'sm-component-video-full-fill': isFullFill}]">
    <video-player
      ref="videoPlayer"
      class="sm-component-video-player__player sm-component-video-player__player--main"
      :options="playerOptions"
      :playsinline="true"
      :data-autoplay="autoplay"
      :data-popupplay="`${options.popupToPlay}`"
      :events = "['fullscreenchange']"
      @play="onPlayerPlay($event)"
      @ended="onPlayerEnded($event)"
      @loadeddata="onPlayerLoadeddata($event)"
      @ready="getPlayer"
      @fullscreenchange="onFullscreenchange"
    ></video-player>
    <sm-modal
      v-if="url"
      :class="{'sm-component-video-full-fill': isFullFill}"
      v-model="modalVisible"
      wrapClassName="sm-component-video-player-modal"
      :footer="null"
      width="60%"
      :maskClosable="false"
    >
      <video-player
        ref="modalVideoPlayer"
        class="sm-component-video-player__player"
        :options="modalPlayerOptions"
        :playsinline="true"
        :data-autoplay="autoplay"
        :data-popupplay="`${options.popupToPlay}`"
        @play="onModalPlayerPlay($event)"
        @loadeddata="onModalPlayerLoadeddata($event)"
        @ready="getPlayer"
      ></video-player>
    </sm-modal>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Watch, Prop } from 'vue-property-decorator';
import 'video.js/dist/video-js.css';
import _videojs from 'video.js';
import flvjs from 'flv.js';
import 'videojs-flvjs-es6';
import 'videojs-flash';
import { videoPlayer } from 'vue-videojs7';
import SmModal from 'vue-iclient/src/common/modal/main';
import Message from 'vue-iclient/src/common/message/index.js';

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
  suppressNotSupportedError?: Boolean;
  techOrder?: Array<string>;
  flash?: any;
  flvjs?: any;
}

@Component({
  name: 'SmVideoPlayer',
  components: {
    videoPlayer,
    SmModal
  }
})
class SmVideoPlayer extends Vue {
  isFirst: Boolean = true;

  modalVisible: Boolean = false;

  playerOptions: playerOptions = {};

  modalPlayerOptions: playerOptions = {};

  $t: any;

  modalVideoPlayer: any;

  smPlayer: any;

  @Prop() url: string; // 视频地址

  @Prop({ default: 'https://vjs.zencdn.net/swf/5.4.2/video-js.swf' }) swf: string;

  @Prop({ default: false }) isFullscreen: Boolean;

  @Prop({ default: 'origin' }) ratio: String;

  @Prop({
    default: () => {
      return { muted: true, loop: false, popupToPlay: false, autoplay: false, controlBar: true, poster: '' };
    }
  })
  options: {
    muted?: Boolean; // 是否静音
    loop?: Boolean; // 是否循环播放
    popupToPlay?: Boolean; // 是否打开弹窗播放
    autoplay?: Boolean; // 是否自动播放
    controlBar?: Boolean; // 是否显示控制条
    poster?:string; // 封面
  };

  get isFlv() {
    if (!flvjs && this.checkUrl(this.url) && this.url.includes('.flv')) {
      console.error(this.$t('warning.flvPlayer'));
      return false;
    }
    // @ts-ignore
    return flvjs.isSupported() && this.checkUrl(this.url) && this.url.includes('.flv');
  }

  get autoplay() {
    return this.options.autoplay && this.checkUrl(this.url);
  }

  get player() {
    return this.modalVisible ? this.modalVideoPlayer : this.smPlayer;
  }

  get isFullFill() {
    return this.ratio === 'full';
  }

  @Watch('modalVisible')
  modalVisibleChanged() {
    if (this.modalVisible && this.modalVideoPlayer) {
      this.handlePlayerOptions();
      this.modalVideoPlayer.currentTime(0);
      this.modalVideoPlayer.play();
    }
    if (!this.modalVisible && this.modalVideoPlayer) {
      this.modalVideoPlayer.reset();
    }
  }

  @Watch('url')
  urlChanged() {
    this.handlePlayerOptions();
  }

  @Watch('playerOptions')
  playerOptionsChanged() {
    if (this.player && this.player.el_) {
      this.player.load();
    }
  }

  @Watch('options')
  optionsChanged() {
    this.handlePlayerOptions();
  }

  @Watch('options.popupToPlay')
  popupChanged() {
    if (this.options.popupToPlay) {
      // @ts-ignore
      this.modalVideoPlayer = this.$refs.modalVideoPlayer && this.$refs.modalVideoPlayer.player;
    }
  }

  beforeCreate() {
    if (!_videojs) {
      console.error(this.$t('warning.videojs'));
    }
  }

  created() {
    this.handlePlayerOptions();
  }

  getPlayer() {
    setTimeout(() => {
      // @ts-ignore
      this.smPlayer = this.$refs.videoPlayer && this.$refs.videoPlayer.player;
      // @ts-ignore
      this.modalVideoPlayer = this.$refs.modalVideoPlayer && this.$refs.modalVideoPlayer.player;
      const player = this.modalVisible ? this.modalVideoPlayer : this.smPlayer;
      if (player) {
        player.muted(this.options.muted);
        if (this.options.muted) {
          player.volume(0);
        }
      }
      this.$emit('instance-loaded', player);
    });
  }

  clearSrc() {
    if (this.playerOptions.sources) {
      this.playerOptions.sources[0].src = '';
      this.modalPlayerOptions.sources[0].src = '';
    }
  }

  handlePlayerOptions(options = this.options) {
    if (!this.url) {
      this.clearSrc();
      this.playerOptions.suppressNotSupportedError = true;
      return {};
    }
    if (!this.checkUrl(this.url)) {
      // @ts-ignore
      Message.warning(this.$t('warning.unsupportedVideoAddress'), 1);
      this.clearSrc();
      return {};
    }
    if (!this.isMatchPosterUrl(options.poster)) {
      // @ts-ignore
      Message.warning(this.$t('warning.unsupportedPosterAddress'), 1);
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
      techOrder: ['html5'],
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
          hasAudio: true
        }
      },
      preload: 'auto',
      poster: options.poster || '',
      controlBar: {
        timeDivider: false,
        durationDisplay: false,
        remainingTimeDisplay: false,
        fullscreenToggle: true
      },
      notSupportedMessage: this.$t('warning.unavailableVideo')
    };
    if (this.url.includes('.flv')) {
      commonOptions.techOrder = ['html5', 'flvjs'];
      // @ts-ignore
      commonOptions.sources[0].type = 'video/x-flv';
    }
    if (this.url.includes('.mp4')) {
      // @ts-ignore
      commonOptions.sources[0].type = 'video/mp4';
    }
    if (this.url.includes('.m3u8')) {
      // @ts-ignore
      commonOptions.sources[0].type = 'application/x-mpegURL';
    }
    this.playerOptions = Object.assign({}, commonOptions, { autoplay: options.autoplay });
    this.modalPlayerOptions = Object.assign({}, commonOptions, { autoplay: true, preload: 'none', height: '600' });
    return commonOptions;
  }

  onPlayerPlay(player) {
    if (!player || !this.checkUrl(this.url)) {
      return;
    }
    if (this.isFirst && this.options.popupToPlay) {
      // @ts-ignore
      Message.info(this.$t('info.pressEscToExit'), 3);
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
    if (!this.options.popupToPlay && this.isFullscreen) {
      player.requestFullscreen();
    }
  }

  onFullscreenchange(e) {
    if(!e.isFullscreen()) {
      e.pause();
    }
  }

  onModalPlayerPlay(player) {
    this.handleControlBar(player);
  }

  onModalPlayerLoadeddata(player) {
    // @ts-ignore
    this.modalVideoPlayer = player;
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
      !this.isMatchVideoUrl(url) ||
      (url.indexOf('ogg') < 0 &&
        url.indexOf('mp4') < 0 &&
        url.indexOf('webm') < 0 &&
        url.indexOf('m3u8') < 0 &&
        url.indexOf('flv') < 0)
    ) {
      match = false;
    } else {
      match = true;
    }
    return match;
  }

  isMatchVideoUrl(str) {
    if (!str) return false;
    const isFilePath = this.isMatchFileUrl(str);
    if(isFilePath) return true;
    const reg = new RegExp('(https?|http|file|ftp)://[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]');
    return reg.test(str);
  }

  isMatchPosterUrl(str) {
    if (!str) return true;
    const isFilePath = this.isMatchFileUrl(str);
    if(isFilePath) return true;
    const reg = new RegExp('(https?|http|file)://[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]');
    return reg.test(str);
  }

  isMatchFileUrl(str) {
    const patt = /^((\.\.\/)|(\.\/))/g;
    return patt.test(str);
  }
}
export default SmVideoPlayer;
</script>
