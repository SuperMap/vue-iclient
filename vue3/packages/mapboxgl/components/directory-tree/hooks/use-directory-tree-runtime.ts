import type { Ref } from 'vue'
import type { EventDataNode } from 'ant-design-vue/es/tree'
import type {
  DirectoryTreeProps,
  ResourceDescriptor,
  RestDataDatasourceDirectoryRaw,
  RestDataServiceDirectoryRaw,
  RestMapServiceCollectionRaw,
  RuntimeNodeOperationState,
  RuntimeTreeNode,
  WmtsServiceDirectoryRaw
} from '../types'
import { normalizeDirectoryTreeOrEmpty } from '../utils/schema-normalizer'
import type { useDirectoryLoader } from './use-directory-loader'
import type { useResourceLayerManager } from './use-resource-layer-manager'
import type { useResourceResolver } from './use-resource-resolver'

export interface DirectoryTreeRuntimeOptions {
  runtimeNodes: Ref<RuntimeTreeNode[]>
  expandedKeys: Ref<string[]>
  checkedResourceMap: Ref<Map<string, ResourceDescriptor>>
  checkedKeys: Ref<string[]>
  halfCheckedKeys: Ref<string[]>
  mapTarget: () => string | undefined
  loader: ReturnType<typeof useDirectoryLoader>
  resolver: ReturnType<typeof useResourceResolver>
  resourceLayerManager: ReturnType<typeof useResourceLayerManager>
  getMapProjection: () => string | undefined
  onLoadedChildren?: () => void
}

function isRuntimeTreeNode(node: EventDataNode | RuntimeTreeNode): node is RuntimeTreeNode {
  return 'id' in node && 'kind' in node && 'sourceType' in node && 'loadState' in node
}

export function useDirectoryTreeRuntime(options: DirectoryTreeRuntimeOptions) {
  function isRestDataDirectoryRaw(
    raw: unknown
  ): raw is RestDataServiceDirectoryRaw | RestDataDatasourceDirectoryRaw {
    return (
      !!raw &&
      typeof raw === 'object' &&
      ((raw as RestDataServiceDirectoryRaw).type === 'rest-data-service' ||
        (raw as RestDataDatasourceDirectoryRaw).type === 'rest-data-datasource')
    )
  }

  function isRestMapServiceCollectionRaw(raw: unknown): raw is RestMapServiceCollectionRaw {
    return !!raw && typeof raw === 'object' && (raw as RestMapServiceCollectionRaw).type === 'rest-map-service-collection'
  }

  function isWmtsServiceDirectoryRaw(raw: unknown): raw is WmtsServiceDirectoryRaw {
    return !!raw && typeof raw === 'object' && (raw as WmtsServiceDirectoryRaw).type === 'wmts-service'
  }

  function convertNodeToRestDataDirectory(
    node: RuntimeTreeNode,
    raw: RestDataServiceDirectoryRaw | RestDataDatasourceDirectoryRaw
  ) {
    node.pendingValidation = false
    node.resource = undefined
    node.kind = 'directory'
    node.isLeaf = false
    node.checkable = false
    node.disabled = false
    node.disabledReason = undefined
    node.loadState = 'idle'
    node.children = undefined
    node.raw = raw
  }

  function convertNodeToRestMapCollection(node: RuntimeTreeNode, raw: RestMapServiceCollectionRaw) {
    node.pendingValidation = false
    node.resource = undefined
    node.kind = 'directory'
    node.isLeaf = false
    node.checkable = false
    node.disabled = false
    node.disabledReason = undefined
    node.loadState = 'idle'
    node.children = undefined
    node.raw = raw
  }

  function convertNodeToWmtsServiceDirectory(node: RuntimeTreeNode, raw: WmtsServiceDirectoryRaw) {
    node.pendingValidation = false
    node.resource = undefined
    node.kind = 'directory'
    node.isLeaf = false
    node.checkable = false
    node.disabled = false
    node.disabledReason = undefined
    node.loadState = 'idle'
    node.children = undefined
    node.raw = raw
  }

  function getResolvedNodeDisabledReason(descriptor: ResourceDescriptor) {
    return options.resolver.getCheckFailure(descriptor, {
      mapTarget: options.mapTarget()
    })
  }

  function syncResolvedNodeState(node: RuntimeTreeNode, descriptor: ResourceDescriptor) {
    if (isRestDataDirectoryRaw(descriptor.raw)) {
      convertNodeToRestDataDirectory(node, descriptor.raw)
      return
    }

    if (isRestMapServiceCollectionRaw(descriptor.raw)) {
      convertNodeToRestMapCollection(node, descriptor.raw)
      return
    }

    if (isWmtsServiceDirectoryRaw(descriptor.raw)) {
      convertNodeToWmtsServiceDirectory(node, descriptor.raw)
      return
    }

    const disabledReason = getResolvedNodeDisabledReason(descriptor)
    node.pendingValidation = false
    node.resource = descriptor
    node.disabled = !!disabledReason
    node.disabledReason = disabledReason
    node.checkable = descriptor.overlaySupported && !disabledReason
  }

  function findNodeByKey(key: string, nodes = options.runtimeNodes.value): RuntimeTreeNode | undefined {
    for (const node of nodes) {
      if (node.key === key) {
        return node
      }
      if (node.children?.length) {
        const match = findNodeByKey(key, node.children)
        if (match) {
          return match
        }
      }
    }
  }

  async function resolveResourceNode(node: RuntimeTreeNode) {
    if (!node.resource) {
      node.resource = await options.resolver.resolveResourceNode(node, {
        mapProjection: options.getMapProjection()
      })
    }
    syncResolvedNodeState(node, node.resource)
    return node.resource
  }

  async function refreshResolvedNodeStates(nodes = options.runtimeNodes.value, forceResolve = false) {
    for (const node of nodes) {
      if (node.kind === 'resource') {
        const descriptor =
          !forceResolve && node.resource
            ? node.resource
            : await options.resolver.resolveResourceNode(node, {
                mapProjection: options.getMapProjection()
              })
        syncResolvedNodeState(node, descriptor)
        continue
      }
      if (node.children?.length) {
        await refreshResolvedNodeStates(node.children, forceResolve)
      }
    }
  }

  async function refreshDirectoryNodeTitles(nodes = options.runtimeNodes.value) {
    for (const node of nodes) {
      const rawNode = node.raw as { title?: string; directoryId?: string | number } | undefined
      if (
        node.kind === 'directory' &&
        node.sourceType === 'resource-directory' &&
        rawNode &&
        !rawNode.title &&
        (typeof rawNode.directoryId === 'string' || typeof rawNode.directoryId === 'number')
      ) {
        await options.loader.loadIportalDirectoryChildren(node)
      }
      if (node.children?.length) {
        await refreshDirectoryNodeTitles(node.children)
      }
    }
  }

  async function decorateTreeNodes(nodes: RuntimeTreeNode[]) {
    for (const node of nodes) {
      if (node.kind === 'resource') {
        await resolveResourceNode(node)
      } else if (node.children?.length) {
        await decorateTreeNodes(node.children)
      }
    }
  }

  function markNodesAsPendingValidation(nodes: RuntimeTreeNode[]) {
    for (const node of nodes) {
      if (node.kind === 'resource') {
        node.pendingValidation = true
        node.checkable = false
        node.disabled = false
        node.disabledReason = undefined
        continue
      }
      if (node.children?.length) {
        markNodesAsPendingValidation(node.children)
      }
    }
  }

  function setNodeOperationState(node: RuntimeTreeNode, operationState?: RuntimeNodeOperationState) {
    node.operationState = operationState
  }

  function setDirectoryBatchProgress(
    node: RuntimeTreeNode,
    action: RuntimeNodeOperationState,
    completed: number,
    total: number
  ) {
    if (node.kind !== 'directory') {
      return
    }
    node.batchProgress = {
      action,
      completed,
      total
    }
  }

  function clearDirectoryBatchProgress(node: RuntimeTreeNode) {
    if (node.kind !== 'directory') {
      return
    }
    node.batchProgress = undefined
  }

  function isNodeBusy(node: RuntimeTreeNode): boolean {
    return !!node.pendingValidation || !!node.operationState || !!node.batchProgress || node.loadState === 'loading'
  }

  function isNodeSelectionBlocked(node: RuntimeTreeNode): boolean {
    const allowLoadingDirectorySelection =
      node.kind === 'directory' && node.loadState === 'loading' && !node.operationState && !node.batchProgress
    return isNodeBusy(node) && !allowLoadingDirectorySelection
  }

  async function loadNodeChildren(treeNode: EventDataNode | RuntimeTreeNode) {
    const runtimeNode = findNodeByKey(String(treeNode.key)) || (isRuntimeTreeNode(treeNode) ? treeNode : undefined)
    if (!runtimeNode) {
      return
    }
    if (runtimeNode.kind !== 'directory') {
      return
    }
    if (runtimeNode.loadState === 'loaded' || runtimeNode.loadState === 'loading') {
      return
    }

    runtimeNode.loadState = 'loading'
    try {
      const result = await options.loader.loadChildren(runtimeNode)
      runtimeNode.children = result.children
      markNodesAsPendingValidation(runtimeNode.children)
      await decorateTreeNodes(runtimeNode.children)
      runtimeNode.loadState = 'loaded'
      options.onLoadedChildren?.()
    } catch (error) {
      runtimeNode.loadState = 'error'
      runtimeNode.disabledReason = 'load-failed'
      throw error
    }
  }

  async function ensureDirectoryLoaded(node: RuntimeTreeNode) {
    if (node.kind !== 'directory') {
      return
    }
    if (node.sourceType !== 'default' && node.loadState !== 'loaded') {
      await loadNodeChildren(node)
    }
  }

  async function ensureDescendantsLoaded(node: RuntimeTreeNode) {
    await ensureDirectoryLoaded(node)
    for (const child of node.children || []) {
      if (child.kind === 'directory') {
        await ensureDescendantsLoaded(child)
      }
    }
  }

  function collectDescendantResourceNodes(node: RuntimeTreeNode): RuntimeTreeNode[] {
    const results: RuntimeTreeNode[] = []
    for (const child of node.children || []) {
      if (child.kind === 'resource') {
        results.push(child)
      } else {
        results.push(...collectDescendantResourceNodes(child))
      }
    }
    return results
  }

  async function resetTree(treeSchema: DirectoryTreeProps['treeSchema']) {
    const normalized = normalizeDirectoryTreeOrEmpty(treeSchema)
    options.loader.clearCaches()
    options.runtimeNodes.value = normalized.rootNodes
    options.expandedKeys.value = []
    options.checkedResourceMap.value = new Map()
    options.checkedKeys.value = []
    options.halfCheckedKeys.value = []
    await options.resourceLayerManager.clearResources({ mapTarget: options.mapTarget() })
    await refreshDirectoryNodeTitles(options.runtimeNodes.value)
    await refreshResolvedNodeStates(options.runtimeNodes.value, true)
  }

  return {
    resetTree,
    findNodeByKey,
    resolveResourceNode,
    refreshResolvedNodeStates,
    refreshDirectoryNodeTitles,
    loadNodeChildren,
    ensureDirectoryLoaded,
    ensureDescendantsLoaded,
    collectDescendantResourceNodes,
    setNodeOperationState,
    setDirectoryBatchProgress,
    clearDirectoryBatchProgress,
    isNodeBusy,
    isNodeSelectionBlocked
  }
}
