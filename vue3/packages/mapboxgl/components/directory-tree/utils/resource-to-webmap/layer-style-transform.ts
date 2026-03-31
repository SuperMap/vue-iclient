import type { DirectoryTreeMapLayerStyle, SupportedFeatureType } from './types'

function getPaintValue(layerStyle: { paint?: Record<string, any> } | undefined, key: string) {
  return layerStyle?.paint?.[key]
}

function setStyleValue(style: Record<string, any>, key: string, value: unknown) {
  if (value === undefined) {
    return false
  }
  style[key] = value
  return true
}

export function buildDirectoryTreeVectorStyleFromMapLayerStyle(
  featureType: SupportedFeatureType,
  mapLayerStyle?: DirectoryTreeMapLayerStyle
): Record<string, any> | undefined {
  if (!mapLayerStyle) {
    return undefined
  }

  const style: Record<string, any> = {
    type: featureType === 'POINT' ? 'BASIC_POINT' : featureType
  }
  let hasMappedValue = false

  if (featureType === 'POINT') {
    hasMappedValue =
      setStyleValue(style, 'fillColor', getPaintValue(mapLayerStyle.circle, 'circle-color')) || hasMappedValue
    hasMappedValue =
      setStyleValue(style, 'fillOpacity', getPaintValue(mapLayerStyle.circle, 'circle-opacity')) || hasMappedValue
    hasMappedValue = setStyleValue(style, 'radius', getPaintValue(mapLayerStyle.circle, 'circle-radius')) || hasMappedValue
    hasMappedValue =
      setStyleValue(style, 'strokeColor', getPaintValue(mapLayerStyle.circle, 'circle-stroke-color')) || hasMappedValue
    hasMappedValue =
      setStyleValue(style, 'strokeWidth', getPaintValue(mapLayerStyle.circle, 'circle-stroke-width')) || hasMappedValue
    hasMappedValue =
      setStyleValue(style, 'strokeOpacity', getPaintValue(mapLayerStyle.circle, 'circle-stroke-opacity')) ||
      hasMappedValue
  }

  if (featureType === 'LINE') {
    hasMappedValue = setStyleValue(style, 'strokeColor', getPaintValue(mapLayerStyle.line, 'line-color')) || hasMappedValue
    hasMappedValue =
      setStyleValue(style, 'strokeOpacity', getPaintValue(mapLayerStyle.line, 'line-opacity')) || hasMappedValue
    hasMappedValue = setStyleValue(style, 'strokeWidth', getPaintValue(mapLayerStyle.line, 'line-width')) || hasMappedValue
  }

  if (featureType === 'POLYGON') {
    hasMappedValue = setStyleValue(style, 'fillColor', getPaintValue(mapLayerStyle.fill, 'fill-color')) || hasMappedValue
    hasMappedValue =
      setStyleValue(style, 'fillOpacity', getPaintValue(mapLayerStyle.fill, 'fill-opacity')) || hasMappedValue

    if (mapLayerStyle.strokeLine?.paint) {
      hasMappedValue =
        setStyleValue(style, 'strokeColor', getPaintValue(mapLayerStyle.strokeLine, 'line-color')) || hasMappedValue
      hasMappedValue =
        setStyleValue(style, 'strokeWidth', getPaintValue(mapLayerStyle.strokeLine, 'line-width')) || hasMappedValue
      hasMappedValue =
        setStyleValue(style, 'strokeOpacity', getPaintValue(mapLayerStyle.strokeLine, 'line-opacity')) || hasMappedValue
    } else {
      hasMappedValue =
        setStyleValue(style, 'strokeColor', getPaintValue(mapLayerStyle.fill, 'fill-outline-color')) || hasMappedValue
    }
  }

  return hasMappedValue ? style : undefined
}
