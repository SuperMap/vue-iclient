import type { DisabledReasonCode } from '../../types'

export interface ResourceToWebMapFetch {
  (url: string): Promise<any>
}

export interface MapSnapshotPoint {
  x: number
  y: number
}

export interface MapSnapshot {
  projection?: string | null
  extent?: {
    leftBottom: MapSnapshotPoint
    rightTop: MapSnapshotPoint
  }
  center?: MapSnapshotPoint
  level?: number
  baseLayer?: Record<string, any>
}

export interface DirectoryTreeMapLayerStyle {
  circle?: {
    paint?: Record<string, any>
    layout?: Record<string, any>
  }
  line?: {
    paint?: Record<string, any>
    layout?: Record<string, any>
  }
  fill?: {
    paint?: Record<string, any>
    layout?: Record<string, any>
  }
  strokeLine?: {
    paint?: Record<string, any>
    layout?: Record<string, any>
  }
}

export interface ResourceLoadPlanBuildOptions {
  iportalUrl: string
  mapSnapshot?: MapSnapshot
  withCredentials?: boolean
  fetcher?: ResourceToWebMapFetch
  mapLayerStyle?: DirectoryTreeMapLayerStyle
}

export type SupportedFeatureType = 'POINT' | 'LINE' | 'POLYGON'

export interface XYField {
  xField: string
  yField: string
}

export interface PortalDataMetadata {
  featureType: SupportedFeatureType
  xyField?: XYField
  projection?: string
}

export interface RestDataMetadata {
  restDataUrl: string
  dataSourceName: string
  datasetName: string
  datasetInfo: Record<string, any>
  featureType: SupportedFeatureType
}

export class ResourceLoadPlanError extends Error {
  reason: DisabledReasonCode

  constructor(reason: DisabledReasonCode, message?: string) {
    super(message || reason)
    this.name = 'ResourceLoadPlanError'
    this.reason = reason
  }
}
