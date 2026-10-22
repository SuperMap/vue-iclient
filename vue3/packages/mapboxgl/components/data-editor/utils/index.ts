import { cloneDeep } from 'lodash-es'
import type {
  DataEditorField,
  DataEditorLayer,
  DataEditorLayerDataInfo,
  DataEditorSourceType
} from '../types'

/** 数据编辑不支持的图层类型关键字 */
const UNSUPPORTED_LAYER_TYPES = ['heatmap', 'chart', 'migration', 'line-curve']

/** 结构化数据集的类型标识 */
const STRUCTURED_DATA_TYPE = 'STRUCTUREDDATA'

/** 获取图层名称，优先级与 MapDashboard-V2 保持一致 */
export function getLayerTitle(layer: DataEditorLayer = {} as DataEditorLayer): string {
  const dataInfo = layer.dataInfo || {}
  // 数据标识不能作为显示名称，避免面板上出现 UUID
  const layerName = layer.name && layer.name !== layer.id ? layer.name : ''
  return (
    layer.dataAlias ||
    dataInfo.displayName ||
    layerName ||
    dataInfo.name ||
    layer.title ||
    layer.id ||
    ''
  )
}

/** 是否为 REST 数据图层 */
export function isRestDataLayer(layer: DataEditorLayer = {} as DataEditorLayer): boolean {
  const dataInfo: DataEditorLayerDataInfo = layer.dataInfo || {}
  const type = `${dataInfo.type || ''}`.toUpperCase()
  const dataType = `${dataInfo.dataType || ''}`.toUpperCase()
  const url = `${dataInfo.url || ''}`.toLowerCase()
  const hasDataName = !!dataInfo.dataName
  return (
    dataType === 'RESTDATA' ||
    dataType === 'REST_DATA' ||
    type === 'RESTDATA' ||
    (type === 'REST' && url.includes('/rest/data')) ||
    (type === 'ISERVER' && hasDataName && (dataType === 'RESTDATA' || url.includes('/rest/data')))
  )
}

/** 是否为结构化数据图层 */
export function isStructuredDataLayer(layer: DataEditorLayer = {} as DataEditorLayer): boolean {
  const dataInfo: DataEditorLayerDataInfo = layer.dataInfo || {}
  return `${dataInfo.dataType || ''}`.toUpperCase() === STRUCTURED_DATA_TYPE
}

/** 获取数据编辑器需要的数据来源类型，空字符串表示不支持 */
export function getEditorSourceType(
  dataInfo: DataEditorLayerDataInfo = {}
): DataEditorSourceType | '' {
  const dataType = `${dataInfo.dataType || dataInfo.type || ''}`.toUpperCase()
  if (dataType === STRUCTURED_DATA_TYPE) {
    return 'STRUCTURED_DATA'
  }
  if (dataType === 'RESTDATA' || dataType === 'REST_DATA' || dataInfo.url) {
    return 'REST_DATA'
  }
  return ''
}

/** 拼接 REST 数据集地址 */
export function getDatasetUrl(dataInfo: DataEditorLayerDataInfo = {}): string {
  if (dataInfo.datasetUrl) {
    return dataInfo.datasetUrl
  }
  const url = dataInfo.url || ''
  if (!url) {
    return ''
  }
  if (url.includes('/rest/data/datasources/') && url.includes('/datasets/')) {
    return url
  }
  const dataName = Array.isArray(dataInfo.dataName) ? dataInfo.dataName[0] : dataInfo.dataName
  if (!dataName || !url.includes('/rest/data')) {
    return url
  }
  const names = dataName.split(':')
  if (names.length < 2) {
    return url
  }
  return `${url.replace(/\/$/, '')}/datasources/${names[0]}/datasets/${names[1]}`
}

/** 归一化属性字段，字段名与 @supermapgis/data-edit 保持一致 */
export function getEditorFields(fields: DataEditorField[] = []) {
  return fields
    .map((field) => ({
      name: field.field || field.name,
      caption: field.alias || field.caption || field.field || field.name,
      display: field.display !== false,
      editable: field.editable !== false
    }))
    .filter((field) => !!field.name)
}

/** 组装数据编辑器使用的数据描述，返回 null 表示该图层不支持编辑 */
export function buildEditorData(layer?: DataEditorLayer | null) {
  if (!layer) {
    return null
  }
  const dataInfo = layer.dataInfo || {}
  const sourceType = getEditorSourceType(dataInfo)
  const datasetUrl = getDatasetUrl(dataInfo)
  if (!sourceType || (sourceType === 'REST_DATA' && !datasetUrl)) {
    return null
  }
  return {
    fields: getEditorFields(layer.fields),
    sourceType,
    dataId: dataInfo.id == null ? `${layer.id}` : `${dataInfo.id}`,
    datasetUrl,
    token: dataInfo.token
  }
}

/** 是否为可编辑的业务图层（排除注记、热力图、图表等无需编辑的图层） */
export function isEditableBusinessLayer(layer: Record<string, any> = {}): boolean {
  if (!layer || layer.type === 'background') {
    return false
  }
  const type = `${layer.type || ''}`.toLowerCase()
  if (UNSUPPORTED_LAYER_TYPES.some((item) => type.includes(item))) {
    return false
  }
  if (type.includes('raster') && layer.dataSource?.type !== 'WFS') {
    return false
  }
  return true
}

/**
 * 基于主地图样式构造弹窗地图样式：
 * 去掉绘制相关图层，并只保留选中图层与背景图层，避免弹窗地图重复渲染全部业务数据
 */
export function buildDialogStyle(
  style: Record<string, any> = {},
  webmap?: any,
  layer?: DataEditorLayer | null
) {
  const clonedStyle: Record<string, any> = cloneDeep(style) || {}
  const selectedRenderLayers = new Set(layer?.renderLayers || [])
  const businessLayerIds = new Set<string>()
  const appreciableLayers: Record<string, any>[] = webmap?.getAppreciableLayers?.() || []
  appreciableLayers.filter(isEditableBusinessLayer).forEach((item) => {
    ;(item.renderLayers || []).forEach((id: string) => businessLayerIds.add(id))
  })

  const keepSourceIds = new Set<string>()
  clonedStyle.layers = ((style.layers || []) as Record<string, any>[]).filter((item) => {
    if (`${item.id}`.includes('draw')) {
      return false
    }
    if (item.type === 'background') {
      return true
    }
    if (selectedRenderLayers.has(item.id)) {
      item.source && keepSourceIds.add(item.source)
      return true
    }
    if (!businessLayerIds.has(item.id)) {
      item.source && keepSourceIds.add(item.source)
      return true
    }
    return false
  })

  const sources: Record<string, any> = {}
  Object.keys(style.sources || {}).forEach((sourceId) => {
    if (keepSourceIds.has(sourceId)) {
      sources[sourceId] = style.sources[sourceId]
    }
  })
  clonedStyle.sources = sources
  return clonedStyle
}

/** 复用主地图的构造函数，避免与使用方的 mapbox 运行时版本不一致 */
export function getMapConstructor(map: any) {
  return map?.constructor || (window as any)?.mapboxgl?.Map
}
