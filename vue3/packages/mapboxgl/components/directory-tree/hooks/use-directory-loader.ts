import type {
  QueryDirectoryNode,
  RestDataDatasourceDirectoryRaw,
  RestDataServiceDirectoryRaw,
  RestMapServiceCollectionRaw,
  RuntimeTreeNode,
  WmtsServiceDirectoryRaw
} from '../types'
import type { IPortalDirectoryResponse } from '../utils/iportal-resource'
import {
  buildQuerySearchRequest,
  createDirectoryEndpoint,
  createQuerySearchEndpoint,
  createRuntimeRestDataDatasourceNode,
  createRuntimeRestMapServiceMapNode,
  createRuntimeRestDataDatasetNode,
  createRuntimeResourceNode,
  createRuntimeWmtsLayerNode,
  normalizeDirectoryResponseToRuntimeNodes,
  normalizeQuerySearchResponse,
  toQuerySearchParams
} from '../utils/iportal-resource'
import { defaultDirectoryTreeFetcher } from '../utils/fetcher'
import { createIportalDirectoryCacheKey, createQueryDirectoryCacheKey } from '../utils/schema-normalizer'

export interface DirectoryLoaderFetch {
  (url: string): Promise<any>
}

export interface DirectoryLoadResult {
  children: RuntimeTreeNode[]
  title?: string
}

export interface DirectoryLoaderOptions {
  iportalUrl: string
  directoryCheckable: boolean
  fetcher?: DirectoryLoaderFetch
}

export interface DirectoryLoaderContextUpdate {
  iportalUrl?: string
  directoryCheckable?: boolean
}

function resolveQueryTotalPages(response: {
  total: number
  totalPage: number
  pageSize: number
  content: Record<string, any>[]
}): number {
  if (Number.isInteger(response.totalPage) && response.totalPage > 0) {
    return response.totalPage
  }

  const pageSize = Number.isInteger(response.pageSize) && response.pageSize > 0 ? response.pageSize : 0
  if (pageSize > 0 && Number.isFinite(response.total) && response.total > 0) {
    return Math.max(1, Math.ceil(response.total / pageSize))
  }

  return 1
}

function isQueryDirectoryNode(node: RuntimeTreeNode): node is RuntimeTreeNode & { raw: QueryDirectoryNode } {
  return !!node.raw && typeof node.raw === 'object' && (node.raw as QueryDirectoryNode).type === 'resource-search'
}

function isIportalDirectoryNode(node: RuntimeTreeNode): boolean {
  if (node.sourceType !== 'resource-directory') {
    return false
  }
  return !!node.raw && typeof node.raw === 'object' && 'directoryId' in (node.raw as Record<string, any>)
}

function isRestDataDatasourceNode(node: RuntimeTreeNode): node is RuntimeTreeNode & { raw: RestDataDatasourceDirectoryRaw } {
  return !!node.raw && typeof node.raw === 'object' && (node.raw as RestDataDatasourceDirectoryRaw).type === 'rest-data-datasource'
}

function isRestDataServiceNode(node: RuntimeTreeNode): node is RuntimeTreeNode & { raw: RestDataServiceDirectoryRaw } {
  return !!node.raw && typeof node.raw === 'object' && (node.raw as RestDataServiceDirectoryRaw).type === 'rest-data-service'
}

function isRestMapServiceCollectionNode(
  node: RuntimeTreeNode
): node is RuntimeTreeNode & { raw: RestMapServiceCollectionRaw } {
  return !!node.raw && typeof node.raw === 'object' && (node.raw as RestMapServiceCollectionRaw).type === 'rest-map-service-collection'
}

function isWmtsServiceNode(node: RuntimeTreeNode): node is RuntimeTreeNode & { raw: WmtsServiceDirectoryRaw } {
  return !!node.raw && typeof node.raw === 'object' && (node.raw as WmtsServiceDirectoryRaw).type === 'wmts-service'
}

function normalizeQueryRuntimeChildren(node: RuntimeTreeNode, responseItems: Record<string, any>[]) {
  return responseItems.map(item =>
    createRuntimeResourceNode({
      parentNodeId: node.id,
      sourceType: 'resource-search',
      resourceType: item.resourceType,
      resource: item,
      icon: node.resourceIcon
    })
  )
}

export function useDirectoryLoader(options: DirectoryLoaderOptions) {
  const fetcher = options.fetcher || defaultDirectoryTreeFetcher
  const directoryCache = new Map<string, DirectoryLoadResult>()
  const queryCache = new Map<string, DirectoryLoadResult>()
  const restDataServiceCache = new Map<string, DirectoryLoadResult>()
  const restDataDatasourceCache = new Map<string, DirectoryLoadResult>()
  const restMapServiceCache = new Map<string, DirectoryLoadResult>()
  const wmtsServiceCache = new Map<string, DirectoryLoadResult>()
  let currentIportalUrl = options.iportalUrl
  let currentDirectoryCheckable = options.directoryCheckable

  function clearCaches() {
    directoryCache.clear()
    queryCache.clear()
    restDataServiceCache.clear()
    restDataDatasourceCache.clear()
    restMapServiceCache.clear()
    wmtsServiceCache.clear()
  }

  function updateContext(nextContext: DirectoryLoaderContextUpdate) {
    const nextIportalUrl = nextContext.iportalUrl ?? currentIportalUrl
    const nextDirectoryCheckable = nextContext.directoryCheckable ?? currentDirectoryCheckable
    const shouldResetCaches =
      nextIportalUrl !== currentIportalUrl || nextDirectoryCheckable !== currentDirectoryCheckable

    currentIportalUrl = nextIportalUrl
    currentDirectoryCheckable = nextDirectoryCheckable

    if (shouldResetCaches) {
      clearCaches()
    }
  }

  async function loadIportalDirectoryChildren(node: RuntimeTreeNode): Promise<DirectoryLoadResult> {
    const rawNode = node.raw as { title?: string; directoryId: string | number }
    const cacheKey = createIportalDirectoryCacheKey(rawNode.directoryId)
    const cached = directoryCache.get(cacheKey)
    if (cached) {
      if (!rawNode.title && cached.title) {
        node.title = cached.title
      }
      return cached
    }

    const response = (await fetcher(
      createDirectoryEndpoint(currentIportalUrl, rawNode.directoryId)
    )) as IPortalDirectoryResponse
    const remoteDirectoryName = response.basicDirInfo?.dirName
    const title = typeof remoteDirectoryName === 'string' ? remoteDirectoryName.trim() : undefined
    if (!rawNode.title && title) {
      node.title = title
    }
    const result: DirectoryLoadResult = {
      children: normalizeDirectoryResponseToRuntimeNodes({
        directoryResponse: response,
        parentNodeId: node.id,
        directoryCheckable: currentDirectoryCheckable,
        icon: node.icon,
        resourceIcon: node.resourceIcon
      })
    }
    if (title) {
      result.title = title
    }

    directoryCache.set(cacheKey, result)
    return result
  }

  async function loadQueryDirectoryChildren(node: RuntimeTreeNode): Promise<DirectoryLoadResult> {
    const queryNode = node.raw as QueryDirectoryNode
    const cacheKey = createQueryDirectoryCacheKey(queryNode.id, queryNode.params)
    const cached = queryCache.get(cacheKey)
    if (cached) {
      return cached
    }

    let totalPages = 1
    const items: Record<string, any>[] = []

    for (let currentPage = 1; currentPage <= totalPages; currentPage += 1) {
      const request = buildQuerySearchRequest(queryNode.params, currentPage)
      const url = `${createQuerySearchEndpoint(currentIportalUrl)}?${toQuerySearchParams(request)}`
      const response = normalizeQuerySearchResponse(await fetcher(url), request)

      items.push(...response.content)
      totalPages = resolveQueryTotalPages(response)
    }

    const result = {
      children: normalizeQueryRuntimeChildren(node, items)
    }

    queryCache.set(cacheKey, result)
    return result
  }

  async function loadRestDataDatasourceChildren(node: RuntimeTreeNode): Promise<DirectoryLoadResult> {
    const rawNode = node.raw as RestDataDatasourceDirectoryRaw
    const cacheKey = `${rawNode.restDataUrl}:${rawNode.dataSourceName}`
    const cached = restDataDatasourceCache.get(cacheKey)
    if (cached) {
      return cached
    }

    const datasetList = (await fetcher(
      `${rawNode.restDataUrl}/datasources/${encodeURIComponent(rawNode.dataSourceName)}/datasets.json`
    )) as {
      datasetNames?: string[]
    }
    const datasetNames = Array.isArray(datasetList?.datasetNames)
      ? datasetList.datasetNames.filter((name): name is string => typeof name === 'string' && !!name.trim())
      : []
    const result = {
      children: datasetNames.map(datasetName =>
        createRuntimeRestDataDatasetNode({
          parentNodeId: node.id,
          sourceType: node.sourceType,
          restDataUrl: rawNode.restDataUrl,
          dataSourceName: rawNode.dataSourceName,
          datasetName,
          originResource: rawNode.originResource,
          icon: node.resourceIcon
        })
      )
    }

    restDataDatasourceCache.set(cacheKey, result)
    return result
  }

  async function loadRestDataServiceChildren(node: RuntimeTreeNode): Promise<DirectoryLoadResult> {
    const rawNode = node.raw as RestDataServiceDirectoryRaw
    const cacheKey = rawNode.restDataUrl
    const cached = restDataServiceCache.get(cacheKey)
    if (cached) {
      return cached
    }

    const datasourceList = (await fetcher(`${rawNode.restDataUrl}/datasources.json`)) as {
      datasourceNames?: string[]
    }
    const datasourceNames = Array.isArray(datasourceList?.datasourceNames)
      ? datasourceList.datasourceNames.filter((name): name is string => typeof name === 'string' && !!name.trim())
      : []

    if (datasourceNames.length === 1) {
      const dataSourceName = datasourceNames[0]
      const datasetList = (await fetcher(
        `${rawNode.restDataUrl}/datasources/${encodeURIComponent(dataSourceName)}/datasets.json`
      )) as {
        datasetNames?: string[]
      }
      const datasetNames = Array.isArray(datasetList?.datasetNames)
        ? datasetList.datasetNames.filter((name): name is string => typeof name === 'string' && !!name.trim())
        : []

      const result = {
        children: datasetNames.map(datasetName =>
          createRuntimeRestDataDatasetNode({
            parentNodeId: node.id,
            sourceType: node.sourceType,
            restDataUrl: rawNode.restDataUrl,
            dataSourceName,
            datasetName,
            originResource: rawNode.originResource,
            icon: node.resourceIcon
          })
        )
      }

      restDataServiceCache.set(cacheKey, result)
      return result
    }

    const result = {
      children: datasourceNames.map(dataSourceName =>
        createRuntimeRestDataDatasourceNode({
          parentNodeId: node.id,
          sourceType: node.sourceType,
          resource: rawNode.originResource,
          restDataUrl: rawNode.restDataUrl,
          dataSourceName,
          icon: node.resourceIcon,
          title: dataSourceName
        })
      )
    }

    restDataServiceCache.set(cacheKey, result)
    return result
  }

  async function loadRestMapServiceChildren(node: RuntimeTreeNode): Promise<DirectoryLoadResult> {
    const rawNode = node.raw as RestMapServiceCollectionRaw
    const cacheKey = `${rawNode.resourceId}:${rawNode.restServiceUrl}`
    const cached = restMapServiceCache.get(cacheKey)
    if (cached) {
      return cached
    }

    const result = {
      children: rawNode.mapItems.map(mapItem =>
        createRuntimeRestMapServiceMapNode({
          parentNodeId: node.id,
          sourceType: node.sourceType,
          originResource: rawNode.originResource,
          mapItem,
          icon: node.resourceIcon
        })
      )
    }

    restMapServiceCache.set(cacheKey, result)
    return result
  }

  async function loadWmtsServiceChildren(node: RuntimeTreeNode): Promise<DirectoryLoadResult> {
    const rawNode = node.raw as WmtsServiceDirectoryRaw
    const cacheKey = `${rawNode.resourceId}:${rawNode.wmtsServiceUrl}`
    const cached = wmtsServiceCache.get(cacheKey)
    if (cached) {
      return cached
    }

    const result = {
      children: rawNode.layerItems.map(layerItem =>
        createRuntimeWmtsLayerNode({
          parentNodeId: node.id,
          sourceType: node.sourceType,
          originResource: rawNode.originResource,
          wmtsServiceUrl: rawNode.wmtsServiceUrl,
          layerItem,
          icon: node.resourceIcon
        })
      )
    }

    wmtsServiceCache.set(cacheKey, result)
    return result
  }

  async function loadChildren(node: RuntimeTreeNode): Promise<DirectoryLoadResult> {
    if (isQueryDirectoryNode(node)) {
      return loadQueryDirectoryChildren(node)
    }
    if (isIportalDirectoryNode(node)) {
      return loadIportalDirectoryChildren(node)
    }
    if (isRestDataServiceNode(node)) {
      return loadRestDataServiceChildren(node)
    }
    if (isRestDataDatasourceNode(node)) {
      return loadRestDataDatasourceChildren(node)
    }
    if (isRestMapServiceCollectionNode(node)) {
      return loadRestMapServiceChildren(node)
    }
    if (isWmtsServiceNode(node)) {
      return loadWmtsServiceChildren(node)
    }

    return {
      children: node.children || []
    }
  }

  return {
    directoryCache,
    queryCache,
    restDataServiceCache,
    restDataDatasourceCache,
    restMapServiceCache,
    wmtsServiceCache,
    clearCaches,
    updateContext,
    loadChildren,
    loadIportalDirectoryChildren,
    loadQueryDirectoryChildren,
    loadRestDataServiceChildren,
    loadRestDataDatasourceChildren,
    loadRestMapServiceChildren,
    loadWmtsServiceChildren
  }
}

