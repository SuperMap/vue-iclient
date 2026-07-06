import type { PropType } from 'vue'
import type {
  ShortEmits,
  SceneGetterProps,
  ThemeProps
} from '@supermapgis/common/utils/index.common'
import type { CardProps, ControlProps } from '@supermapgis/mapboxgl/utils'
import type { BaseMapLayer, Terrain, Annotation } from 'vue-iclient-core/utils/scene/map-switch'
import {
  getPropsDefaults,
  sceneGetterProps,
  themeProps
} from '@supermapgis/common/utils/index.common'
import { cardProps, controlProps } from '@supermapgis/mapboxgl/utils'

export interface BaseMapLayerConfig {
  label?: string
  image?: string
  layer: BaseMapLayer
}
/**
 * 底图切换组件属性
 */
export interface SceneMapSwitchProps extends CardProps, ControlProps, ThemeProps, SceneGetterProps {
  /** 底图列表 */
  baseMapLayers?: BaseMapLayerConfig[]
  /** 地形服务配置 */
  terrain?: Terrain | null
  /** 三维地名标注配置 */
  annotation?: Annotation | null
  /** 天地图全局密钥 */
  token?: string
  /** 默认底图索引 */
  defaultIndex?: number
}

export const sceneMapSwitchProps = () => ({
  baseMapLayers: {
    type: Array as PropType<BaseMapLayerConfig[]>,
    default() {
      return []
    }
  },
  defaultIndex: {
    type: Number
  },
  terrain: {
    type: Object as PropType<Terrain | null>,
    default: null
  },
  annotation: {
    type: Object as PropType<Annotation | null>,
    default: null
  },
  token: {
    type: String
  }
})

export const sceneMapSwitchPropsDefault = getPropsDefaults<SceneMapSwitchProps>(
  Object.assign(
    cardProps(),
    themeProps(),
    controlProps(),
    sceneGetterProps(),
    sceneMapSwitchProps()
  )
)

export type SceneMapSwitchEvents = {}

export type SceneMapSwitchEmits = ShortEmits<SceneMapSwitchEvents>

export default sceneMapSwitchProps
