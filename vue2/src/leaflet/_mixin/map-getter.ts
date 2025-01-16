// 新创建一个vue实例实时监听获得map对象
import mapEvent from 'vue-iclient/src/leaflet/_types/map-event';
import globalEvent from 'vue-iclient/src/common/_utils/global-event';
import Message from 'vue-iclient/src/common/message/index.js';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

function callHook(vm, hook) {
  const { options } = vm.constructor;
  options.mixins &&
    options.mixins.forEach(mixin => {
      mixin[hook] && mixin[hook].call(vm, vm.$options.name);
    });
  options[hook] && options[hook].call(vm, vm); // 调用子组件的生命周期
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
  map: L.Map;
  webmap: any;
  viewModel: any;
  $t: any;

  @Prop() mapTarget: string;

  @Watch('mapTarget')
  mapTargetChanged(newVal, oldVal) {
    if (newVal && oldVal && newVal !== oldVal) {
      // 多个map切换的时候，需要删除该组件与前一个map的图层绑定
      callHook(this, 'removed');
      if (mapEvent.$options.getMap(newVal)) {
        this.loadMap(newVal);
      }
    }
  }

  mounted() {
    const targetName = this.getTargetName();
    if (mapEvent.$options.getMap(targetName)) {
      this.loadMap(targetName);
    }
    mapEvent.$on('load-map', this.loadMapSucceed);
    globalEvent.$on('delete-map', this.deleteMapSucceed);
  }

  beforeDestroy() {
    mapEvent.$off('load-map', this.loadMapSucceed);
    globalEvent.$off('delete-map', this.deleteMapSucceed);
  }

  // loaded() {
  //   // 组件生命周期方法(挂载后调用)，子类实现【组件主要业务逻辑写在这个生命周期里】
  // },
  loadMapSucceed(map, target) {
    const targetName = this.getTargetName();
    if (target === targetName) {
      this.loadMap(target);
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
    const selfParent = this.$parent;
    const parentTarget =
      selfParent &&
      selfParent.$options.name &&
      selfParent.$options.name.toLowerCase() === 'smwebmap' &&
      // @ts-ignore
      selfParent.target;
    // @ts-ignore
    return this.mapTarget || parentTarget || Object.keys(mapEvent.$options.getAllMaps())[0];
  }

  loadMap(targetName) {
    this.map = mapEvent.$options.getMap(targetName);
    // @ts-ignore
    this.webmap = mapEvent.$options.getWebMap(targetName);
    callHook(this, 'loaded');
    // 控制与map组件同级的组件的显示加载
    this.$nextTick(() => {
      /**
       * @event loaded
       * @desc 组件加载渲染完成之后触发。
       */
      this.$emit('loaded');
    });
  }

  deleteMapSucceed(target) {
    const targetName = this.getTargetName();
    if (target === targetName) {
      callHook(this, 'removed');
      this.map = null;
      this.webmap = null;
      this.viewModel && (this.viewModel = null);
    }
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
