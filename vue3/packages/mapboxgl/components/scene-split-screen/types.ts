import type { ShortEmits, SceneGetterProps, ThemeProps } from '@supermapgis/common/utils/index.common'
import type { CardProps, ControlProps } from '@supermapgis/mapboxgl/utils'
import {
  getPropsDefaults,
  sceneGetterProps,
  themeProps
} from '@supermapgis/common/utils/index.common'
import { cardProps, controlProps } from '@supermapgis/mapboxgl/utils'

/**
 * 数据分屏组件属性
 */
export interface SceneSplitScreenProps extends CardProps, ControlProps, ThemeProps, SceneGetterProps {}

export const sceneSplitScreenProps = () => ({})

export const sceneSplitScreenPropsDefault = getPropsDefaults<SceneSplitScreenProps>(
  Object.assign(cardProps(), themeProps(), controlProps(), sceneGetterProps(), sceneSplitScreenProps())
)

export type SceneSplitScreenEvents = {}

export type SceneSplitScreenEmits = ShortEmits<SceneSplitScreenEvents>

export default sceneSplitScreenProps
