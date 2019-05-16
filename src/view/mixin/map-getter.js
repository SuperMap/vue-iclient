// 新创建一个vue实例实时监听获得map对象
import mapEvent from '../commontypes/mapEvent';

function callHook(vm, hook, map) {
  const { options } = vm.constructor;
  options.mixins &&
    options.mixins.forEach(mixin => {
      mixin[hook] && mixin[hook].call(vm, vm.$options.name, map);
    });
  options[hook] && options[hook].call(vm, map); // 调用子组件的生命周期
}
/**
 * Description
 * @mixin mapGetter
 * @desc 监听 WebMap 和 Map load 事件。
 * @category Mixin
 * @vue-computed {String} getMapTarget - 获取当前 Map 的 target。
 * @vue-event loaded - 组件加载渲染完成之后触发。
 */
export default {
  props: {
    mapTarget: {
      type: String
    }
  },
  computed: {
    getMapTarget() {
      return this.mapTarget || this.$parent.target || mapEvent.firstMapTarget;
    }
  },
  mounted() {
    /**
     * 便于区分存在多个map时，子组件对应的map的渲染；
     * map 和 webmap  的 props 属性是 target 其他组件都叫 mapTarget
     * 如果子组件包裹在 map 组件里面，若没有传 mapTarget, 则 targetName 直接取父元素的target 的值
     * 如果子组件和 map 同层级，且没有设置 mapTarget 时，则默认渲染到第一个 map 上
     *
     */
    const targetName = this.getMapTarget || mapEvent.firstMapTarget;
    if (mapEvent.$options.getMap(targetName)) {
      this.loadMap(targetName);
    } else {
      mapEvent.$on(`initMap-${targetName}`, (map, webmap) => {
        mapEvent.$options.setMap(targetName, map);
        webmap && mapEvent.$options.setWebMap(targetName, webmap);
        // 每个继承的组件各自对map操作的统一函数名
        this.loadMap(targetName);
      });
    }
  },
  loaded() {
    // 微件生命周期方法(挂载后调用)，子类实现【组件主要业务逻辑写在这个生命周期里】
  },
  methods: {
    loadMap(targetName) {
      this.map = mapEvent.$options.getMap(targetName);
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
  }
};
