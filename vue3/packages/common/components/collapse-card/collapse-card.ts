import type { PropType } from 'vue'
import type { ThemeProps } from '@supermapgis/common/components/theme/theme'
import type { ControlPosition } from 'vue-iclient-core/controllers/mapboxgl/utils/MapControl'
import { getPropsDefaults } from '@supermapgis/common/utils/vue-types'
import { themeProps } from '@supermapgis/common/components/theme/theme'

export const collapseCardProps = () => ({
  iconPosition: {
    type: String as PropType<ControlPosition>,
    default: 'top-left'
  },
  iconClass: {
    type: String
  },
  autoRotate: {
    type: Boolean,
    default: false
  },
  headerName: {
    type: String
  },
  collapsed: {
    type: Boolean,
    default: false
  },
  splitLine: {
    type: Boolean,
    default: true
  }
})

// export type CollapseCardProps = Partial<ExtractPropTypes<ReturnType<typeof collapseCardProps>>>
export interface CollapseCardProps extends ThemeProps {
  autoRotate?: boolean
  splitLine?: boolean
  iconPosition?: ControlPosition
  headerName?: string
  collapsed?: boolean
  iconClass?: string
}

export const collapaseCardPropsDefault = getPropsDefaults<CollapseCardProps>(
  Object.assign(themeProps(), collapseCardProps())
)

export default collapseCardProps
