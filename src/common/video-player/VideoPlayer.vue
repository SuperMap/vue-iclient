<template>
  <div class="sm-component-video-player">
    <video-player
      ref="videoPlayer"
      class="sm-component-video-player__player sm-component-video-player__player--main"
      :options="playerOptions"
      :playsinline="true"
      @play="onPlayerPlay($event)"
      @ended="onPlayerEnded($event)"
      @loadeddata="onPlayerLoadeddata($event)"
    >></video-player>
    <a-modal
      v-if="url"
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
        @play="onModalPlayerPlay($event)"
        @loadeddata="onModalPlayerLoadeddata($event)"
      ></video-player>
    </a-modal>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Watch, Prop } from 'vue-property-decorator';
import 'video.js/dist/video-js.css';
import { videoPlayer } from 'vue-video-player';
import cloneDeep from 'lodash.clonedeep';

interface playerOptions {
  height?: string;
  autoplay?: Boolean;
  muted?: Boolean;
  loop?: Boolean;
  fluid?: Boolean;
  language?: string;
  playbackRates?: Array<string>;
  sources?: Array<{ type: string; src: string }>;
  preload?: string;
  poster?: string;
  controlBar?: any;
  notSupportedMessage?: string;
}

@Component({
  name: 'SmVideoPlayer',
  components: {
    videoPlayer
  }
})
class SmVideoPlayer extends Vue {
  isFirst: Boolean = true;

  modalVisible: Boolean = false;

  modalVideoPlayer: any;

  playerOptions: playerOptions = {};

  modalPlayerOptions: playerOptions = {};

  $message: any;

  @Prop() url: string; // 视频地址

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

  get player() {
    // @ts-ignore
    return this.$refs.videoPlayer.player;
  }

  @Watch('modalVisible')
  modalVisibleChanged() {
    if (this.modalVisible && this.modalVideoPlayer) {
      this.modalVideoPlayer.currentTime(0);
      this.modalVideoPlayer.play();
    }
  }

  @Watch('url')
  urlChanged() {
    this.handlePlayerOptions();
  }

  @Watch('options')
  optionsChanged() {
    this.handlePlayerOptions();
  }

  created() {
    this.handlePlayerOptions();
  }

  handlePlayerOptions() {
    if (!this.url) {
      return;
    }
    if (!this.checkUrl(this.url)) {
      this.$message.warning('视频地址不合法', 1);
      if (this.playerOptions.sources) {
        this.playerOptions.sources[0].src = '';
        this.modalPlayerOptions.sources[0].src = '';
      }
      return;
    }

    let sourcesType = this.url.split('.');
    let commonOptions = {
      height: '100%',
      autoplay: this.options.autoplay !== null ? this.options.autoplay : false,
      muted: this.options.muted !== null ? this.options.muted : true,
      loop: this.options.loop !== null ? this.options.loop : false,
      fluid: false,
      language: 'zh-CN',
      playbackRates: [0.7, 1.0, 1.5, 2.0],
      sources: [
        {
          type: `video/${sourcesType[sourcesType.length - 1]}`,
          src: `${this.options.autoplay && !this.options.popupToPlay ? this.url : this.url + '#t=0.8'}` // t=xx && preload=metadata 可以保证加载某一帧作为封面，目前没有更好的方案；
        }
      ],
      preload: 'metadata',
      poster: '',
      controlBar: {
        timeDivider: false,
        durationDisplay: false,
        remainingTimeDisplay: false,
        fullscreenToggle: true
      },
      notSupportedMessage: '此视频暂无法播放，请稍后再试'
    };
    this.playerOptions = cloneDeep(commonOptions);
    this.modalPlayerOptions = cloneDeep(commonOptions);
    this.modalPlayerOptions.sources[0].src = this.url;
    this.modalPlayerOptions.autoplay = true;
    this.modalPlayerOptions.preload = 'none';
    this.modalPlayerOptions.height = '600';
  }

  onPlayerPlay(player) {
    if (!this.checkUrl(this.url)) {
      return;
    }
    if (this.isFirst && this.options.popupToPlay) {
      this.$message.info('按下 ESC 键或点击关闭按钮退出', 3);
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
    if (!this.checkUrl(this.url)) {
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
      (!this.isMatchUrl(url) || (url.indexOf('ogg') < 0 && url.indexOf('mp4') < 0 && url.indexOf('webm') < 0))
    ) {
      match = false;
    } else {
      match = true;
    }
    return match;
  }

  isMatchUrl(str) {
    const reg = new RegExp('(https?|http|file|ftp)://[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]');
    return reg.test(str);
  }
}
export default SmVideoPlayer;
</script>
