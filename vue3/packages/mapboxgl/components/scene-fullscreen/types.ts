import type { ShortEmits, SceneGetterProps, ThemeProps } from '@supermapgis/common/utils/index.common'
import type { ControlProps } from '@supermapgis/mapboxgl/utils'
import { getPropsDefaults, sceneGetterProps, themeProps } from '@supermapgis/common/utils/index.common'
import { controlProps } from '@supermapgis/mapboxgl/utils'

export const sceneFullscreenProps = () => ({
  iconClass: {
    type: String,
    default: 'sm-components-icon-fullscreen'
  },
  title: {
    type: String,
    default: '全屏'
  }
})

export interface SceneFullscreenProps extends ControlProps, ThemeProps, SceneGetterProps {
  iconClass?: string;
  title?: string;
}

export const sceneFullscreenPropsDefault = getPropsDefaults<SceneFullscreenProps>(
  Object.assign(controlProps(), themeProps(), sceneGetterProps(), sceneFullscreenProps())
)

export type SceneFullscreenEvents = {}

export type SceneFullscreenEmits = ShortEmits<SceneFullscreenEvents>

export default sceneFullscreenProps
