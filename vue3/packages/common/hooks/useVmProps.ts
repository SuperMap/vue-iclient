import type { WatchHandle } from 'vue'
import { watch } from 'vue'
import { isEqual } from 'lodash-es'

export function useVmProps(props: Record<string, any>, viewModelProps: string[]) {
  let viewModel: InstanceType<any>
  let watcherStops: WatchHandle[] = []

  const watchViewModelOptions = (viewModelProps: string[]) => {
    watcherStops = viewModelProps.map(item => {
      let subProps
      if (item.includes('.')) {
        const itemArr = item.split('.')
        item = itemArr[itemArr.length - 1]
        // 处理item为'mapOptions.xxx'类的情况，目前只有一个.的情况
        subProps = itemArr[0]
      }
      return watch(
        () => subProps ? props[subProps]?.[item] : props[item],
        (newVal: any, oldVal: any) => {
          if (!isEqual(newVal, oldVal)) {
            const setFun = 'set' + item.replace(item[0], item[0].toUpperCase())
            // 调用 viewModel 中的设置方法
            viewModel[setFun]?.(newVal)
          }
        },
        { deep: true } // 深度监听
      )
    })
  }

  function setViewModel(vm: InstanceType<any>) {
    viewModel = vm
    if (vm) {
      watcherStops.forEach(stop => stop())
      watchViewModelOptions(viewModelProps)
    }
  }

  return { setViewModel, watcherStops }
}
