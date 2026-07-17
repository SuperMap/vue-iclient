import type { PropType } from 'vue'
import type { SceneGetterProps, ThemeProps } from '@supermapgis/common/utils/index.common'
import type { CardProps, ControlProps } from '@supermapgis/mapboxgl/utils'
import {
  getPropsDefaults,
  sceneGetterProps,
  themeProps
} from '@supermapgis/common/utils/index.common'
import { cardProps, controlProps } from '@supermapgis/mapboxgl/utils'

export const SCENE_LAYER_TYPES = ['terrain', 'map', 's3m', 'data', '3dtiles'] as const

export type SceneLayerType = (typeof SCENE_LAYER_TYPES)[number]

export interface SceneLayerGroupNode {
  id?: string
  name: string
  children: SceneLayerConfigNode[]
  checkEnabled?: false
}

export interface SceneLayerLocateParams {
  position: number[] | Record<string, number>
  hpr?: Record<string, number>
  duration?: number
}

export interface SceneLayerLeafNode {
  id: string
  name: string
  type: SceneLayerType
  config: Record<string, unknown> | string
  defaultLoad?: boolean
  autoLocate?: boolean
  locateParams?: string | SceneLayerLocateParams
  subdomains?: string | string[]
  checkEnabled?: boolean
  key?: string
  [key: string]: unknown
}

export type SceneLayerConfigNode = SceneLayerGroupNode | SceneLayerLeafNode

export interface SceneLayerManagerProps
  extends CardProps, ControlProps, ThemeProps, SceneGetterProps {
  layerConfig?: SceneLayerConfigNode[]
}

/** Runtime-only state. The component must never write these fields into layerConfig. */
export interface RuntimeSceneLayerLeafNode extends Omit<SceneLayerLeafNode, 'config'> {
  config: Record<string, unknown>
  checked: boolean
  loading: boolean
  disabled: boolean
  showConfig: boolean
  disabledReason?: string
}

export interface RuntimeSceneLayerGroupNode extends Omit<SceneLayerGroupNode, 'children'> {
  children: RuntimeSceneLayerNode[]
  checked?: false
  loading?: false
  showConfig?: false
}

export type RuntimeSceneLayerNode = RuntimeSceneLayerGroupNode | RuntimeSceneLayerLeafNode

export const sceneLayerManagerProps = () => ({
  layerConfig: {
    type: Array as PropType<SceneLayerConfigNode[]>,
    default: () => []
  }
})

export const sceneLayerManagerPropsDefault = getPropsDefaults<SceneLayerManagerProps>(
  Object.assign(
    cardProps(),
    controlProps(),
    themeProps(),
    sceneGetterProps(),
    sceneLayerManagerProps()
  )
)

export default sceneLayerManagerProps
