import type { ShortEmits } from '@supermapgis/common/utils/index.common'
import { getPropsDefaults } from '@supermapgis/common/utils/vue-types'

export const mapGetterProps = () => ({
  mapTarget: {
    type: String
  }
})

// export type MapGetterProps = Partial<ExtractPropTypes<ReturnType<typeof mapGetterProps>>>
export type MapGetterProps = {
  mapTarget?: string
}

export const mapGetterPropsDefault = getPropsDefaults<MapGetterProps>(mapGetterProps())

export interface MapGetterEvents {
  loaded: []
}

export type MapGetterEmits = ShortEmits<MapGetterEvents>

export default mapGetterProps