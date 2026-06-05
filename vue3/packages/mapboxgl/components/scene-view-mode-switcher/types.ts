import type {
  SceneGetterProps,
  ShortEmits,
  ThemeProps
} from '@supermapgis/common/utils/index.common'
import type { ControlProps } from '@supermapgis/mapboxgl/utils'
import { getPropsDefaults, sceneGetterProps, themeProps } from '@supermapgis/common/utils/index.common'
import { controlProps } from '@supermapgis/mapboxgl/utils'

export const sceneViewModeSwitcherProps = () => ({
  defaultViewMode: {
    type: String,
    default: '3D'
  },
  forceScene3D: {
    type: Boolean,
    default: false
  }
})

export interface SceneViewModeSwitcherProps extends ControlProps, ThemeProps, SceneGetterProps {
  defaultViewMode?: '2D' | '3D'
  forceScene3D?: boolean
}

export const sceneViewModeSwitcherPropsDefault = getPropsDefaults<SceneViewModeSwitcherProps>(
  Object.assign(controlProps(), themeProps(), sceneGetterProps(), sceneViewModeSwitcherProps())
)

export type SceneViewModeSwitcherEvents = {}

export type SceneViewModeSwitcherEmits = ShortEmits<SceneViewModeSwitcherEvents>

export default sceneViewModeSwitcherProps
