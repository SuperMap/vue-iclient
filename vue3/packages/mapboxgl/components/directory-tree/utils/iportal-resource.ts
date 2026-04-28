import type {
  DirectoryNodeType,
  QueryDirectoryQuery,
  QuerySearchRequest,
  QuerySearchResponse,
  QuerySearchResponseItem,
  RestMapCollectionItem,
  RestMapServiceMapRaw,
  RestDataDatasetRef,
  RestDataDatasourceDirectoryRaw,
  RestDataServiceDirectoryRaw,
  ResourceType,
  RuntimeTreeNode,
  WmtsLayerItem,
  WmtsLayerRaw
} from '../types'
import { DIRECTORY_TREE_QUERY_PAGE_SIZE } from '../types'
import { createRemoteDirectoryKey, createResourceNodeKey } from './schema-normalizer'

export interface IPortalDirectoryBasicInfo {
  id: string | number
  dirName?: string
  dirType?: ResourceType
  parentDirId?: string | number | null
}

export interface IPortalDirectoryResourceSummary {
  resourceId: string | number
  resourceName?: string
  title?: string
  updateTime?: number
}

export interface IPortalDirectoryResponse {
  basicDirInfo?: IPortalDirectoryBasicInfo
  basicDirInfos?: IPortalDirectoryBasicInfo[]
  dirResources?: IPortalDirectoryResourceSummary[]
}

interface RuntimeResourceNodeOptions {
  parentNodeId: string
  sourceType: DirectoryNodeType
  resourceType: ResourceType
  resource: Record<string, any>
  icon?: string
}

interface RuntimeRemoteDirectoryNodeOptions {
  parentNodeId: string
  sourceType: Extract<DirectoryNodeType, 'resource-directory'>
  directory: IPortalDirectoryBasicInfo
  checkable: boolean
  icon?: string
  resourceIcon?: string
}

interface RuntimeRestDataDatasourceNodeOptions {
  parentNodeId: string
  sourceType: DirectoryNodeType
  resource: Record<string, any>
  restDataUrl: string
  dataSourceName: string
  icon?: string
  title?: string
}

interface RuntimeRestDataServiceNodeOptions {
  parentNodeId: string
  sourceType: DirectoryNodeType
  resource: Record<string, any>
  restDataUrl: string
  icon?: string
}

interface RuntimeRestMapServiceMapNodeOptions {
  parentNodeId: string
  sourceType: DirectoryNodeType
  originResource: Record<string, any>
  mapItem: RestMapCollectionItem
  icon?: string
}

interface RuntimeWmtsLayerNodeOptions {
  parentNodeId: string
  sourceType: DirectoryNodeType
  originResource: Record<string, any>
  wmtsServiceUrl: string
  layerItem: WmtsLayerItem
  icon?: string
}

function normalizeBaseUrl(iportalUrl: string): string {
  return iportalUrl.endsWith('/') ? iportalUrl.slice(0, -1) : iportalUrl
}

function normalizeArrayParam(values: unknown): string | undefined {
  if (!Array.isArray(values) || !values.length) {
    return undefined
  }
  return JSON.stringify(values)
}

function normalizeObjectParam(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') {
    return undefined
  }
  return JSON.stringify(value)
}

function decodeRestDataPathSegment(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function parseRestDataServiceRootRef(address: unknown): { restDataUrl: string } | undefined {
  if (typeof address !== 'string') {
    return undefined
  }
  const trimmed = address.trim()
  if (!trimmed) {
    return undefined
  }

  const matched = trimmed.match(/^(.*?\/rest)(?:\/data)?\/?(?:\?.*)?(?:#.*)?$/i)
  if (!matched) {
    return undefined
  }

  return {
    restDataUrl: `${matched[1]}/data`
  }
}

function parseDatasourceLevelRestDataRef(address: unknown): RestDataDatasetRef | undefined {
  if (typeof address !== 'string') {
    return undefined
  }
  const trimmed = address.trim()
  if (!trimmed) {
    return undefined
  }

  const matched = trimmed.match(/^(.*?\/rest\/data)\/datasources\/([^/?#]+)\/?(?:\?.*)?(?:#.*)?$/i)
  if (!matched) {
    return undefined
  }

  return {
    restDataUrl: matched[1],
    dataSourceName: decodeRestDataPathSegment(matched[2])
  }
}

function getDatasourceLevelRestDataRef(resource: Record<string, any>): RestDataDatasetRef | undefined {
  return (
    parseDatasourceLevelRestDataRef(resource.url) ||
    parseDatasourceLevelRestDataRef(resource.proxiedUrl) ||
    parseDatasourceLevelRestDataRef(resource.linkPage)
  )
}

function getRestDataServiceRootRef(resource: Record<string, any>): { restDataUrl: string } | undefined {
  return (
    parseRestDataServiceRootRef(resource.url) ||
    parseRestDataServiceRootRef(resource.proxiedUrl) ||
    parseRestDataServiceRootRef(resource.linkPage)
  )
}

function normalizeResponseItems(
  items: unknown,
  request: QuerySearchRequest
): QuerySearchResponseItem[] {
  if (!Array.isArray(items)) {
    return []
  }

  return items.map((item: Record<string, any>) => ({
    ...item,
    id: item.resourceId ?? item.id,
    title: item.title ?? item.resourceName ?? item.name ?? '',
    updateTime: item.updateTime,
    resourceType: item.resourceType ?? request.resourceType,
    sourceType: item.sourceType,
    epsgCode: item.epsgCode,
    projection: item.projection,
    serviceType: item.serviceType ?? item.type,
    url: item.url ?? item.proxiedUrl ?? item.linkPage,
    raw: item
  }))
}

export function createDirectoryEndpoint(iportalUrl: string, directoryId: string | number): string {
  return `${normalizeBaseUrl(iportalUrl)}/web/directories/${directoryId}.json`
}

export function createQuerySearchEndpoint(iportalUrl: string): string {
  return `${normalizeBaseUrl(iportalUrl)}/gateway/catalog/resource/search.rjson`
}

export function buildQuerySearchRequest(
  query: QueryDirectoryQuery,
  currentPage = 1
): QuerySearchRequest {
  return {
    ...query,
    currentPage,
    pageSize: DIRECTORY_TREE_QUERY_PAGE_SIZE
  }
}

export function toQuerySearchParams(request: QuerySearchRequest): URLSearchParams {
  const params = new URLSearchParams()

  params.set('currentPage', String(request.currentPage))
  params.set('pageSize', String(request.pageSize))
  params.set('resourceType', request.resourceType)

  if (request.text) {
    params.set('text', request.text)
  }

  const arrayFields: Array<[keyof QuerySearchRequest, string]> = [
    ['resourceSubTypes', 'resourceSubTypes'],
    ['resourceIds', 'resourceIds'],
    ['tags', 'tags'],
    ['groupIds', 'groupIds'],
    ['departmentIds', 'departmentIds']
  ]

  arrayFields.forEach(([fieldName, queryKey]) => {
    const value = normalizeArrayParam(request[fieldName])
    if (value) {
      params.set(queryKey, value)
    }
  })

  if (request.searchType) {
    params.set('searchType', request.searchType)
  }
  const boundingBox = normalizeObjectParam(request.boundingBox)
  if (boundingBox) {
    params.set('boundingBox', boundingBox)
  }
  const aggregationTypes = normalizeArrayParam(request.aggregationTypes)
  if (aggregationTypes) {
    params.set('aggregationTypes', aggregationTypes)
  }
  if (request.orderBy) {
    params.set('orderBy', request.orderBy)
  }
  if (request.orderType) {
    params.set('orderType', request.orderType)
  }

  return params
}

export function normalizeQuerySearchResponse(
  response: Record<string, any>,
  request: QuerySearchRequest
): QuerySearchResponse {
  const total = Number(response.total ?? response.totalElements ?? 0)
  const totalPage = Number(response.totalPage ?? response.totalPages ?? 0)
  const currentPage = Number(response.currentPage ?? request.currentPage)
  const pageSize = Number(response.pageSize ?? request.pageSize)
  const content = normalizeResponseItems(
    response.content ?? response.records ?? response.items ?? [],
    request
  )

  return {
    total,
    totalPage,
    currentPage,
    pageSize,
    content
  }
}

export function createRuntimeRemoteDirectoryNode(
  options: RuntimeRemoteDirectoryNodeOptions
): RuntimeTreeNode {
  const key = createRemoteDirectoryKey(options.parentNodeId, options.directory.id)

  return {
    key,
    id: key,
    parentKey: options.parentNodeId,
    title: options.directory.dirName || String(options.directory.id),
    icon: options.icon,
    resourceIcon: options.resourceIcon,
    kind: 'directory',
    sourceType: options.sourceType,
    isLeaf: false,
    checkable: options.checkable,
    disabled: false,
    loadState: 'idle',
    raw: {
      type: 'resource-directory',
      id: key,
      title: options.directory.dirName,
      icon: options.icon,
      resourceIcon: options.resourceIcon,
      directoryId: options.directory.id,
      dirType: options.directory.dirType,
      parentDirId: options.directory.parentDirId
    }
  }
}

export function createRuntimeRestDataDatasourceNode(
  options: RuntimeRestDataDatasourceNodeOptions
): RuntimeTreeNode {
  const resourceId = options.resource.id ?? options.resource.resourceId ?? options.dataSourceName
  const key = createRemoteDirectoryKey(options.parentNodeId, `rest-data:${resourceId}:${options.dataSourceName}`)
  const title =
    options.title ?? options.resource.title ?? options.resource.resourceName ?? options.resource.name ?? options.dataSourceName

  const raw: RestDataDatasourceDirectoryRaw = {
    type: 'rest-data-datasource',
    resourceId,
    resourceType: 'DATA',
    serviceType: options.resource.serviceType ?? options.resource.type,
    url: options.resource.url ?? options.resource.proxiedUrl ?? options.resource.linkPage,
    restDataUrl: options.restDataUrl,
    dataSourceName: options.dataSourceName,
    originResource: options.resource
  }

  return {
    key,
    id: key,
    parentKey: options.parentNodeId,
    title,
    icon: options.icon,
    resourceIcon: options.icon,
    kind: 'directory',
    sourceType: options.sourceType,
    isLeaf: false,
    checkable: false,
    disabled: false,
    loadState: 'idle',
    raw
  }
}

export function createRuntimeRestDataServiceNode(
  options: RuntimeRestDataServiceNodeOptions
): RuntimeTreeNode {
  const resourceId = options.resource.id ?? options.resource.resourceId ?? options.restDataUrl
  const key = createRemoteDirectoryKey(options.parentNodeId, `rest-data-service:${resourceId}`)
  const title =
    options.resource.title ?? options.resource.resourceName ?? options.resource.name ?? String(resourceId)

  const raw: RestDataServiceDirectoryRaw = {
    type: 'rest-data-service',
    resourceId,
    resourceType: 'DATA',
    serviceType: options.resource.serviceType ?? options.resource.type,
    url: options.resource.url ?? options.resource.proxiedUrl ?? options.resource.linkPage,
    restDataUrl: options.restDataUrl,
    originResource: options.resource
  }

  return {
    key,
    id: key,
    parentKey: options.parentNodeId,
    title,
    icon: options.icon,
    resourceIcon: options.icon,
    kind: 'directory',
    sourceType: options.sourceType,
    isLeaf: false,
    checkable: false,
    disabled: false,
    loadState: 'idle',
    raw
  }
}

export function createRuntimeRestMapServiceMapNode(
  options: RuntimeRestMapServiceMapNodeOptions
): RuntimeTreeNode {
  const originResourceId =
    options.originResource.resourceId ?? options.originResource.id ?? options.mapItem.name
  const resourceId = `${originResourceId}:${options.mapItem.name}`
  const serviceType =
    options.originResource.serviceType === 'VECTOR_MAP' || options.originResource.serviceType === 'SINGLE_VECTOR_MAP'
      ? 'VECTOR_MAP'
      : 'MAP'
  const resource: RestMapServiceMapRaw = {
    type: 'rest-map-service-map',
    resourceId,
    resourceType: 'SERVICE',
    serviceType,
    url: options.mapItem.path,
    mapName: options.mapItem.name,
    originResource: options.originResource
  }

  return createRuntimeResourceNode({
    parentNodeId: options.parentNodeId,
    sourceType: options.sourceType,
    resourceType: 'SERVICE',
    resource: {
      ...options.originResource,
      ...resource,
      id: resourceId,
      title: options.mapItem.name,
      resourceName: options.mapItem.name,
      serverUrl: options.mapItem.path
    },
    icon: options.icon
  })
}

export function createRuntimeWmtsLayerNode(options: RuntimeWmtsLayerNodeOptions): RuntimeTreeNode {
  const originResourceId =
    options.originResource.resourceId ?? options.originResource.id ?? options.wmtsServiceUrl
  const layerResourceId = `${originResourceId}:${options.layerItem.layer}`
  const originServiceInfo =
    options.originResource.serviceInfo && typeof options.originResource.serviceInfo === 'object'
      ? options.originResource.serviceInfo
      : {}
  const resource: WmtsLayerRaw = {
    type: 'wmts-layer',
    resourceId: layerResourceId,
    resourceType: 'SERVICE',
    serviceType: 'WMTS',
    url: options.wmtsServiceUrl,
    layer: options.layerItem.layer,
    layerID: options.layerItem.layerID,
    tileMatrixSet: options.layerItem.tileMatrixSet,
    originResource: options.originResource
  }

  return createRuntimeResourceNode({
    parentNodeId: options.parentNodeId,
    sourceType: options.sourceType,
    resourceType: 'SERVICE',
    resource: {
      ...options.originResource,
      ...resource,
      id: layerResourceId,
      title: options.layerItem.name,
      resourceName: options.layerItem.name,
      serverUrl: options.wmtsServiceUrl,
      serviceInfo: {
        ...originServiceInfo,
        layer: options.layerItem.layer,
        layerID: options.layerItem.layerID,
        tileMatrixSet: options.layerItem.tileMatrixSet
      }
    },
    icon: options.icon
  })
}

export function createRuntimeResourceNode(options: RuntimeResourceNodeOptions): RuntimeTreeNode {
  const isRestDataLikeResource =
    options.resourceType === 'DATA' || options.resource.serviceType === 'DATA' || options.resource.type === 'DATA'
  const restDataServiceRootRef =
    isRestDataLikeResource &&
    !options.resource.restDataDatasetRef &&
    options.resource.serviceType !== 'DATASET' &&
    options.resource.type !== 'DATASET' &&
    !/\/datasources\/[^/?#]+/i.test(
      String(options.resource.url ?? options.resource.proxiedUrl ?? options.resource.linkPage ?? '')
    )
      ? getRestDataServiceRootRef(options.resource)
      : undefined
  if (restDataServiceRootRef) {
    return createRuntimeRestDataServiceNode({
      parentNodeId: options.parentNodeId,
      sourceType: options.sourceType,
      resource: options.resource,
      restDataUrl: restDataServiceRootRef.restDataUrl,
      icon: options.icon
    })
  }

  const datasourceLevelRestDataRef =
    isRestDataLikeResource &&
    !options.resource.restDataDatasetRef &&
    options.resource.serviceType !== 'DATASET' &&
    options.resource.type !== 'DATASET'
      ? getDatasourceLevelRestDataRef(options.resource)
      : undefined
  if (datasourceLevelRestDataRef) {
    return createRuntimeRestDataDatasourceNode({
      parentNodeId: options.parentNodeId,
      sourceType: options.sourceType,
      resource: options.resource,
      restDataUrl: datasourceLevelRestDataRef.restDataUrl,
      dataSourceName: datasourceLevelRestDataRef.dataSourceName,
      icon: options.icon
    })
  }

  const resourceId = options.resource.id ?? options.resource.resourceId
  const title = options.resource.title ?? options.resource.resourceName ?? String(resourceId)
  const key = createResourceNodeKey(options.parentNodeId, options.resourceType, resourceId)

  return {
    key,
    id: key,
    parentKey: options.parentNodeId,
    title,
    icon: options.icon,
    kind: 'resource',
    sourceType: options.sourceType,
    isLeaf: true,
    checkable: true,
    disabled: false,
    loadState: 'loaded',
    raw: {
      ...options.resource,
      resourceId,
      resourceType: options.resourceType
    }
  }
}

export function createRuntimeRestDataDatasetNode({
  parentNodeId,
  sourceType,
  restDataUrl,
  dataSourceName,
  datasetName,
  originResource,
  icon
}: {
  parentNodeId: string
  sourceType: DirectoryNodeType
  restDataUrl: string
  dataSourceName: string
  datasetName: string
  originResource: Record<string, any>
  icon?: string
}): RuntimeTreeNode {
  const originResourceId = originResource.id ?? originResource.resourceId ?? dataSourceName
  const resource = {
    ...originResource,
    id: `${originResourceId}:${dataSourceName}:${datasetName}`,
    resourceId: `${originResourceId}:${dataSourceName}:${datasetName}`,
    title: datasetName,
    resourceName: datasetName,
    resourceType: 'DATA' as const,
    type: 'DATASET',
    serviceType: 'DATASET',
    url: `${restDataUrl}/datasources/${encodeURIComponent(dataSourceName)}/datasets/${encodeURIComponent(datasetName)}`,
    proxiedUrl: undefined,
    linkPage: undefined,
    restDataDatasetRef: {
      restDataUrl,
      dataSourceName,
      datasetName
    },
    originResource
  }

  return createRuntimeResourceNode({
    parentNodeId,
    sourceType,
    resourceType: 'DATA',
    resource,
    icon
  })
}

export function normalizeDirectoryResponseToRuntimeNodes({
  directoryResponse,
  parentNodeId,
  directoryCheckable,
  icon,
  resourceIcon
}: {
  directoryResponse: IPortalDirectoryResponse
  parentNodeId: string
  directoryCheckable: boolean
  icon?: string
  resourceIcon?: string
}): RuntimeTreeNode[] {
  const resourceType = directoryResponse.basicDirInfo?.dirType ?? 'MAP'
  const remoteDirectories = (directoryResponse.basicDirInfos || []).map(directory =>
    createRuntimeRemoteDirectoryNode({
      parentNodeId,
      sourceType: 'resource-directory',
      directory,
      checkable: directoryCheckable,
      icon,
      resourceIcon
    })
  )
  const resources = (directoryResponse.dirResources || []).map(resource =>
    createRuntimeResourceNode({
      parentNodeId,
      sourceType: 'resource-directory',
      resourceType,
      resource: resource as Record<string, any>,
      icon: resourceIcon
    })
  )

  return remoteDirectories.concat(resources)
}
