// 新创建一个vue实例实时监听获得map对象
import videoEvent from 'vue-iclient/src/mapboxgl/_types/video-plus-event';
import globalEvent from 'vue-iclient/src/common/_utils/global-event';

import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

function callHook(vm, hook, ...params) {
  const { options } = vm.constructor;
  options.mixins &&
    options.mixins.forEach(mixin => {
      mixin[hook] && mixin[hook].call(vm, ...params);
    });
  options[hook] && options[hook].call(vm, ...params); // 调用子组件的生命周期
}
/**
 * Description
 * @mixin MapGetter
 * @desc 监听 WebMap 和 Map 的 load 事件。
 * @category Mixin
 * @vue-computed {String} getMapTarget - 获取当前 Map 的 target。
 * @vue-event loaded - 组件加载渲染完成之后触发。
 */
@Component
export default class VideoPlusGetter extends Vue {
  videoPlus: any;
  viewModel: any;
  $message: any;
  $t: any;
  firstDefaultTarget: string;

  @Prop({ default: 'video' }) target: string;

  @Watch('target')
  targetChanged(newVal, oldVal) {
    if (newVal && oldVal && newVal !== oldVal) {
      // 多个map切换的时候，需要删除该组件与前一个map的图层绑定
      const prevTarget = oldVal || this.firstDefaultTarget;
      // @ts-ignore
      const prevVideo = videoEvent.$options.getVideo(prevTarget);
      if (prevVideo) {
        this.removeVideo(prevVideo, prevTarget);
      }
      // @ts-ignore
      if (videoEvent.$options.getVideo(newVal)) {
        this.loadVideo(newVal);
      }
    }
  }

  mounted() {
    const targetName = this.getTargetName();
    this.firstDefaultTarget = targetName;
    // @ts-ignore
    if (videoEvent.$options.getVideo(targetName)) {
      this.loadVideo(targetName);
    }
    videoEvent.$on('load-video', this.loadVideoSucceed);
    globalEvent.$on('delete-video', this.removeVideoSucceed);
  }

  beforeDestroy() {
    this.removeVideo();
    videoEvent.$off('load-video', this.loadVideoSucceed);
    globalEvent.$off('delete-video', this.removeVideoSucceed);
  }

  getFirstTarget(): string {
    let targetName: string;
    // @ts-ignore
    const mapList = videoEvent.$options.getAllVideos();
    for (let target in mapList) {
      if (target) {
        targetName = target;
        break;
      }
    }
    return targetName;
  }

  getTargetName() {
    const selfParent = this.$parent;
    const parentTarget =
      selfParent &&
      selfParent.$options.name &&
      // @ts-ignore
      selfParent.target;
    return this.target || parentTarget || this.getFirstTarget();
  }

  loadVideo(targetName) {
    if (!this.firstDefaultTarget) {
      this.firstDefaultTarget = targetName;
    }
    // @ts-ignore
    this.videoPlus = videoEvent.$options.getVideo(targetName);
    // @ts-ignore
    this.viewModel &&
      typeof this.viewModel.setVideoPlus === 'function' &&
      this.viewModel.setVideoPlus({ videoPlus: this.videoPlus, target: targetName });
    callHook(this, 'loaded', this.videoPlus, targetName);
    this.$nextTick(() => {
      /**
       * @event loaded
       * @desc 组件加载渲染完成之后触发。
       */
      this.$emit('loaded');
    });
  }

  removeVideo(videoPlus = this.videoPlus, target = this.getTargetName()) {
    if (videoPlus) {
      this.viewModel && this.viewModel.removed && this.viewModel.removed();
      callHook(this, 'removed', videoPlus, target);
      this.videoPlus = null;
      this.firstDefaultTarget = null;
    }
  }

  loadVideoSucceed(videoPlus, target) {
    const targetName = this.getTargetName();
    if (target === targetName) {
      this.loadVideo(target);
    }
  }

  removeVideoSucceed(target) {
    const targetName = this.getTargetName();
    if (target === targetName) {
      this.removeVideo();
    }
  }
}
