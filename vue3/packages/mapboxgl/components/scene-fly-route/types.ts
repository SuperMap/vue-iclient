import type { PropType } from 'vue'
import type { ShortEmits, SceneGetterProps, ThemeProps } from '@supermapgis/common/utils/index.common'
import type { CardProps, ControlProps } from '@supermapgis/mapboxgl/utils'
import type {
  SceneFlyRouteOptions,
  SceneFlyRouteStatus,
  SceneFlyRouteStop
} from '@supermapgis/iclient-components-core/mapboxgl/src/SceneFlyRouteViewModel'
import {
  getPropsDefaults,
  sceneGetterProps,
  themeProps
} from '@supermapgis/common/utils/index.common'
import { cardProps, controlProps } from '@supermapgis/mapboxgl/utils'

export interface SceneFlyRouteProps
  extends CardProps,
    ControlProps,
    ThemeProps,
    SceneGetterProps {
  /** fpf 飞行文件地址（由 SuperMap iDesktop 生成） */
  fpfUrl?: string
  /** 是否显示飞行路线，默认 true */
  isLineVisible?: boolean
  /** 是否显示飞行站点，默认 true */
  isStopVisible?: boolean
  /** 兼容整体配置的写法 */
  options?: Partial<Omit<SceneFlyRouteOptions, 'playRate'>>
}

export const sceneFlyRouteProps = () => ({
  fpfUrl: {
    type: String,
    default: ''
  },
  isLineVisible: {
    type: Boolean,
    default: true
  },
  isStopVisible: {
    type: Boolean,
    default: true
  },
  options: {
    type: Object as PropType<Partial<Omit<SceneFlyRouteOptions, 'playRate'>>>,
    default: () => ({})
  }
})

export const sceneFlyRoutePropsDefault = getPropsDefaults<SceneFlyRouteProps>(
  Object.assign(
    cardProps(),
    themeProps(),
    controlProps(),
    sceneGetterProps(),
    sceneFlyRouteProps()
  )
)

export interface SceneFlyRouteEvents {
  ready: (payload: { stops: SceneFlyRouteStop[] }) => void
  statusChange: (payload: { status: SceneFlyRouteStatus }) => void
  stopArrived: (payload: { index: number; stop: SceneFlyRouteStop }) => void
  error: (payload: { error: unknown }) => void
}

export type SceneFlyRouteEmits = ShortEmits<SceneFlyRouteEvents>

export default sceneFlyRouteProps
