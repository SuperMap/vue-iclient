import type { PropType } from 'vue'
import type { ShortEmits, SceneGetterProps, ThemeProps } from '@supermapgis/common/utils/index.common'
import type { ControlProps } from '@supermapgis/mapboxgl/utils'
import { getPropsDefaults, sceneGetterProps, themeProps } from '@supermapgis/common/utils/index.common'
import { controlProps } from '@supermapgis/mapboxgl/utils'

export interface SceneFlyToPosition {
  lat?: number;
  lng?: number;
  lon?: number;
  height?: number;
  x?: number;
  y?: number;
  z?: number;
}

export interface SceneFlyToHpr {
  heading?: number;
  pitch?: number;
  roll?: number;
}

export interface SceneFlyToOptions {
  hpr?: SceneFlyToHpr;
  duration?: number;
  cancel?: () => void;
  complete?: () => void;
  easingFunction?: (...args: any[]) => any;
}

export const sceneFlyToProps = () => ({
  destination: {
    type: [Array, Object] as PropType<number[] | SceneFlyToPosition>,
    required: true
  },
  flyOptions: {
    type: Object as PropType<SceneFlyToOptions>,
    default() {
      return {};
    }
  },
  iconClass: {
    type: String,
    default: 'sm-components-icon-flyto'
  },
  title: {
    type: String
  }
})

export interface SceneFlyToProps extends ControlProps, ThemeProps, SceneGetterProps {
  destination: number[] | SceneFlyToPosition;
  flyOptions?: SceneFlyToOptions;
  iconClass?: string;
  title?: string;
}

export const sceneFlyToPropsDefault = getPropsDefaults<SceneFlyToProps>(
  Object.assign(controlProps(), themeProps(), sceneGetterProps(), sceneFlyToProps())
)

export type SceneFlyToEvents = {}

export type SceneFlyToEmits = ShortEmits<SceneFlyToEvents>

export default sceneFlyToProps
