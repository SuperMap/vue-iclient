import type { PropType } from 'vue'
import type {
  ShortEmits,
  SceneGetterProps,
  ThemeProps
} from '@supermapgis/common/utils/index.common'
import type { PopupConfig, PopupInfo } from '@supermapgis/mapboxgl/components/base-attribute-popup/types'
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
export type { PopupInfo, PopupConfig } from '@supermapgis/mapboxgl/components/base-attribute-popup/types'
export type { HighlightStyle } from 'vue-iclient-controllers-mapboxgl/src/LayerHighlightViewModel'
export { getDefaultLayerStyle } from 'vue-iclient-controllers-mapboxgl/src/types'

/** ???????????? PopupInfo ????dataSource */
export interface ScenePopupInfo extends PopupInfo {
  /** ?????? rest/data ????????dataSource ????id ????????MVT ???? */
  dataSource?: SceneQueryDataSource
}

/**
 * ???????????Props?????? attribute-popup??
 */
export interface SceneAttributePopupProps extends ThemeProps, SceneGetterProps {
  /**
   * ?????????
   * layerId ????? rest/map ?? customName ??MVT name ????
   * ???????????? dataSource ???? rest/data ????
   */
  popupInfos?: ScenePopupInfo[]
  /** ?????? */
  popupConfig?: PopupConfig
  /** ????????????*/
  multiSelect?: boolean
  /** ????????? */
  clickTolerance?: number
  /**
   * ???????? attribute-popup ??layerStyle ????
   * ?????????? circle / line / fill / strokeLine??
   */
  layerStyle?: HighlightStyle
  /** ?????????*/
  enabled?: boolean
  /** ???????????????????*/
  showPopupTip?: boolean
}

/**
 * ViewModel 内部分组 id：仅当多条 popup 配置共用同一个 layerId 时才拼接 @@。
 */
export function toUniqueLayerId(info: ScenePopupInfo, allInfos?: ScenePopupInfo[]): string {
  const layerId = Array.isArray(info.layerId) ? info.layerId[0] : info.layerId
  const base = String(layerId || info.title || '').trim()
  const ds = info.dataSource
  if (!base || !ds?.dataSourceName || !ds?.datasetName) {
    return base
  }
  const infos = allInfos?.length ? allInfos : [info]
  const duplicateBase =
    infos.filter(item => {
      const itemBase = String(
        (Array.isArray(item.layerId) ? item.layerId[0] : item.layerId) || item.title || ''
      ).trim()
      return itemBase === base
    }).length > 1
  if (!duplicateBase) {
    return base
  }
  return `${base}@@${ds.dataSourceName}.${ds.datasetName}`
}

/** popup 展示 layerId ↔ ViewModel 内部分组 id */
export function buildScenePopupLayerIdMaps(popupInfos?: ScenePopupInfo[]) {
  const queryLayers = popupInfosToQueryLayers(popupInfos)
  const displayToInternal = new Map<string, string>()
  const internalToDisplay = new Map<string, string>()
  queryLayers.forEach(layer => {
    const displayId = String(layer.matchId || layer.id).trim()
    const internalId = String(layer.id).trim()
    displayToInternal.set(displayId, internalId)
    displayToInternal.set(internalId, internalId)
    internalToDisplay.set(internalId, displayId)
  })
  return { displayToInternal, internalToDisplay, queryLayers }
}

export function toInternalLayerId(layerId: string, popupInfos?: ScenePopupInfo[]) {
  const { displayToInternal } = buildScenePopupLayerIdMaps(popupInfos)
  return displayToInternal.get(layerId) || layerId
}

export function popupInfosToQueryLayers(popupInfos?: ScenePopupInfo[]): SceneQueryLayer[] {
  const list = popupInfos || []
  return list
    .map(info => {
      const layerId = Array.isArray(info.layerId) ? info.layerId[0] : info.layerId
      const id = toUniqueLayerId(info, list)
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
