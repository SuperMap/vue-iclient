import type { PropType } from 'vue'
import type { ControlPosition } from 'vue-iclient-core/controllers/mapboxgl/utils/MapControl'
import { getPropsDefaults } from '@supermapgis/common/utils/vue-types'

export const cardProps = () => ({
  position: {
    type: String as PropType<ControlPosition>,
    default: 'top-left'
  },
  headerName: {
    type: String
  },
  iconClass: {
    type: String
  },
  autoRotate: {
    type: Boolean,
    default: false
  },
  collapsed: {
    type: Boolean,
    default: true
  },
  // 标题与内容的分割线
  splitLine: {
    type: Boolean,
    default: true
  }
})

// export type CardProps = Partial<ExtractPropTypes<ReturnType<typeof cardProps>>>
export type CardProps = {
  position?: ControlPosition
  autoRotate?: boolean
  collapsed?: boolean
  splitLine?: boolean
  headerName?: string
  iconClass?: string
}

export const cardPropsDefault = getPropsDefaults<CardProps>(cardProps())

export default cardProps