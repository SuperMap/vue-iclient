import type { ResourceDescriptor } from '../../types'
import type {
  PortalDataMetadata,
  ResourceLoadPlanBuildOptions,
  ResourceToWebMapFetch,
  RestDataMetadata,
  SupportedFeatureType,
  XYField
} from './types'
import { ResourceLoadPlanError } from './types'
import {
  appendPath,
  asRecord,
  defaultFetcher,
  normalizeBaseUrl,
  normalizePortalDataType,
  normalizeProjection,
  splitUrlQuery
} from './shared'
import {
  buildMinimalVectorStyle,
  getDescriptorRaw,
  getPassthroughLayerInfo
} from './map-info'
import { buildDirectoryTreeVectorStyleFromMapLayerStyle } from './layer-style-transform'

const STRUCTURED_DATA_SOURCE_TYPE = 'USER_DATA'
const STRUCTURED_DATA_TYPE = 'STRUCTUREDDATA'
const STRUCTURED_DATA_LOAD_LIMIT = 5000

const X_FIELD_NAMES = ['x', 'smx', 'jd', '缁忓害', '涓滅粡', 'longitude', 'lot', 'lon', 'long', 'lng', 'x鍧愭爣']
const Y_FIELD_NAMES = ['y', 'smy', 'wd', '绾害', '鍖楃含', 'latitude', 'lat', 'y鍧愭爣']

function normalizeFeatureType(value: unknown): SupportedFeatureType | undefined {
  if (typeof value !== 'string') {
    return undefined
  }
  const upper = value.trim().toUpperCase()
  if (!upper) {
    return undefined
  }
  if (upper === 'POINT' || upper === 'MULTIPOINT') {
    return 'POINT'
  }
  if (upper === 'LINE' || upper === 'LINESTRING' || upper === 'MULTILINESTRING') {
    return 'LINE'
  }
  if (upper === 'REGION' || upper === 'POLYGON' || upper === 'MULTIPOLYGON') {
    return 'POLYGON'
  }
  return undefined
}

function isKnownXField(fieldName: string): boolean {
  return X_FIELD_NAMES.includes(fieldName.trim().toLowerCase())
}

function isKnownYField(fieldName: string): boolean {
  return Y_FIELD_NAMES.includes(fieldName.trim().toLowerCase())
}

function extractXYFieldFromNames(fieldNames: unknown): XYField | undefined {
  if (!Array.isArray(fieldNames)) {
    return undefined
  }

  let xField: string | undefined
  let yField: string | undefined

  fieldNames.forEach(fieldName => {
    if (typeof fieldName !== 'string') {
      return
    }
    if (!xField && isKnownXField(fieldName)) {
      xField = fieldName
    }
    if (!yField && isKnownYField(fieldName)) {
      yField = fieldName
    }
  })

  if (!xField || !yField) {
    return undefined
  }

  return {
    xField,
    yField
  }
}

function getFeatureCollectionFirstFeature(payload: Record<string, any> | undefined) {
  const features = Array.isArray(payload?.features)
    ? payload?.features
    : Array.isArray(payload?.content?.features)
      ? payload.content.features
      : undefined
  return Array.isArray(features) && features.length > 0 ? features[0] : undefined
}

function getFirstGeometryCoordinate(coordinates: unknown): number[] | undefined {
  if (!Array.isArray(coordinates) || !coordinates.length) {
    return undefined
  }
  if (typeof coordinates[0] === 'number') {
    return coordinates as number[]
  }
  return getFirstGeometryCoordinate(coordinates[0])
}

function inferProjectionFromFeature(feature: Record<string, any> | undefined): string | undefined {
  const coordinate = getFirstGeometryCoordinate(feature?.geometry?.coordinates)
  if (!coordinate || coordinate.length < 2) {
    return undefined
  }
  const [x, y] = coordinate
  if (typeof x !== 'number' || typeof y !== 'number' || Number.isNaN(x) || Number.isNaN(y)) {
    return undefined
  }
  const isLonLat = x > -180 && x < 180 && y > -180 && y < 180
  return isLonLat ? 'EPSG:4326' : 'EPSG:3857'
}

function inferMetadataFromFeatureCollection(payload: Record<string, any> | undefined): PortalDataMetadata | undefined {
  const feature = getFeatureCollectionFirstFeature(payload)
  const featureType = normalizeFeatureType(feature?.geometry?.type)
  if (!featureType) {
    return undefined
  }

  const properties = feature && typeof feature === 'object' ? asRecord(feature.properties) : {}
  const xyField = featureType === 'POINT' ? extractXYFieldFromNames(Object.keys(properties)) || undefined : undefined

  return {
    featureType,
    xyField,
    projection: inferProjectionFromFeature(feature)
  }
}

function inferMetadataFromDataMetaInfo(dataMetaInfo: Record<string, any> | undefined): PortalDataMetadata | undefined {
  if (!dataMetaInfo) {
    return undefined
  }

  const xyField =
    typeof dataMetaInfo.xField === 'string' && typeof dataMetaInfo.yField === 'string'
      ? {
          xField: dataMetaInfo.xField,
          yField: dataMetaInfo.yField
        }
      : undefined

  const explicitFeatureType = normalizeFeatureType(
    dataMetaInfo.featureType ?? dataMetaInfo.geometryType ?? dataMetaInfo.geometry ?? dataMetaInfo.datasetType
  )
  if (explicitFeatureType) {
    return {
      featureType: explicitFeatureType,
      xyField
    }
  }

  if (xyField) {
    return {
      featureType: 'POINT',
      xyField
    }
  }

  const fieldInfos = Array.isArray(dataMetaInfo.fieldInfos)
    ? dataMetaInfo.fieldInfos.map((fieldInfo: Record<string, any>) => fieldInfo?.name)
    : undefined
  const fieldNames = fieldInfos || dataMetaInfo.fieldNames
  const inferredXYField = extractXYFieldFromNames(fieldNames)
  if (inferredXYField) {
    return {
      featureType: 'POINT',
      xyField: inferredXYField
    }
  }

  return undefined
}

function tryParseJsonString(value: unknown): any {
  if (typeof value !== 'string') {
    return value
  }

  try {
    return JSON.parse(value)
  } catch (_error) {
    return value
  }
}

function inferMetadataFromJsonLikeContent(content: unknown): PortalDataMetadata | undefined {
  const featureCollectionMetadata = inferMetadataFromFeatureCollection(asRecord(content))
  if (featureCollectionMetadata) {
    return featureCollectionMetadata
  }

  const candidates = Array.isArray(content) ? content : content && typeof content === 'object' ? [content] : []
  const firstCandidate = candidates.find(candidate => candidate && typeof candidate === 'object')
  const candidateRecord = asRecord(firstCandidate)
  const featureType = normalizeFeatureType(candidateRecord.geometry?.type)
  if (!featureType) {
    return undefined
  }

  const properties = asRecord(candidateRecord.properties)
  const xyField = featureType === 'POINT' ? extractXYFieldFromNames(Object.keys(properties)) : undefined
  return {
    featureType,
    xyField
  }
}

function inferMetadataFromTableContent(content: unknown): PortalDataMetadata | undefined {
  const tablePayload = asRecord(content)
  const xyField = extractXYFieldFromNames(tablePayload.colTitles)
  if (!xyField) {
    return undefined
  }

  return {
    featureType: 'POINT',
    xyField
  }
}

function inferMetadataFromShpContent(content: unknown): PortalDataMetadata | undefined {
  const contentRecord = asRecord(content)
  const layers = Array.isArray(contentRecord.layers) ? contentRecord.layers : []
  if (!layers.length) {
    return undefined
  }
  return inferMetadataFromFeatureCollection(asRecord(layers[0]))
}

function inferMetadataFromContentPayload(payload: Record<string, any> | undefined): PortalDataMetadata | undefined {
  if (!payload) {
    return undefined
  }

  const contentType = normalizePortalDataType(payload.type ?? payload.dataType)
  const parsedContent = tryParseJsonString(payload.content)
  const contentPayload = parsedContent && typeof parsedContent === 'object' ? parsedContent : payload.content

  if (contentType === 'JSON' || contentType === 'GEOJSON') {
    return inferMetadataFromJsonLikeContent(contentPayload) || inferMetadataFromJsonLikeContent(payload)
  }

  if (contentType === 'EXCEL' || contentType === 'CSV') {
    return inferMetadataFromTableContent(contentPayload) || inferMetadataFromTableContent(payload)
  }

  if (contentType === 'SHP') {
    return inferMetadataFromShpContent(contentPayload) || inferMetadataFromShpContent(payload)
  }

  return (
    inferMetadataFromFeatureCollection(payload) ||
    inferMetadataFromFeatureCollection(asRecord(contentPayload)) ||
    inferMetadataFromTableContent(contentPayload) ||
    inferMetadataFromTableContent(payload)
  )
}

function getFirstStructuredDatasetInfo(payload: unknown): Record<string, any> | undefined {
  if (Array.isArray(payload)) {
    return asRecord(payload[0])
  }

  const payloadRecord = asRecord(payload)
  const candidateLists = [payloadRecord.datasets, payloadRecord.datasetInfos, payloadRecord.result, payloadRecord.content]
  const datasetList = candidateLists.find(Array.isArray)
  if (Array.isArray(datasetList)) {
    return asRecord(datasetList[0])
  }

  const datasetInfo = asRecord(payloadRecord.datasetInfo)
  if (datasetInfo.type || datasetInfo.featureType || datasetInfo.datasetType || datasetInfo.geometryType) {
    return datasetInfo
  }

  return undefined
}

function getFirstStructuredDatasetName(payload: unknown): string | undefined {
  if (Array.isArray(payload)) {
    const firstItem = payload[0]
    if (typeof firstItem === 'string' && firstItem.trim()) {
      return firstItem.trim()
    }
    const firstRecord = asRecord(firstItem)
    return (
      (typeof firstRecord.name === 'string' && firstRecord.name.trim()) ||
      (typeof firstRecord.datasetName === 'string' && firstRecord.datasetName.trim()) ||
      undefined
    )
  }

  const payloadRecord = asRecord(payload)
  const datasetNames = Array.isArray(payloadRecord.datasetNames) ? payloadRecord.datasetNames : undefined
  if (Array.isArray(datasetNames) && typeof datasetNames[0] === 'string' && datasetNames[0].trim()) {
    return datasetNames[0].trim()
  }

  const datasetInfo = getFirstStructuredDatasetInfo(payloadRecord)
  return (
    (typeof datasetInfo?.name === 'string' && datasetInfo.name.trim()) ||
    (typeof datasetInfo?.datasetName === 'string' && datasetInfo.datasetName.trim()) ||
    undefined
  )
}

function inferMetadataFromStructuredDatasets(payload: unknown): PortalDataMetadata | undefined {
  const datasetInfo = getFirstStructuredDatasetInfo(payload)
  const featureType = normalizeFeatureType(
    datasetInfo?.type ?? datasetInfo?.featureType ?? datasetInfo?.datasetType ?? datasetInfo?.geometryType
  )
  if (!featureType) {
    return undefined
  }

  return {
    featureType
  }
}

function normalizeRestDataServiceUrl(address: string | undefined): string | undefined {
  if (!address || typeof address !== 'string') {
    return undefined
  }
  const trimmed = address.trim()
  if (!trimmed) {
    return undefined
  }

  const { base, query } = splitUrlQuery(trimmed)
  let normalizedBase = base.replace(/\/+$/, '')
  const datasetMatch = normalizedBase.match(/^(.*?\/rest\/data)\/datasources\/[^/?#]+\/datasets\/[^/?#]+(?:\/.*)?$/i)
  if (datasetMatch) {
    normalizedBase = datasetMatch[1]
    return query ? `${normalizedBase}?${query}` : normalizedBase
  }
  const datasourceMatch = normalizedBase.match(/^(.*?\/rest\/data)\/datasources\/[^/?#]+(?:\/.*)?$/i)
  if (datasourceMatch) {
    normalizedBase = datasourceMatch[1]
    return query ? `${normalizedBase}?${query}` : normalizedBase
  }
  if (/\/rest\/data(?:$|\/)/i.test(normalizedBase)) {
    return query ? `${normalizedBase}?${query}` : normalizedBase
  }
  if (/\/rest(?:$|\/)/i.test(normalizedBase)) {
    normalizedBase = `${normalizedBase}/data`
    return query ? `${normalizedBase}?${query}` : normalizedBase
  }
  return appendPath(trimmed, 'data')
}

async function fetchRequiredJson(fetcher: ResourceToWebMapFetch, url: string): Promise<any> {
  try {
    return await fetcher(url)
  } catch (_error) {
    throw new ResourceLoadPlanError('service-unavailable', `Service endpoint is unavailable: ${url}`)
  }
}

async function fetchOptionalJson(fetcher: ResourceToWebMapFetch, url: string): Promise<Record<string, any> | undefined> {
  try {
    const result = await fetcher(url)
    return result && typeof result === 'object' ? (result as Record<string, any>) : undefined
  } catch (_error) {
    return undefined
  }
}

function buildStructuredDataItemsUrl(dataBaseUrl: string, limit: number, offset?: number): string {
  const baseUrl = `${dataBaseUrl}/structureddata/ogc-features/collections/all/items.json?limit=${limit}`
  return typeof offset === 'number' ? `${baseUrl}&offset=${offset}` : baseUrl
}

function buildStructuredDatasetDetailUrl(dataBaseUrl: string, datasetName: string): string {
  return `${dataBaseUrl}/datasets/${encodeURIComponent(datasetName)}.json`
}

function shouldUseStructuredDataDirectUrl(raw: Record<string, any>): boolean {
  const dataInfo = asRecord(raw.dataInfo)
  const dataType = normalizePortalDataType(dataInfo.type ?? dataInfo.dataType)
  if (dataType === STRUCTURED_DATA_TYPE) {
    return true
  }
  return normalizePortalDataType(raw.portalDataContentType) === STRUCTURED_DATA_TYPE
}

async function ensurePortalDataMetadata(
  descriptor: ResourceDescriptor,
  options: ResourceLoadPlanBuildOptions
): Promise<PortalDataMetadata> {
  const raw = getDescriptorRaw(descriptor)
  if (raw.portalDataMetadata) {
    return raw.portalDataMetadata as PortalDataMetadata
  }

  const passthroughLayerInfo = getPassthroughLayerInfo(raw)
  if (passthroughLayerInfo?.featureType) {
    const featureType = normalizeFeatureType(passthroughLayerInfo.featureType)
    if (featureType) {
      const metadata = {
        featureType,
        xyField: passthroughLayerInfo.xyField
      }
      raw.portalDataMetadata = metadata
      return metadata
    }
  }

  const dataInfo = asRecord(raw.dataInfo)
  const explicitDataType = normalizePortalDataType(dataInfo.type ?? dataInfo.dataType)
  const metadataFromDetail =
    inferMetadataFromDataMetaInfo(asRecord(dataInfo.dataMetaInfo)) ||
    inferMetadataFromFeatureCollection(asRecord(raw.geoJSON)) ||
    inferMetadataFromFeatureCollection(Array.isArray(raw.features) ? { features: raw.features } : undefined)
  if (metadataFromDetail) {
    raw.portalDataMetadata = metadataFromDetail
    return metadataFromDetail
  }

  const fetcher = options.fetcher || defaultFetcher
  const dataBaseUrl = `${normalizeBaseUrl(options.iportalUrl)}/web/datas/${descriptor.resourceId}`

  const tryStructuredMetadata = async () => {
    const structuredMetadata = await fetchOptionalJson(fetcher, buildStructuredDataItemsUrl(dataBaseUrl, 1))
    const metadataFromStructured = inferMetadataFromFeatureCollection(structuredMetadata)
    if (metadataFromStructured) {
      raw.portalDataContentType = STRUCTURED_DATA_TYPE
      raw.portalDataMetadata = metadataFromStructured
      return metadataFromStructured
    }
    return undefined
  }

  const tryStructuredDatasetsMetadata = async () => {
    try {
      const datasetsMetadata = await fetcher(`${dataBaseUrl}/datasets.json`)
      const metadataFromDatasets = inferMetadataFromStructuredDatasets(datasetsMetadata)
      if (metadataFromDatasets) {
        raw.portalDataContentType = STRUCTURED_DATA_TYPE
        raw.portalDataMetadata = metadataFromDatasets
        return metadataFromDatasets
      }

      const datasetName = getFirstStructuredDatasetName(datasetsMetadata)
      if (!datasetName) {
        return undefined
      }

      const datasetDetail = await fetchOptionalJson(fetcher, buildStructuredDatasetDetailUrl(dataBaseUrl, datasetName))
      const metadataFromDatasetDetail = inferMetadataFromStructuredDatasets(datasetDetail)
      if (metadataFromDatasetDetail) {
        raw.portalDataContentType = STRUCTURED_DATA_TYPE
        raw.portalDataMetadata = metadataFromDatasetDetail
        return metadataFromDatasetDetail
      }
    } catch (_error) {
      return undefined
    }
    return undefined
  }

  const tryContentMetadata = async () => {
    const contentMetadata = await fetchOptionalJson(fetcher, `${dataBaseUrl}/content.json?pageSize=1&currentPage=1`)
    const metadataFromContent = inferMetadataFromContentPayload(contentMetadata)
    if (metadataFromContent) {
      raw.portalDataMetadata = metadataFromContent
      return metadataFromContent
    }
    return undefined
  }

  if (explicitDataType === STRUCTURED_DATA_TYPE) {
    const metadataFromStructured = await tryStructuredMetadata()
    if (metadataFromStructured) {
      return metadataFromStructured
    }

    const metadataFromDatasets = await tryStructuredDatasetsMetadata()
    if (metadataFromDatasets) {
      return metadataFromDatasets
    }
  } else if (explicitDataType) {
    const metadataFromContent = await tryContentMetadata()
    if (metadataFromContent) {
      return metadataFromContent
    }
  } else {
    const metadataFromStructured = await tryStructuredMetadata()
    if (metadataFromStructured) {
      return metadataFromStructured
    }

    const metadataFromContent = await tryContentMetadata()
    if (metadataFromContent) {
      return metadataFromContent
    }
  }

  throw new ResourceLoadPlanError('unsupported-resource-type', `Unsupported DATA resource: ${descriptor.key}`)
}

async function ensureRestDataMetadata(
  descriptor: ResourceDescriptor,
  options: ResourceLoadPlanBuildOptions
): Promise<RestDataMetadata> {
  const raw = getDescriptorRaw(descriptor)
  if (raw.restDataMetadata?.featureType && raw.restDataMetadata?.datasetInfo) {
    return raw.restDataMetadata as RestDataMetadata
  }

  const serviceInfo = asRecord(raw.serviceInfo)
  const restDataUrl = normalizeRestDataServiceUrl(serviceInfo.address || serviceInfo.url || descriptor.serverUrl)
  if (!restDataUrl) {
    throw new ResourceLoadPlanError('load-failed', `Missing DATA service address for ${descriptor.key}`)
  }

  const fetcher = options.fetcher || defaultFetcher
  const resolvedDatasetRef = asRecord(raw.restDataDatasetRef)
  const dataSourceNameFromRef =
    typeof resolvedDatasetRef.dataSourceName === 'string' && resolvedDatasetRef.dataSourceName.trim()
      ? resolvedDatasetRef.dataSourceName.trim()
      : undefined
  const datasetNameFromRef =
    typeof resolvedDatasetRef.datasetName === 'string' && resolvedDatasetRef.datasetName.trim()
      ? resolvedDatasetRef.datasetName.trim()
      : undefined

  if (dataSourceNameFromRef && datasetNameFromRef) {
    const datasetResponse = await fetchRequiredJson(
      fetcher,
      appendPath(
        restDataUrl,
        `datasources/${encodeURIComponent(dataSourceNameFromRef)}/datasets/${encodeURIComponent(datasetNameFromRef)}.json`
      )
    )
    const datasetInfo = asRecord(datasetResponse?.datasetInfo ?? datasetResponse)
    const featureType = normalizeFeatureType(datasetInfo.type)
    if (!featureType) {
      throw new ResourceLoadPlanError('unsupported-service-type', `Unsupported DATA service dataset type for ${descriptor.key}`)
    }

    const metadata = {
      restDataUrl,
      dataSourceName: dataSourceNameFromRef,
      datasetName: datasetNameFromRef,
      datasetInfo,
      featureType
    }
    raw.restDataMetadata = metadata
    return metadata
  }

  if (dataSourceNameFromRef) {
    const datasetList = await fetchRequiredJson(
      fetcher,
      appendPath(restDataUrl, `datasources/${encodeURIComponent(dataSourceNameFromRef)}/datasets.json`)
    )
    const datasetName = datasetList?.datasetNames?.[0]
    if (!datasetName) {
      throw new ResourceLoadPlanError('unsupported-service-type', `Missing dataset for ${descriptor.key}`)
    }

    const datasetResponse = await fetchRequiredJson(
      fetcher,
      appendPath(
        restDataUrl,
        `datasources/${encodeURIComponent(dataSourceNameFromRef)}/datasets/${encodeURIComponent(datasetName)}.json`
      )
    )
    const datasetInfo = asRecord(datasetResponse?.datasetInfo ?? datasetResponse)
    const featureType = normalizeFeatureType(datasetInfo.type)
    if (!featureType) {
      throw new ResourceLoadPlanError('unsupported-service-type', `Unsupported DATA service dataset type for ${descriptor.key}`)
    }

    const metadata = {
      restDataUrl,
      dataSourceName: dataSourceNameFromRef,
      datasetName,
      datasetInfo,
      featureType
    }
    raw.restDataMetadata = metadata
    return metadata
  }

  const datasourceInfo = await fetchRequiredJson(fetcher, appendPath(restDataUrl, 'datasources.json'))
  const dataSourceName = datasourceInfo?.datasourceNames?.[0]
  if (!dataSourceName) {
    throw new ResourceLoadPlanError('unsupported-service-type', `Missing datasource for ${descriptor.key}`)
  }

  const datasetList = await fetchRequiredJson(
    fetcher,
    appendPath(restDataUrl, `datasources/${encodeURIComponent(dataSourceName)}/datasets.json`)
  )
  const datasetName = datasetList?.datasetNames?.[0]
  if (!datasetName) {
    throw new ResourceLoadPlanError('unsupported-service-type', `Missing dataset for ${descriptor.key}`)
  }

  const datasetResponse = await fetchRequiredJson(
    fetcher,
    appendPath(restDataUrl, `datasources/${encodeURIComponent(dataSourceName)}/datasets/${encodeURIComponent(datasetName)}.json`)
  )
  const datasetInfo = asRecord(datasetResponse?.datasetInfo ?? datasetResponse)
  const featureType = normalizeFeatureType(datasetInfo.type)
  if (!featureType) {
    throw new ResourceLoadPlanError('unsupported-service-type', `Unsupported DATA service dataset type for ${descriptor.key}`)
  }

  const metadata = {
    restDataUrl,
    dataSourceName,
    datasetName,
    datasetInfo,
    featureType
  }
  raw.restDataMetadata = metadata
  return metadata
}

function resolveVectorLayerStyle(featureType: SupportedFeatureType, options: ResourceLoadPlanBuildOptions) {
  return (
    buildDirectoryTreeVectorStyleFromMapLayerStyle(featureType, options.mapLayerStyle) ||
    buildMinimalVectorStyle(featureType)
  )
}

export async function resolvePortalDataLayer(
  descriptor: ResourceDescriptor,
  options: ResourceLoadPlanBuildOptions
): Promise<Record<string, any>> {
  const raw = getDescriptorRaw(descriptor)
  const useStructuredDataDirectUrl = shouldUseStructuredDataDirectUrl(raw)
  const metadata = await ensurePortalDataMetadata(descriptor, options)
  const dataBaseUrl = `${normalizeBaseUrl(options.iportalUrl)}/web/datas/${descriptor.resourceId}`
  const layer: Record<string, any> = {
    layerType: 'VECTOR',
    name: descriptor.name,
    visible: true,
    featureType: metadata.featureType,
    style: resolveVectorLayerStyle(metadata.featureType, options),
    dataSource: useStructuredDataDirectUrl
      ? {
          type: STRUCTURED_DATA_SOURCE_TYPE,
          url: buildStructuredDataItemsUrl(dataBaseUrl, STRUCTURED_DATA_LOAD_LIMIT)
        }
      : {
          type: 'PORTAL_DATA',
          serverId: descriptor.resourceId
        }
  }
  if (metadata.xyField) {
    layer.xyField = metadata.xyField
  }
  const normalizedProjection = normalizeProjection(metadata.projection ?? descriptor.projection)
  if (normalizedProjection) {
    layer.projection = normalizedProjection
  }
  return layer
}

export async function resolveRestDataServiceLayer(
  descriptor: ResourceDescriptor,
  options: ResourceLoadPlanBuildOptions
): Promise<Record<string, any>> {
  const metadata = await ensureRestDataMetadata(descriptor, options)
  const layer = {
    layerType: 'VECTOR',
    name: descriptor.name,
    visible: true,
    featureType: metadata.featureType,
    style: resolveVectorLayerStyle(metadata.featureType, options),
    dataSource: {
      type: 'REST_DATA',
      url: metadata.restDataUrl,
      dataSourceName: `${metadata.dataSourceName}:${metadata.datasetName}`
    }
  }
  const prjCoordSys = asRecord(metadata.datasetInfo.prjCoordSys)
  const normalizedProjection = normalizeProjection(
    prjCoordSys.epsgCode ??
      prjCoordSys.projection ??
      metadata.datasetInfo.projection ??
      metadata.datasetInfo.epsgCode ??
      descriptor.projection
  )
  if (normalizedProjection) {
    ;(layer as Record<string, any>).projection = normalizedProjection
  }
  return layer
}
