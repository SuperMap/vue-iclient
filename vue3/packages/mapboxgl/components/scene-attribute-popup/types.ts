import type { PropType } from 'vue'
import type {
  ShortEmits,
  SceneGetterProps,
  ThemeProps
} from '@supermapgis/common/utils/index.common'
import type { PopupConfig, PopupInfo } from '@supermapgis/mapboxgl/components/popup-content/types'
import type {
  SceneHighlightResult,
  SceneQueryDataSource,
  SceneQueryLayer
} from 'vue-iclient-controllers-mapboxgl/src/SceneHighlightViewModel'
import type { HighlightStyle } from 'vue-iclient-controllers-mapboxgl/src/LayerHighlightViewModel'
import {
  getPropsDefaults,
  sceneGetterProps,
  themeProps
} from '@supermapgis/common/utils/index.common'
import { getDefaultLayerStyle } from 'vue-iclient-controllers-mapboxgl/src/types'

export type {
  SceneQueryLayer,
  SceneQueryLayerType,
  SceneQueryDataSource,
  SceneQueryFeature,
  SceneHighlightResult,
  SceneOverlayLayerInfo
} from 'vue-iclient-controllers-mapboxgl/src/SceneHighlightViewModel'
export type { PopupInfo, PopupConfig } from '@supermapgis/mapboxgl/components/popup-content/types'
export type { HighlightStyle } from 'vue-iclient-controllers-mapboxgl/src/LayerHighlightViewModel'
export { getDefaultLayerStyle } from 'vue-iclient-controllers-mapboxgl/src/types'

/** 场景属性弹窗配置：在通用 PopupInfo 上增加 dataSource */
export interface ScenePopupInfo extends PopupInfo {
  /** 该图层对应的 rest/data 查询数据源；有 dataSource 且图层 id 能匹配场景影像/MVT 时才查询 */
  dataSource?: SceneQueryDataSource
}

/**
 * 场景点选查询属性弹窗 Props（展示侧对齐 attribute-popup）
 */
export interface SceneAttributePopupProps extends ThemeProps, SceneGetterProps {
  /**
   * 弹窗与查询配置。
   * layerId 需与场景中 rest/map 影像 customName 或 MVT name 对应；
   * 仅当命中图层且该项配置了 dataSource 时才会发 rest/data 查询。
   */
  popupInfos?: ScenePopupInfo[]
  /** 弹窗样式配置 */
  popupConfig?: PopupConfig
  /** 是否允许多要素翻页展示 */
  multiSelect?: boolean
  /** 点选缓冲半径（米） */
  clickTolerance?: number
  /**
   * 高亮样式，与地图 attribute-popup 的 layerStyle 一致。
   * 场景内部按几何类型取 circle / line / fill / strokeLine。
   */
  layerStyle?: HighlightStyle
  /** 是否启用点选查询 */
  enabled?: boolean
  /** 是否显示指向点击位置的尖角，默认开启 */
  showPopupTip?: boolean
}

/** 将 popupInfos 转为查询配置（保留无 dataSource 项，由 ViewModel 按场景图层匹配后再决定是否请求） */
export function toUniqueLayerId(info: ScenePopupInfo): string {
  const layerId = Array.isArray(info.layerId) ? info.layerId[0] : info.layerId
  const base = layerId || info.title || ''
  const ds = info.dataSource
  // 同一 rest/map  overlay 可挂多个 dataset，用 dataSource 区分查询结果与弹窗匹配
  if (base && ds?.dataSourceName && ds?.datasetName) {
    return `${base}@@${ds.dataSourceName}.${ds.datasetName}`
  }
  return base
}

export function popupInfosToQueryLayers(popupInfos?: ScenePopupInfo[]): SceneQueryLayer[] {
  return (popupInfos || [])
    .map(info => {
      const layerId = Array.isArray(info.layerId) ? info.layerId[0] : info.layerId
      const id = toUniqueLayerId(info)
      return {
        id,
        matchId: layerId || undefined,
        title: info.title,
        dataSource: info.dataSource
      }
    })
    .filter(layer => !!layer.id)
}

export const sceneAttributePopupProps = () => ({
  popupInfos: {
    type: Array as PropType<ScenePopupInfo[]>,
    default() {
      return []
    }
  },
  popupConfig: {
    type: Object as PropType<PopupConfig>,
    default() {
      return {
        maxWidth: '280px',
        maxHeight: '394px',
        autoResize: true,
        valueWordWrap: 'wrap'
      }
    }
  },
  multiSelect: {
    type: Boolean,
    default: true
  },
  clickTolerance: {
    type: Number,
    default: 10
  },
  layerStyle: {
    type: Object as PropType<HighlightStyle>,
    default() {
      return getDefaultLayerStyle()
    }
  },
  enabled: {
    type: Boolean,
    default: true
  },
  showPopupTip: {
    type: Boolean,
    default: true
  }
})

export const sceneAttributePopupPropsDefault = getPropsDefaults<SceneAttributePopupProps>(
  Object.assign(themeProps(), sceneGetterProps(), sceneAttributePopupProps())
)

export type SceneAttributePopupEvents = {
  selectionchanged: [SceneHighlightResult | { features: []; layerIds: []; lngLat?: [number, number] }]
  querystart: [{ lngLat: [number, number]; height?: number }]
  queryend: [SceneHighlightResult]
  queryfailed: [unknown]
}

export type SceneAttributePopupEmits = ShortEmits<SceneAttributePopupEvents>

export default sceneAttributePopupProps
