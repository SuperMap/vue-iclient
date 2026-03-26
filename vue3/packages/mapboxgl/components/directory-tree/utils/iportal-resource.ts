import type {
  DirectoryNodeType,
  QueryDirectoryQuery,
  QuerySearchRequest,
  QuerySearchResponse,
  QuerySearchResponseItem,
  ResourceType,
  RuntimeTreeNode
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
  icon?: string
  resourceIcon?: string
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
    serviceType: item.serviceType,
    url: item.url,
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
    params.set('keywords', request.text)
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
    checkable: true,
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

export function createRuntimeResourceNode(options: RuntimeResourceNodeOptions): RuntimeTreeNode {
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

export function normalizeDirectoryResponseToRuntimeNodes({
  directoryResponse,
  parentNodeId,
  icon,
  resourceIcon
}: {
  directoryResponse: IPortalDirectoryResponse
  parentNodeId: string
  icon?: string
  resourceIcon?: string
}): RuntimeTreeNode[] {
  const resourceType = directoryResponse.basicDirInfo?.dirType ?? 'MAP'
  const remoteDirectories = (directoryResponse.basicDirInfos || []).map(directory =>
    createRuntimeRemoteDirectoryNode({
      parentNodeId,
      sourceType: 'resource-directory',
      directory,
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
