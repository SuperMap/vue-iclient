import { watch, ref, computed } from 'vue'
import MapPopupViewModel from 'vue-iclient-core/controllers/mapboxgl/MapPopupViewModel'
import { setPopupArrowStyle } from 'vue-iclient-core/utils/util'
import { useMapGetter } from '@supermapgis/common/hooks/index.common'

interface Props {
  coordinates: number[]
  popupBgStyle: Object
  rootEl: HTMLDivElement
}
export function usePopup(props: Props) {
  const viewModel = new MapPopupViewModel()
  useMapGetter({ viewModel })
  const isRender = ref(false)
  const currentCoordinate = computed(() => props.coordinates)
  const popupBgStyle = computed(() => props.popupBgStyle)

  const removePopup = () => {
    viewModel.removePopup()
  }

  const addPopup = () => {
    if (!currentCoordinate.value) return
    isRender.value = true
    viewModel.addPopup(currentCoordinate.value, props.rootEl)
    setPopupArrowStyle(popupBgStyle.value.background)
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
