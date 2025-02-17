import { watch, onMounted } from 'vue'
import { isEqual } from 'lodash-es'

export function useVmUpdater(viewModelProps, viewModel) {
  const watchViewModelOptions = viewModelProps => {
    Object.keys(viewModelProps.value).forEach(item => {
      watch(
        () => viewModelProps.value[item],
        (newVal, oldVal) => {
          if (!isEqual(newVal, oldVal)) {
            if (item.includes('.')) {
              const itemArr = item.split('.')
              item = itemArr[itemArr.length - 1]
            }
            const setFun = 'set' + item.replace(item[0], item[0].toUpperCase())
            if (viewModel.value && typeof viewModel.value[setFun] === 'function') {
              viewModel.value[setFun](newVal)
            }
          }
        },
        { deep: true }
      )
    })
  }

  onMounted(() => {
    if (viewModelProps) {
      watchViewModelOptions(viewModelProps)
    }
  })
}
