import type { PropType } from 'vue'
import type { ShortEmits, SceneGetterProps, ThemeProps } from '@supermapgis/common/utils/index.common'
import type { CardProps, ControlProps } from '@supermapgis/mapboxgl/utils'
import type {
  SceneFlyOptions,
  SceneFlyStatus,
  SceneFlyStop
} from 'vue-iclient-controllers-mapboxgl/src/SceneFlyViewModel'
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
  /** 飞行速度倍率，默认 1 */
  playRate?: number
  /** 是否显示飞行路线，默认 true */
  isLineVisible?: boolean
  /** 是否显示飞行站点，默认 true */
  isStopVisible?: boolean
  /** 兼容整体配置的写法 */
  options?: Partial<SceneFlyOptions>
}

export const sceneFlyRouteProps = () => ({
  fpfUrl: {
    type: String,
    default: ''
  },
  playRate: {
    type: Number,
    default: 1
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
    type: Object as PropType<Partial<SceneFlyOptions>>,
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
  ready: (payload: { stops: SceneFlyStop[] }) => void
  statusChange: (payload: { status: SceneFlyStatus }) => void
  stopArrived: (payload: { index: number; stop: SceneFlyStop }) => void
  error: (payload: { error: unknown }) => void
}

export type SceneFlyRouteEmits = ShortEmits<SceneFlyRouteEvents>

export default sceneFlyRouteProps
