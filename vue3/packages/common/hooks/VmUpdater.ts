// useVmUpdater.js
import { watch, onMounted } from 'vue';
import isequal from 'lodash.isequal';

// 这是一个复用的组合式函数
export function useVmUpdater(viewModelProps, viewModel) {
  const watchViewModelOptions = (viewModelProps) => {
    Object.keys(viewModelProps.value).forEach((item) => {
      watch(
        () => viewModelProps.value[item],
        (newVal, oldVal) => {
          if (!isequal(newVal, oldVal)) {
            if (item.includes('.')) {
              const itemArr = item.split('.');
              item = itemArr[itemArr.length - 1];
            }
            const setFun = 'set' + item.replace(item[0], item[0].toUpperCase());
            // 调用 viewModel 中的设置方法
            if (viewModel.value && typeof viewModel.value[setFun] === 'function') {
              viewModel.value[setFun](newVal);
            }
          }
        },
        { deep: true } // 深度监听
      );
    });
  };

  // 挂载时，检查并绑定监听
  onMounted(() => {
    if (viewModelProps) {
      watchViewModelOptions(viewModelProps);
    }
  });
}
