<script>
// 新创建一个vue实例实时监听获得map对象
import mapEvent from "../commontypes/mapEvent";
import { WidgetStyle } from "../commontypes/WidgetStyle";
import Control from "../mixin/Control";

function callHook (vm, hook) {
  const { extendOptions } = vm.constructor;
  extendOptions.extends && extendOptions.extends[hook].call(vm, vm.$options.name); // 调用基类组件的生命周期
  extendOptions[hook] && extendOptions[hook].call(vm); // 调用子组件的生命周期
}

export default {
  name: "Widget",
  mixins: [Control],
  props: {
    widgetStyle: {
      type: Object,
      validator(value) {
        return value instanceof WidgetStyle;
      }
    }
  },
  created() {
    callHook(this, 'load');
  },
  mounted() {
    this.filterDelayLoad = !["smwebmap", "smmap", "smminimap"].includes(
      this.$options.name && this.$options.name.toLowerCase()
    );
    this.$el && this.filterDelayLoad && (this.$el.style.display = "none");
    mapEvent.$on("initMap", map => {
      this.map = map;
      // 每个继承的组件各自对map操作的统一函数名
      this.parentIsWebMapOrMap = ["smwebmap", "smmap"].includes(
        this.$parent.$options.name && this.$parent.$options.name.toLowerCase()
      );
      this.parentIsWebMapOrMap && this.addControl(this.map);

      callHook(this, 'loaded');
      // 控制与map组件同级的组件的显示加载
      this.$el && this.filterDelayLoad && (this.$el.style.display = "block");
    });
  },
  updated() {
    callHook(this, 'update');
  },
  destroyed() {
    callHook(this, 'unload');
  },
  load() {
    //微件生命周期方法(挂载前调用)，子类实现
  },
  loaded() {
    //微件生命周期方法(挂载后调用)，子类实现【组件主要业务逻辑写在这个生命周期里】
  },
  update() {
    //微件生命周期方法(更新时调用)，子类实现
  },
  unload() {
    //微件生命周期方法(挂载后调用)，子类实现【组件主要业务逻辑写在这个生命周期里】
  }
};
</script>

