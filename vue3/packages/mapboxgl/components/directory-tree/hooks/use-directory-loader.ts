import type { QueryDirectoryNode, RuntimeTreeNode } from '../types'
import type { IPortalDirectoryResponse } from '../utils/iportal-resource'
import {
  buildQuerySearchRequest,
  createDirectoryEndpoint,
  createQuerySearchEndpoint,
  createRuntimeResourceNode,
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
}

export interface DirectoryLoaderOptions {
  iportalUrl: string
  fetcher?: DirectoryLoaderFetch
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

  async function loadIportalDirectoryChildren(node: RuntimeTreeNode): Promise<DirectoryLoadResult> {
    const rawNode = node.raw as { directoryId: string | number }
    const cacheKey = createIportalDirectoryCacheKey(rawNode.directoryId)
    const cached = directoryCache.get(cacheKey)
    if (cached) {
      return cached
    }

    const response = (await fetcher(
      createDirectoryEndpoint(options.iportalUrl, rawNode.directoryId)
    )) as IPortalDirectoryResponse
    const result = {
      children: normalizeDirectoryResponseToRuntimeNodes({
        directoryResponse: response,
        parentNodeId: node.id,
        icon: node.icon,
        resourceIcon: node.resourceIcon
      })
    }

    directoryCache.set(cacheKey, result)
    return result
  }

  async function loadQueryDirectoryChildren(node: RuntimeTreeNode): Promise<DirectoryLoadResult> {
    const queryNode = node.raw as QueryDirectoryNode
    const cacheKey = createQueryDirectoryCacheKey(queryNode.id)
    const cached = queryCache.get(cacheKey)
    if (cached) {
      return cached
    }

    let currentPage = 1
    const items: Record<string, any>[] = []

    while (true) {
      const request = buildQuerySearchRequest(queryNode.params, currentPage)
      const url = `${createQuerySearchEndpoint(options.iportalUrl)}?${toQuerySearchParams(request)}`
      const response = normalizeQuerySearchResponse(await fetcher(url), request)

      items.push(...response.content)

      if (currentPage >= response.totalPage) {
        break
      }

      currentPage += 1
    }

    const result = {
      children: normalizeQueryRuntimeChildren(node, items)
    }

    queryCache.set(cacheKey, result)
    return result
  }

  async function loadChildren(node: RuntimeTreeNode): Promise<DirectoryLoadResult> {
    if (isQueryDirectoryNode(node)) {
      return loadQueryDirectoryChildren(node)
    }
    if (isIportalDirectoryNode(node)) {
      return loadIportalDirectoryChildren(node)
    }

    return {
      children: node.children || []
    }
  }

  return {
    directoryCache,
    queryCache,
    loadChildren,
    loadIportalDirectoryChildren,
    loadQueryDirectoryChildren
  }
}

