// 新创建一个vue实例实时监听获得map对象
import mapEvent from 'vue-iclient-core/types/map-event';
import MapWatcher from 'vue-iclient-core/mixin/MapWatcher';
import Message from 'vue-iclient/src/common/message/Message.js';

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
export default class MapGetter extends Vue {
  map: any;
  webmap: any;
  viewModel: any;
  $t: any;
  _mapWatcher: InstanceType<typeof MapWatcher>;

  @Prop() mapTarget: string;

  @Watch('mapTarget')
  mapTargetChanged(newVal: string, oldVal: string) {
    this._mapWatcher.onMapTargetChanged(newVal, oldVal);
  }

  created() {
    this._onHookLoaded = this._onHookLoaded.bind(this);
    this._onHookRemoved = this._onHookRemoved.bind(this);
    this._mapWatcher = new MapWatcher(
      mapEvent,
      this.mapTarget,
      // @ts-ignore
      this.$parent && { name: this.$parent.$options.name, target: this.$parent.target }
    );
    this._mapWatcher.on({
      'hook:loaded': this._onHookLoaded,
      'hook:removed': this._onHookRemoved
    });
  }

  mounted() {
    this._mapWatcher.mounted({ viewModel: this.viewModel });
  }

  beforeDestroy() {
    if (this._mapWatcher) {
      this._mapWatcher.unmounted();
      this._mapWatcher.un({
        'hook:loaded': this._onHookLoaded
      });
      this._mapWatcher = null;
    }
  }

  getTargetName() {
    /**
     * 便于区分存在多个map时，子组件对应的map的渲染；
     * map 和 webmap  的 props 属性是 target 其他组件都叫 mapTarget
     * 如果子组件包裹在 map 组件里面，若没有传 mapTarget, 则 targetName 直接取父元素的target 的值
     * 如果子组件和 map 同层级，且没有设置 mapTarget 时，则默认渲染到第一个 map 上
     *
     */
    return this._mapWatcher.targetName;
  }

  _onHookLoaded({ map, webmap, mapTarget }) {
    this.map = map;
    this.webmap = webmap;
    callHook(this, 'loaded', this.map, mapTarget);
    // 控制与map组件同级的组件的显示加载
    this.$nextTick(() => {
      /**
       * @event loaded
       * @desc 组件加载渲染完成之后触发。
       */
      this.$emit('loaded');
    });
  }

  _onHookRemoved({ map, mapTarget }) {
    callHook(this, 'removed', map, mapTarget);
  }

  mapNotLoadedTip() {
    if (!this.map) {
      // @ts-ignore
      Message.destroy();
      // @ts-ignore
      Message.warning(this.$t('warning.unassociatedMap'));
      return true;
    }
    return false;
  }
}
