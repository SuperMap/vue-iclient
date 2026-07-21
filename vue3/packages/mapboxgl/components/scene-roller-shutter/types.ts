import type { ShortEmits, SceneGetterProps, ThemeProps } from '@supermapgis/common/utils/index.common'
import { getPropsDefaults, sceneGetterProps, themeProps } from '@supermapgis/common/utils/index.common'
import type { CardProps, ControlProps } from '@supermapgis/mapboxgl/utils'
import { cardProps, controlProps } from '@supermapgis/mapboxgl/utils'

/**
 * 场景卷帘组件属性
 */
export interface SceneRollerShutterProps
  extends CardProps,
    ControlProps,
    ThemeProps,
    SceneGetterProps {}

export const sceneRollerShutterProps = () => ({})

export const sceneRollerShutterPropsDefault = getPropsDefaults<SceneRollerShutterProps>(
  Object.assign(
    cardProps(),
    themeProps(),
    controlProps(),
    sceneGetterProps(),
    sceneRollerShutterProps()
  )
)

export type SceneRollerShutterEvents = Record<never, never>

export type SceneRollerShutterEmits = ShortEmits<SceneRollerShutterEvents>

export default sceneRollerShutterProps
