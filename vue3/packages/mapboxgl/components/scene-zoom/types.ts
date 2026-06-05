import type {
  SceneGetterProps,
  ShortEmits,
  ThemeProps
} from '@supermapgis/common/utils/index.common'
import type { ControlProps } from '@supermapgis/mapboxgl/utils'
import { getPropsDefaults, sceneGetterProps, themeProps } from '@supermapgis/common/utils/index.common'
import { controlProps } from '@supermapgis/mapboxgl/utils'

export const sceneZoomProps = () => ({
  step: {
    type: Number,
    default: undefined
  }
})

export interface SceneZoomProps extends ControlProps, ThemeProps, SceneGetterProps {
  step?: number
}

export const sceneZoomPropsDefault = getPropsDefaults<SceneZoomProps>(
  Object.assign(controlProps(), themeProps(), sceneGetterProps(), sceneZoomProps())
)

export type SceneZoomEvents = {}

export type SceneZoomEmits = ShortEmits<SceneZoomEvents>

export default sceneZoomProps
