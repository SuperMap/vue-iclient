import type { PropType } from 'vue'
import type { ControlPosition } from 'vue-iclient-core/controllers/mapboxgl/utils/MapControl'
import { getPropsDefaults } from '@supermapgis/common/utils/vue-types'

export const controlProps = () => ({
  mapTarget: String,
  position: {
    type: String as PropType<ControlPosition>,
    default: 'top-left'
  }
})

// export type ControlProps = Partial<ExtractPropTypes<ReturnType<typeof controlProps>>>
export type ControlProps = {
  mapTarget?: string
  position?: ControlPosition
}

export const controlPropsDefault = getPropsDefaults<ControlProps>(controlProps())

export default controlProps
