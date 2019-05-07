
export default {
  viewModelProps: null, //微件需要监听的props
  mounted() {
    // 为vm层的props绑定监听，更新vm层的视图变化
    if (this.$options.viewModelProps) {
      this.watchViewModelOptions(this.$options.viewModelProps);
    }
  },
  methods: {
    // 微件设置vm实例
    setViewModel(viewModel) {
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
            this.viewModel && this.viewModel[setFun](newVal);
          },
          { deep: true }
        );
      });
    },
    // 图表的重绘和地图等的重绘方法，需要在vm中写resize
    resize() {
      if (this.viewModel && this.viewModel.resize) {
        this.viewModel.resize();
        return;
      }
    }
  }
};

