import type { PropType } from 'vue'
import type { ControlPosition } from 'vue-iclient-core/controllers/mapboxgl/utils/MapControl'
import type { MapGetterProps } from '@supermapgis/common/utils/index.common'
import { getPropsDefaults, mapGetterProps } from '@supermapgis/common/utils/index.common'

export const controlProps = () => ({
  position: {
    type: String as PropType<ControlPosition>,
    default: 'top-left'
  }
})

// export type ControlProps = Partial<ExtractPropTypes<ReturnType<typeof controlProps>>>
export interface ControlProps extends MapGetterProps {
  position?: ControlPosition
}

export const controlPropsDefault = getPropsDefaults<ControlProps>(Object.assign(mapGetterProps(), controlProps()))

export default controlProps
