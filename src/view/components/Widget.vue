<script>
// 新创建一个vue实例实时监听获得map对象
import mapEvent from "../commontypes/mapEvent";
import Control from "../mixin/Control";

function callHook(vm, hook, map) {
  const { options } = vm.constructor;
  options.extends &&
    options.extends[hook].call(vm, vm.$options.name, map); // 调用基类组件的生命周期
  options[hook] && options[hook].call(vm, map); // 调用子组件的生命周期
}

export default {
  name: "Widget",
  mixins: [Control],
  viewModelProps: null,//微件需要监听的props
  props: {
    mapTarget: {
      type: String
    }
  },
  created() {
    callHook(this, "load");
  },
  computed: {
    getMapTarget() {
      return this.mapTarget || this.$parent.target ||mapEvent.firstMapTarget;
    }
  },
  mounted() {
    this.filterDelayLoad = !["smwebmap", "smmap", "smminimap"].includes(
      this.$options.name && this.$options.name.toLowerCase()
    );
    this.$el && this.filterDelayLoad && (this.$el.style.display = "none");
    /**
     * 便于区分存在多个map时，子组件对应的map的渲染；
     * map 和 webmap的props属性是target 其他组件都叫mapTarget
     * 如果子组件包裹在 map 组件里面，若没有传 mapTarget, 则targetName直接取父元素的target的值
     * 如果子组件和 map 同层级，且没有设置 mapTarget 时，则默认渲染到第一个map上
     *
     */
    const targetName = this.getMapTarget || mapEvent.firstMapTarget;
    mapEvent.$on(`initMap-${targetName}`, (map,webmap) => {
      // 每个继承的组件各自对map操作的统一函数名
      this.parentIsWebMapOrMap = ["smwebmap", "smmap"].includes(
        this.$parent.$options.name && this.$parent.$options.name.toLowerCase()
      );
      this.map = map;
      this.webmap = webmap;
      this.parentIsWebMapOrMap && this.addControl(map);
      callHook(this, "loaded");
      // 控制与map组件同级的组件的显示加载
      this.$el && this.filterDelayLoad && (this.$el.style.display = "block");
      this.$emit("loaded");

    });
    // 为vm层的props绑定监听，更新vm层的视图变化
    if(this.$options.viewModelProps){
      this.watchViewModelOptions(this.$options.viewModelProps);
    }
  },
  updated() {
    callHook(this, "update");
  },
  destroyed() {
    callHook(this, "unload");
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
  },
  methods: {
    // 微件设置vm实例
    setViewModel(viewModel){
      this.viewModel = viewModel;
    },
    // 给vm的props绑定监听
    watchViewModelOptions(viewModelProps) {
      // 给每个vm层的props绑定监听，然后操作vm层的视图变化,必须在vue实例化的时候调用
      // viewModelProps(微件props的名字) ['chartType', 'datasets'],调用的方法名字setXxx,eg:setChartType
      viewModelProps.map(item => {
        this.$watch(
          item,
          function(newVal, oldVal) {
            let setFun = "set" + item.replace(item[0], item[0].toUpperCase());
            // 子组件的viewModel
            this.viewModel&& this.viewModel[setFun](newVal);

          },
          { deep: true }
        );
      });
    },
    // 图表的重绘和地图等的重绘方法，需要在vm中写resize
    resize(){
      if(this.viewModel && this.viewModel.resize){
        this.viewModel.resize();
      }
    },
  }
};
</script>

