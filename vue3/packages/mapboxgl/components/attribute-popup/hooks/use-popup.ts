import type { ComputedRef } from 'vue'
import { watch, ref, computed } from 'vue'
import MapPopupViewModel from 'vue-iclient-controllers-mapboxgl/src/MapPopupViewModel'
import { setPopupArrowStyle } from 'vue-iclient-core/utils/util'
import { useMapGetter } from '@supermapgis/common/hooks/index.common'

interface Props {
  coordinates: number[]
  rootEl: HTMLDivElement
}
export function usePopup(props: Props, popupBgStyle: ComputedRef<Object>) {
  const viewModel = new MapPopupViewModel()
  useMapGetter({ viewModel })
  const isRender = ref(false)
  const currentCoordinate = computed(() => props.coordinates)

  const removePopup = () => {
    viewModel.removePopup()
  }

  const addPopup = () => {
    if (!currentCoordinate.value) return
    isRender.value = true
    viewModel.addPopup(currentCoordinate.value, props.rootEl)
    setPopupArrowStyle(popupBgStyle.value.backgroundColor)
  }
  
  watch(currentCoordinate, () => {
    addPopup()
  })

  return {
    isRender,
    addPopup,
    removePopup
  }
}
